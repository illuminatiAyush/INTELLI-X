import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Video, Calendar, Clock, History, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { fetchLectures, createLecture, updateLectureStatus } from '../../services/lectureService'
import { upsertLectureAttendance } from '../../services/attendanceService'
import LectureCard from '../../components/lectures/LectureCard'
import LiveAttendanceModal from '../../components/lectures/LiveAttendanceModal'
import { CardSkeleton } from '../../components/ui/Skeletons'

const LecturesPage = ({ hideHeader = false }) => {
  const { user, role, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('scheduled')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(null)
  
  // Create Form State
  const [newLecture, setNewLecture] = useState({
    title: '',
    batch_id: '',
    scheduled_date: '',
    scheduled_hour: '',
    scheduled_min: '',
    status: 'scheduled'
  })
  
  const [myBatches, setMyBatches] = useState([])

  const { data: lectures, loading, refetch } = useAppQuery(`lectures-${user?.id}-${role}`, async () => {
    if (!profile) return []

    let batchIds = []

    if (role === 'admin' || role === 'master_admin') {
      const { data: bs } = await supabase
        .from('batches').select('id').eq('institute_id', profile.institute_id)
      batchIds = (bs || []).map(b => b.id)
    } else if (role === 'teacher') {
      const { data: bs1 } = await supabase
        .from('batches').select('id').eq('teacher_id', profile.id)
      const { data: bs2 } = await supabase
        .from('batches').select('id').eq('teacher_profile_id', profile.id)
      const combined = [...(bs1 || []), ...(bs2 || [])]
      batchIds = combined.map(b => b.id)
      if (!batchIds.length) {
        return await fetchLectures({ teacher_profile_id: profile.id })
      }
    } else if (role === 'student') {
      const { data: bs } = await supabase
        .from('batch_students').select('batch_id').eq('student_id', user.id)
      batchIds = (bs || []).map(b => b.batch_id)
    }

    if (!batchIds.length) return []
    return await fetchLectures({ batch_ids: batchIds })
  }, { enabled: !!profile, staleTime: 0 })

  useEffect(() => {
    // Fetch batches for dropdowns
    const getBatches = async () => {
      if (!profile) return
      let q = supabase.from('batches').select('id, name')
      if (role === 'admin') q = q.eq('institute_id', profile.institute_id)
      if (role === 'teacher') q = q.eq('teacher_profile_id', profile.id)
      if (role === 'student') {
        const { data: bs } = await supabase.from('batch_students').select('batch_id').eq('student_id', user.id)
        if (bs?.length) q = q.in('id', bs.map(b => b.batch_id))
        else return
      }
      const { data } = await q
      if (data) setMyBatches(data)
    }
    getBatches()
  }, [profile, role, user])

  // Realtime subscription — force refetch on any change
  useEffect(() => {
    if (!profile) return

    const channel = supabase
      .channel(`lecture-changes-${user?.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lecture_sessions' },
        (payload) => {
          console.log('Realtime lecture change:', payload)
          refetch()
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    // Also poll every 15 seconds as fallback
    const poll = setInterval(() => refetch(), 15000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [profile, user?.id, refetch])

  const handleCreateLecture = async (e) => {
    e.preventDefault()
    if (!newLecture.title || !newLecture.batch_id) return toast.error('Please fill all fields')
    
    // Combine separate date + time into ISO string
    let scheduled_at = ''
    if (newLecture.status === 'scheduled') {
      if (!newLecture.scheduled_date) return toast.error('Please select a date')
      if (!newLecture.scheduled_hour || !newLecture.scheduled_min) return toast.error('Please enter both hour and minute')
      const h = newLecture.scheduled_hour.padStart(2, '0')
      const m = newLecture.scheduled_min.padStart(2, '0')
      if (parseInt(h) > 23) return toast.error('Hour must be 0-23')
      if (parseInt(m) > 59) return toast.error('Minute must be 0-59')
      scheduled_at = new Date(`${newLecture.scheduled_date}T${h}:${m}:00`).toISOString()
    }

    try {
      const payload = {
        title: newLecture.title,
        batch_id: newLecture.batch_id,
        status: newLecture.status,
        created_by: profile.id,
        institute_id: profile.institute_id,
        ...(scheduled_at && { scheduled_at }),
        ...(role === 'teacher' && { teacher_profile_id: profile.id }),
      }

      const created = await createLecture(payload)
      toast.success('Lecture scheduled!')
      sendNotifications(created, 'scheduled')
      setShowCreateModal(false)
      setNewLecture({ title: '', batch_id: '', scheduled_date: '', scheduled_hour: '', scheduled_min: '', status: 'scheduled' })
      refetch()
    } catch (err) {
      console.error('Create lecture error:', err)
      toast.error(err.message || 'Failed to create lecture')
    }
  }

  const sendNotifications = async (lecture, type) => {
    try {
      // Step 1: get student_ids from batch_students
      const { data: bsRows } = await supabase
        .from('batch_students')
        .select('student_id')
        .eq('batch_id', lecture.batch_id)

      console.log('batch_students rows:', bsRows)

      if (!bsRows?.length) {
        console.warn('No students in batch:', lecture.batch_id)
        return
      }

      const rawIds = bsRows.map(r => r.student_id).filter(Boolean)

      // Step 2: resolve auth UUIDs via students.profile_id
      const { data: studentProfiles } = await supabase
        .from('students')
        .select('id, profile_id')
        .in('id', rawIds)

      console.log('studentProfiles:', studentProfiles)

      let recipientIds = []
      if (studentProfiles?.length) {
        recipientIds = studentProfiles.map(s => s.profile_id).filter(Boolean)
      } else {
        // student_id in batch_students is already the auth UUID
        recipientIds = rawIds
      }

      console.log('recipientIds:', recipientIds)
      if (!recipientIds.length) return

      const titleMap = {
        live: '🔴 Lecture is Live Now!',
        ended: '✅ Lecture Ended',
        cancelled: '❌ Lecture Cancelled',
        scheduled: '📅 New Lecture Scheduled',
      }
      const messageMap = {
        live: `"${lecture.title}" has started. Join now!`,
        ended: `"${lecture.title}" has ended.`,
        cancelled: `"${lecture.title}" has been cancelled.`,
        scheduled: `"${lecture.title}" has been scheduled for your batch.`,
      }

      let successCount = 0
      for (const uid of recipientIds) {
        const { error } = await supabase.rpc('insert_notification', {
          p_user_id: uid,
          p_institute_id: lecture.institute_id || profile.institute_id,
          p_title: titleMap[type] || titleMap.scheduled,
          p_message: messageMap[type] || messageMap.scheduled,
        })
        if (error) console.error('❌ notif error for', uid, error.message)
        else successCount++
      }
      console.log('✅ Notifications sent:', successCount, '/', recipientIds.length)
    } catch (err) {
      console.error('sendNotifications exception:', err)
    }
  }
  const [joiningLecture, setJoiningLecture] = useState(null)

  const handleJoin = async (lecture) => {
    setJoiningLecture(lecture.id)
    try {
      const today = new Date().toISOString().split('T')[0]
      await upsertLectureAttendance([{
        lecture_id: lecture.id,
        student_id: user.id,
        batch_id: lecture.batch_id,
        date: today,
        status: 'present',
      }])
      
      // Show success popup when student joins the class
      toast.success(`🎉 You've successfully joined "${lecture.title}"!`, {
        duration: 4000,
        style: {
          background: '#10B981',
          color: 'white',
          fontWeight: 'bold',
        },
      })
    } catch (err) {
      console.error('Join attendance error:', err)
      // Show error popup if join fails
      toast.error('Failed to join class. Please try again.', {
        duration: 3000,
      })
    } finally {
      setJoiningLecture(null)
    }
  }

  const handleStatusChange = async (lectureId, newStatus) => {
    try {
      const updatedLecture = await updateLectureStatus(lectureId, newStatus)
      toast.success(newStatus === 'live' ? 'Lecture started!' : newStatus === 'completed' ? 'Lecture ended.' : 'Lecture cancelled.')
      if (newStatus === 'live' && updatedLecture) sendNotifications(updatedLecture, 'live')
      if (newStatus === 'completed' && updatedLecture) sendNotifications(updatedLecture, 'ended')
      if (newStatus === 'cancelled' && updatedLecture) sendNotifications(updatedLecture, 'cancelled')
      refetch()
    } catch (err) {
      toast.error(err.message || 'Action failed')
    }
  }

  const liveLectures = (lectures || []).filter(l => l.status === 'live')
  const scheduledLectures = (lectures || []).filter(l => l.status === 'scheduled')
  const completedLectures = (lectures || []).filter(l => l.status === 'completed' || l.status === 'cancelled')

  const tabs = [
    { id: 'live', label: 'Live Sessions', icon: Video, count: liveLectures.length },
    { id: 'scheduled', label: 'Upcoming', icon: Calendar, count: scheduledLectures.length },
    { id: 'history', label: 'History', icon: History, count: completedLectures.length },
  ]

  const currentLectures = activeTab === 'live' ? liveLectures : activeTab === 'scheduled' ? scheduledLectures : completedLectures

  return (
    <div className="space-y-8 pb-10">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Video className="w-6 h-6" />
              </div>
              Lecture Center
            </motion.h1>
            <p className="text-gray-600 text-sm mt-1 font-medium">Manage and attend real-time classes</p>
          </div>
          {(role === 'admin' || role === 'teacher') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> Schedule Lecture
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${
              activeTab === tab.id 
                ? 'text-white shadow-md' 
                : 'hover:bg-gray-50'
            }`}
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-surface)',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              borderColor: activeTab === tab.id ? 'var(--accent)' : 'var(--border-subtle)'
            }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === tab.id ? 'text-white' : ''
            }`}
            style={{
              backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-muted)',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)'
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : currentLectures.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center">
          <Video className="w-12 h-12 text-gray-600 mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-gray-900">No {activeTab} lectures found</h3>
          <p className="text-sm text-gray-600 mt-2">
             {activeTab === 'live' ? "There are no live classes happening right now." : "Check back later or schedule a new one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {currentLectures.map(lecture => (
              <LectureCard 
                key={lecture.id} 
                lecture={lecture} 
                role={role}
                onStatusChange={handleStatusChange}
                onOpenAttendance={() => setShowAttendanceModal(lecture)}
                onJoin={handleJoin}
                isJoining={joiningLecture === lecture.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 p-6 rounded-3xl w-full max-w-md shadow-2xl relative"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Schedule Lecture</h3>
            <form onSubmit={handleCreateLecture} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={newLecture.title}
                  onChange={e => setNewLecture({...newLecture, title: e.target.value})}
                  className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Thermodynamics Part 1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Batch</label>
                <select
                  required
                  value={newLecture.batch_id}
                  onChange={e => setNewLecture({...newLecture, batch_id: e.target.value})}
                  className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Batch</option>
                  {myBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Type</label>
                  <select
                    value={newLecture.status}
                    onChange={e => setNewLecture({...newLecture, status: e.target.value})}
                    className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="scheduled">Schedule for later</option>
                    <option value="live">Start Instantly (Live)</option>
                  </select>
                </div>
              </div>

              {/* Separate date and time fields */}
              {newLecture.status === 'scheduled' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newLecture.scheduled_date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setNewLecture({...newLecture, scheduled_date: e.target.value})}
                      className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Time
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="HH"
                        value={newLecture.scheduled_hour}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                          if (v !== '' && parseInt(v) > 23) return
                          setNewLecture({ ...newLecture, scheduled_hour: v })
                        }}
                        onBlur={e => {
                          if (e.target.value) setNewLecture({ ...newLecture, scheduled_hour: e.target.value.padStart(2, '0') })
                        }}
                        className="w-16 text-center bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500 font-bold text-lg"
                      />
                      <span className="text-gray-600 font-black text-xl">:</span>
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="MM"
                        value={newLecture.scheduled_min}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                          if (v !== '' && parseInt(v) > 59) return
                          setNewLecture({ ...newLecture, scheduled_min: v })
                        }}
                        onBlur={e => {
                          if (e.target.value) setNewLecture({ ...newLecture, scheduled_min: e.target.value.padStart(2, '0') })
                        }}
                        className="w-16 text-center bg-gray-50 border border-gray-200 rounded-xl px-2 py-2.5 text-gray-900 focus:outline-none focus:border-indigo-500 font-bold text-lg"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">24-hour format (e.g. 14 : 30)</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700">
                  {newLecture.status === 'live' ? 'Start Live' : 'Schedule'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <LiveAttendanceModal 
          lecture={showAttendanceModal} 
          onClose={() => setShowAttendanceModal(null)} 
        />
      )}
    </div>
  )
}

export default LecturesPage

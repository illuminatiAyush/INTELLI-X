import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Video, Calendar, Clock, History, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { fetchLectures, createLecture, updateLectureStatus } from '../../services/lectureService'
import LectureCard from '../../components/lectures/LectureCard'
import LiveAttendanceModal from '../../components/lectures/LiveAttendanceModal'
import { CardSkeleton } from '../../components/ui/Skeletons'

const LecturesPage = ({ hideHeader = false }) => {
  const { user, role, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('live')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(null)
  
  // Create Form State
  const [newLecture, setNewLecture] = useState({
    title: '',
    batch_id: '',
    scheduled_at: '',
    status: 'scheduled'
  })
  
  const [myBatches, setMyBatches] = useState([])

  const { data: lectures, loading, refetch } = useAppQuery(`lectures-${user?.id}`, async () => {
    if (!profile) return []
    const filters = {}
    if (role === 'admin') filters.institute_id = profile.institute_id
    if (role === 'teacher') filters.teacher_profile_id = profile.id
    // Note: Students are restricted by RLS on lecture_sessions so we can just fetch all they have access to.
    
    return await fetchLectures(filters)
  }, { enabled: !!profile })

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

  // Realtime Subscription for Lectures
  useEffect(() => {
    if (!profile) return
    const channel = supabase
      .channel('public:lecture_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lecture_sessions' }, () => {
        refetch()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [profile, refetch])

  const handleCreateLecture = async (e) => {
    e.preventDefault()
    if (!newLecture.title || !newLecture.batch_id) return toast.error('Please fill all fields')
    
    try {
      const payload = {
        ...newLecture,
        institute_id: profile.institute_id,
        teacher_profile_id: role === 'teacher' ? profile.id : null, // Admin would assign, but keeping simple for MVP
        created_by: profile.id
      }
      
      if (!payload.scheduled_at && payload.status === 'scheduled') {
         payload.scheduled_at = new Date().toISOString()
      }

      await createLecture(payload)
      toast.success('Lecture created!')
      setShowCreateModal(false)
      setNewLecture({ title: '', batch_id: '', scheduled_at: '', status: 'scheduled' })
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to create lecture')
    }
  }

  const handleStatusChange = async (lectureId, newStatus) => {
    try {
      await updateLectureStatus(lectureId, newStatus)
      toast.success(`Lecture marked as ${newStatus}`)
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
              className="text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Video className="w-6 h-6" />
              </div>
              Lecture Center
            </motion.h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">Manage and attend real-time classes</p>
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-[var(--text-primary)] text-[var(--bg-app)] shadow-md' 
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-app)] border border-[var(--border-subtle)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-[var(--bg-app)]/20 text-[var(--bg-app)]' : 'bg-[var(--border-subtle)]'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : currentLectures.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-[var(--bg-surface)] rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
          <Video className="w-12 h-12 text-[var(--text-secondary)] mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No {activeTab} lectures found</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
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
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-3xl w-full max-w-md shadow-2xl relative"
          >
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Schedule Lecture</h3>
            <form onSubmit={handleCreateLecture} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={newLecture.title}
                  onChange={e => setNewLecture({...newLecture, title: e.target.value})}
                  className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Thermodynamics Part 1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Batch</label>
                <select
                  required
                  value={newLecture.batch_id}
                  onChange={e => setNewLecture({...newLecture, batch_id: e.target.value})}
                  className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Batch</option>
                  {myBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Type</label>
                  <select
                    value={newLecture.status}
                    onChange={e => setNewLecture({...newLecture, status: e.target.value})}
                    className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  >
                    <option value="scheduled">Schedule for later</option>
                    <option value="live">Start Instantly (Live)</option>
                  </select>
                </div>
                {newLecture.status === 'scheduled' && (
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Time</label>
                    <input
                      type="datetime-local"
                      required={newLecture.status === 'scheduled'}
                      value={newLecture.scheduled_at}
                      onChange={e => setNewLecture({...newLecture, scheduled_at: e.target.value})}
                      className="w-full mt-1 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-[var(--text-secondary)] hover:bg-[var(--border-subtle)]">
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

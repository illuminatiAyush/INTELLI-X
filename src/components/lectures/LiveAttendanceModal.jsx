import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Users, UserCheck, UserX, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const LiveAttendanceModal = ({ lecture, onClose }) => {
  const [allStudents, setAllStudents] = useState([])   // everyone in the batch
  const [joined, setJoined] = useState(new Set())       // student ids who are marked present
  const [actuallyJoined, setActuallyJoined] = useState(new Set()) // students who clicked "Join Live Class"
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ── Load data ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)

        // 1. All students in batch
        const { data: bsRows } = await supabase
          .from('batch_students')
          .select('student_id')
          .eq('batch_id', lecture.batch_id)

        const rawIds = (bsRows || []).map(r => r.student_id)
        if (!rawIds.length) { setLoading(false); return }

        // 2. Resolve names via students → profile_id
        const { data: studentRows } = await supabase
          .from('students')
          .select('id, profile_id, name')
          .in('id', rawIds)

        let studentList = []
        if (studentRows?.length) {
          studentList = studentRows.map(s => ({
            id: s.profile_id || s.id,
            name: s.name || 'Unknown'
          }))
        } else {
          // fallback: student_id is auth UUID, fetch from profiles
          const { data: profileRows } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', rawIds)
          studentList = (profileRows || []).map(p => ({
            id: p.id,
            name: p.name || 'Unknown'
          }))
        }

        setAllStudents(studentList)

        // 3. Who is marked present
        const { data: attRows } = await supabase
          .from('attendance')
          .select('student_id, status')
          .eq('lecture_id', lecture.id)

        const presentIds = new Set(
          (attRows || [])
            .filter(r => r.status === 'present')
            .map(r => r.student_id)
        )
        setJoined(presentIds)

        // 4. For "In Lecture" - only show students who actually clicked "Join Live Class"
        // We need to differentiate between students who joined vs those manually marked
        const today = new Date().toISOString().split('T')[0]
        
        // Get attendance records that were created during the lecture (actual joins)
        // We'll use a time-based approach - records created close to "join" actions
        const lectureStartTime = new Date(lecture.created_at || lecture.scheduled_at || new Date())
        
        const { data: actualJoins } = await supabase
          .from('attendance')
          .select('student_id, created_at')
          .eq('lecture_id', lecture.id)
          .eq('date', today)
          .gte('created_at', lectureStartTime.toISOString())

        // Only include students whose attendance was created after lecture start
        // This indicates they actually joined during the lecture
        const actualJoinIds = new Set(
          (actualJoins || []).map(r => r.student_id)
        )
        setActuallyJoined(actualJoinIds)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load attendance')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [lecture])

  // ── Realtime: auto-update when student joins ───────────────
  useEffect(() => {
    if (!lecture?.id) return
    const channel = supabase
      .channel(`live-att-${lecture.id}`)
      .on('postgres_changes', {
        event: 'INSERT', // Only listen for new records (actual joins)
        schema: 'public', 
        table: 'attendance',
        filter: `lecture_id=eq.${lecture.id}`
      }, payload => {
        const studentId = payload.new?.student_id
        if (!studentId) return

        // When a student creates a new attendance record (joins), add to "in lecture"
        setActuallyJoined(prev => new Set([...prev, studentId]))

        // Also update their attendance status
        if (payload.new?.status === 'present') {
          setJoined(prev => new Set([...prev, studentId]))
        } else if (payload.new?.status === 'absent') {
          setJoined(prev => { 
            const n = new Set(prev)
            n.delete(studentId)
            return n
          })
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE', // Listen for attendance status updates
        schema: 'public', 
        table: 'attendance',
        filter: `lecture_id=eq.${lecture.id}`
      }, payload => {
        const studentId = payload.new?.student_id
        if (!studentId) return

        // For updates, only change attendance status, DON'T add to "in lecture"
        if (payload.new?.status === 'present') {
          setJoined(prev => new Set([...prev, studentId]))
        } else if (payload.new?.status === 'absent') {
          setJoined(prev => { 
            const n = new Set(prev)
            n.delete(studentId)
            return n
          })
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [lecture?.id])

  // ── Toggle present/absent ──────────────────────────────────
  const markPresent = (studentId) => {
    setJoined(prev => new Set([...prev, studentId]))
    // DON'T add to "in lecture" - that's only for students who actually joined
  }

  const markAbsent = (studentId) => {
    setJoined(prev => { 
      const n = new Set(prev)
      n.delete(studentId)
      return n
    })
    // Don't affect "in lecture" status - that's separate from attendance marking
  }

  // ── Save ───────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      const records = allStudents.map(s => ({
        lecture_id: lecture.id,
        student_id: s.id,
        batch_id: lecture.batch_id,
        date: today,
        status: joined.has(s.id) ? 'present' : 'absent',
      }))

      const { error } = await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'student_id,batch_id,date' })

      if (error) throw error

      // Notify each student of their attendance status
      // Get institute_id from the lecture or profile
      const { data: lectureData } = await supabase
        .from('lecture_sessions')
        .select('institute_id')
        .eq('id', lecture.id)
        .single()

      const instituteId = lectureData?.institute_id || lecture.institute_id

      if (!instituteId) {
        console.warn('No institute_id found, skipping notifications')
      } else {
        const notifPromises = allStudents.map(s => {
          const status = joined.has(s.id) ? 'present' : 'absent'
          return supabase.rpc('insert_notification', {
            p_user_id: s.id,
            p_institute_id: instituteId,
            p_title: status === 'present' ? '✅ Attendance Marked — Present' : '❌ Attendance Marked — Absent',
            p_message: `Your attendance for "${lecture.title}" has been marked as ${status}.`,
          }).then(({ error }) => {
            if (error) console.warn('Notif skipped for', s.name, error.message)
          })
        })
        await Promise.allSettled(notifPromises)
      }

      toast.success('Attendance saved and students notified!')
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const presentStudents = allStudents.filter(s => joined.has(s.id))
  const absentStudents  = allStudents.filter(s => !joined.has(s.id))
  const inLectureStudents = allStudents.filter(s => actuallyJoined.has(s.id)) // Students who actually joined

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
            >
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Live Attendance
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {lecture.title}
              </p>
            </div>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(34,197,94,0.12)', color: 'rgb(74,222,128)' }}
            >
              <UserCheck size={12} /> {presentStudents.length} Present
            </span>
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(239,68,68,0.12)', color: 'rgb(248,113,113)' }}
            >
              <UserX size={12} /> {absentStudents.length} Absent
            </span>
            <button
              onClick={onClose}
              className="ml-2 p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body — two columns */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }}
            />
          </div>
        ) : allStudents.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No students found in this batch.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x" style={{ borderColor: 'var(--border-subtle)' }}>

            {/* Left — All batch students */}
            <div className="flex flex-col overflow-hidden">
              <div
                className="px-4 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  All Students ({allStudents.length})
                </p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {allStudents.map(student => {
                  const isPresent = joined.has(student.id)
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors"
                      style={{
                        background: isPresent ? 'rgba(34,197,94,0.06)' : 'var(--bg-card)',
                        border: `1px solid ${isPresent ? 'rgba(34,197,94,0.20)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                          style={{
                            background: isPresent ? 'rgba(34,197,94,0.15)' : 'var(--accent-muted)',
                            color: isPresent ? 'rgb(74,222,128)' : 'var(--accent)',
                          }}
                        >
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {student.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => markPresent(student.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                            isPresent ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                          }`}
                          style={{ 
                            background: isPresent ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)', 
                            color: 'rgb(74,222,128)',
                            border: `1px solid ${isPresent ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.2)'}`
                          }}
                        >
                          {isPresent ? '✓ ' : ''}Present
                        </button>
                        <button
                          onClick={() => markAbsent(student.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                            !isPresent ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                          }`}
                          style={{ 
                            background: !isPresent ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)', 
                            color: 'rgb(248,113,113)',
                            border: `1px solid ${!isPresent ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`
                          }}
                        >
                          {!isPresent ? '✓ ' : ''}Absent
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right — Students who actually joined the lecture */}
            <div className="flex flex-col overflow-hidden">
              <div
                className="px-4 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  In Lecture ({inLectureStudents.length})
                </p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {inLectureStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <UserCheck size={28} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      No students have joined the lecture yet
                    </p>
                    <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                      Only students who click "Join Live Class" appear here
                    </p>
                  </div>
                ) : (
                  inLectureStudents.map(student => {
                    const isMarkedPresent = joined.has(student.id)
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                        style={{
                          background: isMarkedPresent ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.08)',
                          border: `1px solid ${isMarkedPresent ? 'rgba(34,197,94,0.20)' : 'rgba(59,130,246,0.20)'}`,
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                            style={{ 
                              background: isMarkedPresent ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)', 
                              color: isMarkedPresent ? 'rgb(74,222,128)' : 'rgb(96,165,250)' 
                            }}
                          >
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                              {student.name}
                            </span>
                            <span className="text-[10px]" style={{ 
                              color: isMarkedPresent ? 'rgb(74,222,128)' : 'rgb(248,113,113)' 
                            }}>
                              {isMarkedPresent ? 'Marked Present' : 'Marked Absent'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isMarkedPresent ? (
                            <button
                              onClick={() => markAbsent(student.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold transition-colors"
                              style={{ color: 'rgb(248,113,113)' }}
                              title="Mark absent"
                            >
                              Mark Absent
                            </button>
                          ) : (
                            <button
                              onClick={() => markPresent(student.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold transition-colors"
                              style={{ color: 'rgb(74,222,128)' }}
                              title="Mark present"
                            >
                              Mark Present
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Students will be notified after saving.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="btn-ghost text-xs"
              style={{ height: 36, paddingLeft: 16, paddingRight: 16 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="btn-primary text-xs"
              style={{ height: 36, paddingLeft: 16, paddingRight: 16 }}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                  Saving…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={13} /> Save & Notify
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LiveAttendanceModal

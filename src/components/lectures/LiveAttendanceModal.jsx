import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Check, XCircle, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { getAttendanceByLecture, upsertLectureAttendance } from '../../services/attendanceService'

const LiveAttendanceModal = ({ lecture, onClose }) => {
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // 1. Fetch batch students
        const { data: batchStudents } = await supabase
          .from('batch_students')
          .select('student_id, profiles:student_id(name)')
          .eq('batch_id', lecture.batch_id)

        const studentList = batchStudents.map(bs => ({
          id: bs.student_id,
          name: bs.profiles?.name || 'Unknown Student'
        }))
        setStudents(studentList)

        // 2. Fetch existing attendance for this lecture
        const existing = await getAttendanceByLecture(lecture.id)
        const attMap = {}
        existing.forEach(r => {
          attMap[r.student_id] = r.status
        })
        
        // 3. Auto-populate missing with 'absent' if lecture is live
        if (lecture.status === 'live') {
           studentList.forEach(s => {
             if (!attMap[s.id]) attMap[s.id] = 'absent' // default
           })
        }
        
        setAttendance(attMap)
      } catch (err) {
        toast.error('Failed to load attendance data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [lecture])

  // Optional: Realtime sync for Live lectures if students "join" and auto-mark present
  // For this MVP, it's manually managed by teacher.

  const handleToggle = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const records = Object.keys(attendance).map(studentId => ({
        lecture_id: lecture.id,
        student_id: studentId,
        batch_id: lecture.batch_id,
        date: new Date().toISOString().split('T')[0], // keeping date for backward compatibility on queries
        status: attendance[studentId]
      }))

      await upsertLectureAttendance(records)
      toast.success('Attendance saved!')
      onClose()
    } catch (err) {
      toast.error('Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-app)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] leading-tight">Live Attendance</h2>
              <p className="text-sm font-medium text-[var(--text-secondary)]">{lecture.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-[var(--bg-app)] rounded-2xl" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[var(--text-secondary)]">No students found in this batch.</p>
            </div>
          ) : (
            students.map(student => {
              const status = attendance[student.id]
              return (
                <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--text-primary)]/5 text-[var(--text-primary)] flex items-center justify-center font-bold">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-[var(--text-primary)]">{student.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(student.id, 'present')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        status === 'present' 
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-green-500/50 hover:text-green-500'
                      }`}
                    >
                      <Check className="w-4 h-4" /> Present
                    </button>
                    <button
                      onClick={() => handleToggle(student.id, 'absent')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        status === 'absent' 
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-red-500/50 hover:text-red-500'
                      }`}
                    >
                      <XCircle className="w-4 h-4" /> Absent
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving || loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default LiveAttendanceModal

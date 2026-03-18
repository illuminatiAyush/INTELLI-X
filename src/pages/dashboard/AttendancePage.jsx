import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardCheck, Check, X, Save } from 'lucide-react'
import { Select } from '../../components/ui/FormField'
import { getBatches } from '../../services/batchService'
import { getStudentsByBatch } from '../../services/studentService'
import { getAttendanceByBatchAndDate, upsertAttendance } from '../../services/attendanceService'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const AttendancePage = () => {
  const { user, role } = useAuth()
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        let query = supabase.from('batches').select('*').order('name')
        if (role === 'teacher') {
          query = query.eq('teacher_id', user.id)
        }
        const { data } = await query
        setBatches(data || [])
        if (data?.length > 0) setSelectedBatch(data[0].id)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBatches()
  }, [role, user])

  useEffect(() => {
    if (!selectedBatch) return
    const fetchStudentsAndAttendance = async () => {
      setLoading(true)
      try {
        const [studentList, attendanceList] = await Promise.all([
          getStudentsByBatch(selectedBatch),
          getAttendanceByBatchAndDate(selectedBatch, selectedDate),
        ])
        setStudents(studentList)
        const map = {}
        attendanceList.forEach((a) => { map[a.student_id] = a.status })
        // Default to present for students not yet marked
        studentList.forEach((s) => { if (!map[s.id]) map[s.id] = 'present' })
        setAttendance(map)
        setSaved(false)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudentsAndAttendance()
  }, [selectedBatch, selectedDate])

  const toggleStatus = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }))
    setSaved(false)
  }

  const markAll = (status) => {
    const updated = {}
    students.forEach((s) => { updated[s.id] = status })
    setAttendance(updated)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const records = students.map((s) => ({
        student_id: s.id,
        batch_id: selectedBatch,
        date: selectedDate,
        status: attendance[s.id] || 'present',
      }))
      await upsertAttendance(records)
      setSaved(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length
  const batchOptions = batches.map((b) => ({ value: b.id, label: b.name }))
  const canEdit = role === 'admin' || role === 'teacher'

  return (
    <div className="space-y-8">
      <div>
        <motion.h1 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          Attendance
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">Mark and view attendance records across batches</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div className="flex-1">
          <Select
            label="Select Batch"
            options={batchOptions}
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--color-purple)] focus:bg-[var(--bg-surface)] transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No students in this batch</p>
        </div>
      ) : (
        <>
          {/* Summary Bar */}
          <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-[var(--bg-app)]/50 border border-[var(--border-subtle)] shadow-sm mb-6">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-[var(--text-secondary)] font-medium uppercase tracking-wider text-xs">Overview</span>
              <div className="h-4 w-px bg-[var(--border-subtle)]" />
              <span className="text-[var(--text-secondary)]">Total: <span className="text-[var(--text-primary)] font-bold">{students.length}</span></span>
              <span className="text-emerald-500">Present: <span className="font-bold">{presentCount}</span></span>
              <span className="text-red-500">Absent: <span className="font-bold">{absentCount}</span></span>
            </div>
            {canEdit && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => markAll('present')} 
                  className="text-xs px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all font-semibold active:scale-95"
                >
                  Mark All Present
                </button>
                <button 
                  onClick={() => markAll('absent')} 
                  className="text-xs px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all font-semibold active:scale-95"
                >
                  Mark All Absent
                </button>
              </div>
            )}
          </div>

          {/* Student List */}
          <div className="space-y-3">
            {students.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${
                  attendance[student.id] === 'present'
                    ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm shadow-emerald-500/5'
                    : 'bg-red-500/5 border-red-500/20 shadow-sm shadow-red-500/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${
                    attendance[student.id] === 'present'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[var(--text-primary)]">{student.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">{student.email || 'No email provided'}</p>
                  </div>
                </div>
                {canEdit ? (
                  <button
                    onClick={() => toggleStatus(student.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      attendance[student.id] === 'present'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    }`}
                  >
                    {attendance[student.id] === 'present' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {attendance[student.id] === 'present' ? 'Present' : 'Absent'}
                  </button>
                ) : (
                  <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                    attendance[student.id] === 'present' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {attendance[student.id] === 'present' ? 'Present' : 'Absent'}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Save Button */}
          {canEdit && (
            <div className="flex justify-end pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold shadow-xl transition-all ${
                  saved
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : 'bg-[var(--color-purple)] text-white shadow-purple-500/30'
                }`}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saved ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Saving...' : saved ? 'Attendance Saved' : 'Save Attendance'}
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AttendancePage

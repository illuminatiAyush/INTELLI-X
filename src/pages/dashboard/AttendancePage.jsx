import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardCheck, Check, X, Save, ChevronDown, ChevronUp,
  Calendar, User, BookOpen, Percent, FileDown
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Select } from '../../components/ui/FormField'
import { getStudentsByBatch } from '../../services/studentService'
import {
  getAttendanceByBatchAndDate,
  upsertAttendance,
  getStudentAttendanceForBatch,
} from '../../services/attendanceService'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

// ─── Student view: enrolled subjects + date-wise attendance ─────────────────
const StudentAttendanceView = ({ user }) => {
  const [studentId, setStudentId] = useState(null)
  const [subjects, setSubjects] = useState([])   // [{batch, teacher, records, rate}]
  const [expanded, setExpanded] = useState(null)  // batch id
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Get student record
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .eq('profile_id', user.id)
        const student = students?.[0]
        if (!student) { setLoading(false); return }
        setStudentId(student.id)

        // 2. Get enrolled batch IDs using profile_id (User UUID)
        const { data: enrollments } = await supabase
          .from('batch_students')
          .select('batch_id')
          .eq('student_id', user.id)

        if (!enrollments?.length) { setLoading(false); return }

        const batchIds = enrollments.map(en => en.batch_id)

        // 2b. Fetch batches with teacher name using the same proven join as batchService
        const { data: batchRows } = await supabase
          .from('batches')
          .select('id, name, teachers(name)')
          .in('id', batchIds)

        if (!batchRows?.length) { setLoading(false); return }

        // 3. For each batch fetch date-wise attendance records using profile_id (User UUID)
        const subjectList = await Promise.all(
          batchRows.map(async (batch) => {
            const records = await getStudentAttendanceForBatch(user.id, batch.id)
            const present = records.filter(r => r.status === 'present').length
            const rate = records.length
              ? Math.round((present / records.length) * 100)
              : null
            const teacher = batch.teachers?.name || 'N/A'
            return { batch, teacher, records, rate }
          })
        )
        setSubjects(subjectList)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!subjects.length) {
    return (
      <div className="text-center py-16 border border-dashed border-[var(--border-strong)] rounded-2xl bg-[var(--bg-surface)]">
        <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="text-[var(--text-secondary)] font-medium">You are not enrolled in any subjects yet.</p>
        <p className="text-[var(--text-secondary)] text-sm mt-1 opacity-60">Ask your teacher for a join code to get started.</p>
      </div>
    )
  }

  const toggle = (id) => setExpanded(prev => prev === id ? null : id)

  return (
    <div className="space-y-3">
      {/* Table Header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        <span className="col-span-5 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Subject</span>
        <span className="col-span-4 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Teacher</span>
        <span className="col-span-2 flex items-center gap-1.5"><Percent className="w-3.5 h-3.5" /> Attendance</span>
        <span className="col-span-1" />
      </div>

      {subjects.map(({ batch, teacher, records, rate }, i) => (
        <motion.div
          key={batch.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-sm"
        >
          {/* Subject Row */}
          <button
            onClick={() => toggle(batch.id)}
            className="w-full grid grid-cols-12 gap-4 items-center px-5 py-4 hover:bg-[var(--bg-card)] transition-colors text-left"
          >
            {/* Subject name */}
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-purple)]/10 text-[var(--color-purple)] flex items-center justify-center font-bold text-sm flex-shrink-0">
                {batch.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-[var(--text-primary)] text-sm truncate">{batch.name}</span>
            </div>

            {/* Teacher */}
            <div className="col-span-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[var(--text-secondary)] flex-shrink-0" />
              <span className="text-sm text-[var(--text-secondary)] truncate">{teacher}</span>
            </div>

            {/* Attendance % */}
            <div className="col-span-2">
              {rate === null ? (
                <span className="text-xs text-[var(--text-secondary)] opacity-50">No data</span>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden max-w-[60px]">
                    <div
                      className={`h-full rounded-full transition-all ${rate >= 75 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${rate >= 75 ? 'text-emerald-500' : rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    {rate}%
                  </span>
                </div>
              )}
            </div>

            {/* Expand icon */}
            <div className="col-span-1 flex justify-end">
              {expanded === batch.id
                ? <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
                : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
              }
            </div>
          </button>

          {/* Date-wise Attendance Panel */}
          <AnimatePresence>
            {expanded === batch.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-[var(--border-subtle)]"
              >
                <div className="px-5 py-4 bg-[var(--bg-app)]/40">
                  {records.length === 0 ? (
                    <p className="text-sm text-[var(--text-secondary)] text-center py-4 opacity-60">
                      No attendance recorded yet for this subject.
                    </p>
                  ) : (
                    <>
                      {/* Summary pills */}
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Summary</span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
                          Present: {records.filter(r => r.status === 'present').length}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold">
                          Absent: {records.filter(r => r.status === 'absent').length}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-bold">
                          Total: {records.length}
                        </span>
                      </div>

                      {/* Date list */}
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {records.map((rec) => (
                          <div
                            key={rec.date}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all ${
                              rec.status === 'present'
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-red-500/5 border-red-500/20'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="font-medium">
                                {new Date(rec.date).toLocaleDateString('en-IN', {
                                  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              rec.status === 'present'
                                ? 'bg-emerald-500/15 text-emerald-500'
                                : 'bg-red-500/15 text-red-500'
                            }`}>
                              {rec.status === 'present'
                                ? <><Check className="w-3 h-3" /> Present</>
                                : <><X className="w-3 h-3" /> Absent</>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Admin / Teacher view: mark attendance ───────────────────────────────────
const AdminAttendanceView = ({ user, role }) => {
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
        if (role === 'teacher') query = query.eq('teacher_id', user.id)
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
        studentList.forEach((s) => { 
          const sid = s.profile_id || s.id // Prefer profile_id (User UUID)
          if (!map[sid]) map[sid] = 'present' 
        })
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
    students.forEach((s) => { 
      const sid = s.profile_id || s.id
      updated[sid] = status 
    })
    setAttendance(updated)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const records = students.map((s) => ({
        student_id: s.profile_id || s.id, // Use profile_id (User UUID) for storage
        batch_id: selectedBatch,
        date: selectedDate,
        status: attendance[s.profile_id || s.id] || 'present',
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

  const downloadPDF = () => {
    const batchName = batches.find(b => b.id === selectedBatch)?.name || 'Batch'
    const doc = new jsPDF()

    // Header
    doc.setFillColor(139, 92, 246)
    doc.rect(0, 0, 220, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Attendance Report', 14, 18)

    // Meta info
    doc.setTextColor(40, 40, 40)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Batch: ${batchName}`, 14, 38)
    doc.text(`Date: ${selectedDate}`, 14, 46)

    // Summary pills
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setFillColor(16, 185, 129)
    doc.roundedRect(14, 52, 38, 9, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.text(`Present: ${presentCount}`, 16, 58.5)

    doc.setFillColor(239, 68, 68)
    doc.roundedRect(56, 52, 34, 9, 2, 2, 'F')
    doc.text(`Absent: ${absentCount}`, 58, 58.5)

    doc.setFillColor(100, 100, 120)
    doc.roundedRect(94, 52, 30, 9, 2, 2, 'F')
    doc.text(`Total: ${students.length}`, 96, 58.5)

    // Table
    autoTable(doc, {
      startY: 68,
      head: [['#', 'Student Name', 'Email', 'Status']],
      body: students.map((s, i) => [
        i + 1,
        s.name,
        s.email || '-',
        attendance[s.profile_id || s.id] === 'present' ? 'Present' : 'Absent',
      ]),
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 245, 255] },
      didParseCell: (data) => {
        if (data.column.index === 3 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.textColor =
            data.cell.raw === 'Present' ? [16, 185, 129] : [239, 68, 68]
        }
      },
    })

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated by IntelliX  •  Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 8)
    }

    doc.save(`attendance_${batchName}_${selectedDate}.pdf`)
  }
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div className="flex-1">
          <Select
            label="Select Subject"
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
          <p>No students in this subject</p>
        </div>
      ) : (
        <>
          {/* Summary Bar */}
          <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-[var(--bg-app)]/50 border border-[var(--border-subtle)] shadow-sm">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-[var(--text-secondary)] font-medium uppercase tracking-wider text-xs">Overview</span>
              <div className="h-4 w-px bg-[var(--border-subtle)]" />
              <span className="text-[var(--text-secondary)]">Total: <span className="text-[var(--text-primary)] font-bold">{students.length}</span></span>
              <span className="text-emerald-500">Present: <span className="font-bold">{presentCount}</span></span>
              <span className="text-red-500">Absent: <span className="font-bold">{absentCount}</span></span>
            </div>
            <div className="flex items-center gap-3">
              {role === 'teacher' && (
                <>
                  <button onClick={() => markAll('present')} className="text-xs px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all font-semibold active:scale-95">
                    Mark All Present
                  </button>
                  <button onClick={() => markAll('absent')} className="text-xs px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all font-semibold active:scale-95">
                    Mark All Absent
                  </button>
                </>
              )}
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl bg-[var(--color-purple)]/10 text-[var(--color-purple)] hover:bg-[var(--color-purple)]/20 transition-all font-semibold active:scale-95"
              >
                <FileDown className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Student List */}
          <div className="space-y-3">
            {students.map((student, i) => {
              const sid = student.profile_id || student.id
              const isPresent = attendance[sid] === 'present'
              
              return (
                <motion.div
                  key={sid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${
                    isPresent
                      ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm shadow-emerald-500/5'
                      : 'bg-red-500/5 border-red-500/20 shadow-sm shadow-red-500/5'
                  }`}
                >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${
                    isPresent ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[var(--text-primary)]">{student.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">{student.email || 'No email provided'}</p>
                  </div>
                </div>
                {role === 'teacher' ? (
                  <button
                    onClick={() => toggleStatus(sid)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      isPresent
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    }`}
                  >
                    {isPresent ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {isPresent ? 'Present' : 'Absent'}
                  </button>
                ) : (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${
                    isPresent
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-red-500/15 text-red-500'
                  }`}>
                    {isPresent ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {isPresent ? 'Present' : 'Absent'}
                  </div>
                )}
              </motion.div>
            )})}
          </div>

          {/* Save Button — teachers only */}
          {role === 'teacher' && (
            <div className="flex justify-end pt-2">
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

// ─── Page root ────────────────────────────────────────────────────────────────
const AttendancePage = () => {
  const { user, role } = useAuth()

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
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
          {role === 'student'
            ? 'Your attendance across all enrolled subjects'
            : role === 'admin'
              ? 'View attendance records across all subjects'
              : 'Mark and view attendance records across subjects'}
        </p>
      </div>

      {role === 'student'
        ? <StudentAttendanceView user={user} />
        : <AdminAttendanceView user={user} role={role} />
      }
    </div>
  )
}

export default AttendancePage

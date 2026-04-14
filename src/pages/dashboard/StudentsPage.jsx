import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Users, Phone, Mail, BookOpen, ChevronDown, BarChart3, TrendingUp, ClipboardCheck, Trophy, ChevronLeft } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import StatsCard from '../../components/ui/StatsCard'
import { Input } from '../../components/ui/FormField'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../services/studentService'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { TableSkeleton } from '../../components/ui/Skeletons'
import { supabase } from '../../lib/supabase'

const StudentsPage = ({ hideHeader = false }) => {
  const { isDark } = useTheme()
  const { role } = useAuth()
  const { data: studentsData, loading: studentsLoading, refetch: refetchStudents } = useAppQuery('students-list', async () => {
    // Note: getStudents() in service might be generic, let's use direct supabase if needed or stick to service
    // For consistency with other pages, let's use a cached query
    const { data } = await supabase
      .from('students')
      .select('id, name, email, phone, created_at, batch_students(batches(id, name))')
      .order('created_at', { ascending: false })
    return data || []
  })

  const students = studentsData || []
  const loading = studentsLoading && !studentsData

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedBatches, setExpandedBatches] = useState(() => new Set())
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentAnalytics, setStudentAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  const toggleBatchExpand = (studentId) => {
    setExpandedBatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    })
  }

  const fetchData = () => refetchStudents()

  useEffect(() => { fetchData() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', email: '', password: '', phone: '' })
    setModalOpen(true)
  }

  const openEdit = (student) => {
    setEditing(student)
    setForm({
      name: student.name,
      email: student.email || '',
      password: '', // Edit mode generally doesn't require password, but state needs it
      phone: student.phone || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await updateStudent(editing.id, form)
      } else {
        await createStudent(form)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
      // Provide user-friendly feedback for JWT errors
      const errorMessage = err.message || 'Failed to save student. Please try again.'
      alert(errorMessage)
      
      // If it's an auth error, we should probably redirect or suggest re-login
      if (errorMessage.toLowerCase().includes('jwt') || errorMessage.toLowerCase().includes('session')) {
        console.warn('Authentication error detected. User might need to re-login.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    try {
      await deleteStudent(id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const openDrilldown = async (student) => {
    setSelectedStudent(student)
    setLoadingAnalytics(true)
    try {
      const [
        { data: attendanceData },
        { data: resultsData }
      ] = await Promise.all([
        supabase.from('attendance').select('status').eq('student_id', student.id),
        supabase.from('results').select('marks, created_at, tests(total_marks, batch_id)').eq('student_id', student.id)
      ])

      const attendance = attendanceData || []
      const results = resultsData || []

      const totalClasses = attendance.length
      const present = attendance.filter(a => a.status === 'present').length
      const attendancePercent = totalClasses ? ((present / totalClasses) * 100).toFixed(1) : 0

      const totalTests = results.length
      const totalPossible = results.reduce((acc, r) => acc + (r.tests?.total_marks || 100), 0)
      const totalMarks = results.reduce((acc, r) => acc + (r.marks || 0), 0)
      const avgMarks = totalPossible ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0
      const latestScore = results.length > 0 ? results.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0].marks : '-'

      // Simple relative rank logic (if we want consistency across pages, would need full batch stats here)
      setStudentAnalytics({
        attendance: { total: totalClasses, present, percent: attendancePercent },
        tests: { total: totalTests, avg: avgMarks, latest: latestScore },
        rank: '-' // Optional: fetch full ranking if required, leaving as '-' for now to avoid N+1 or massive overhead here
      })
    } catch (err) {
      console.error('Failed to fetch student analytics:', err)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'batch',
      label: 'Batch',
      render: (row) => row.batch_students?.[0]?.batches?.name || '-',
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(row) }}
            className="p-1.5 rounded-lg hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id) }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }
  ]



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] animate-pulse" />
        <TableSkeleton rows={10} cols={6} />
      </div>
    )
  }

  return (
    <div className={hideHeader ? "space-y-6" : "space-y-6"}>
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/20 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
              >
                Students
              </motion.h1>
              <p className="text-[var(--text-secondary)] mt-1 font-medium">Manage enrolled students for your institute</p>
            </div>
          </div>
          {role === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openAdd}
              className="flex items-center px-5 py-2.5 rounded-xl transition-all font-bold shadow-lg bg-white text-black hover:bg-gray-200"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Student
            </motion.button>
          )}
        </div>
      )}

      {/* Table card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        {/* Search bar */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-app)]/50">
          <div className="relative w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] rounded-xl focus:outline-none focus:border-white/30 transition-all text-sm font-medium`}
            />
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-medium">{students.length} total enrolled</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-app)]/50 text-[var(--text-secondary)] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5 font-bold">Name</th>
                <th className="px-6 py-5 font-bold">Phone</th>
                <th className="px-6 py-5 font-bold">Email</th>
                <th className="px-6 py-5 font-bold">Batch</th>
                <th className="px-6 py-5 font-bold">Joined</th>
                {role === 'admin' && <th className="px-6 py-5 font-bold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((student) => (
                <tr 
                  key={student.id} 
                  onClick={() => openDrilldown(student)}
                  className="hover:bg-[var(--bg-app)] transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[var(--text-primary)]">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-60" />
                      {student.phone || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-60" />
                      {student.email || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                    {(() => {
                      const batchNames = (student.batch_students || [])
                        .map(bs => bs.batches?.name)
                        .filter(Boolean)
                      if (batchNames.length === 0) return '-'
                      if (batchNames.length === 1) return (
                        <span className="px-2 py-0.5 rounded-lg bg-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium">{batchNames[0]}</span>
                      )
                      const isOpen = expandedBatches instanceof Set && expandedBatches.has(student.id)
                      return (
                        <div className="space-y-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleBatchExpand(student.id); }}
                            className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-white hover:text-white/80' : 'text-slate-700 hover:text-slate-900'} transition-colors`}
                          >
                            <span className={`px-2 py-0.5 rounded-lg ${isDark ? 'bg-white/10' : 'bg-slate-100 border border-slate-200'}`}>{batchNames[0]}</span>
                            <span className="text-[var(--text-secondary)]">+{batchNames.length - 1}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isOpen && (
                            <div className="flex flex-col gap-1 pl-1 pt-1">
                              {batchNames.slice(1).map((name, i) => (
                                <span key={i} className={`px-2 py-0.5 rounded-lg ${isDark ? 'bg-white/10 text-white/70' : 'bg-slate-50 text-slate-500 border border-slate-100'} text-xs font-medium w-fit`}>{name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                    {new Date(student.created_at).toLocaleDateString()}
                  </td>
                  {role === 'admin' && (
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(student); }}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                      >
                        <Pencil className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}
                        className="text-red-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={role === 'admin' ? 6 : 5} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                    No students found. Click 'Add Student' to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Student' : 'Add Student'}>
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter student name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email / Gmail"
            type="email"
            placeholder="student@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {!editing && (
            <Input
              label="Password *"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}
          <Input
            label="Phone"
            placeholder="+91 9876543210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {!editing && (
            <div className={`p-4 rounded-xl flex flex-col items-center justify-center text-center mt-2 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
              <Users className="w-6 h-6 mb-2 text-[var(--text-secondary)] opacity-60" />
              <p className="text-sm font-medium text-[var(--text-primary)]">Batch Enrollment</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Students will join batches themselves using a Join Code after their account is created.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center gap-2 bg-white text-black hover:bg-gray-200"
            >
              {saving && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Saving...' : editing ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Analytics Drilldown Modal */}
      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="Student Analytics" size="lg">
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <div className="w-12 h-12 rounded-full bg-[var(--border-subtle)] flex items-center justify-center text-xl font-bold text-[var(--text-primary)]">
                {selectedStudent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedStudent.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{selectedStudent.email}</p>
              </div>
            </div>

            {loadingAnalytics ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[var(--text-secondary)] font-medium tracking-wide">Synthesizing performance data...</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard title="Attendance" value={`${studentAnalytics?.attendance?.percent || 0}%`} icon={ClipboardCheck} color={parseFloat(studentAnalytics?.attendance?.percent) >= 75 ? 'green' : 'amber'} />
                  <StatsCard title="Tests Taken" value={studentAnalytics?.tests?.total || 0} icon={BarChart3} color="white" />
                  <StatsCard title="Avg Score" value={`${studentAnalytics?.tests?.avg || 0}%`} icon={TrendingUp} color="white" />
                  <StatsCard title="Batch Rank" value={studentAnalytics?.rank || '-'} icon={Trophy} color="white" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-app)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-3">Attendance Summary</p>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)] font-medium">Total Classes</span>
                        <span className="font-bold text-[var(--text-primary)]">{studentAnalytics?.attendance?.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)] font-medium">Present</span>
                        <span className="font-bold text-green-500">{studentAnalytics?.attendance?.present || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm py-1.5">
                        <span className="text-[var(--text-secondary)] font-medium">Status</span>
                        <span className="font-bold text-green-500">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-app)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-3">Performance Insight</p>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)] font-medium">Latest Score</span>
                        <span className="font-bold text-[var(--text-primary)]">{studentAnalytics?.tests?.latest || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)] font-medium">Growth Rate</span>
                        <span className="font-bold text-[var(--text-primary)]">Stable</span>
                      </div>
                      <div className="flex justify-between items-center text-sm py-1.5">
                        <span className="text-[var(--text-secondary)] font-medium">Ranking</span>
                        <span className="font-bold text-[var(--text-secondary)]">Calculating...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StudentsPage

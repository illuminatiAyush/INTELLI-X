import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Users, Search, Copy, Link as LinkIcon, CheckCircle, AlertCircle, Play, Trophy, BarChart3, TrendingUp, ChevronLeft, PlusCircle, Layers, ClipboardCheck } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import StatsCard from '../../components/ui/StatsCard'
import { Input, Select } from '../../components/ui/FormField'
import { getBatches, createBatch, updateBatch, deleteBatch } from '../../services/batchService'
import { createStudent } from '../../services/studentService'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { CardSkeleton } from '../../components/ui/Skeletons'
import toast from 'react-hot-toast'

import StudentsPage from './StudentsPage'
import TeachersPage from './TeachersPage'
import JoinBatch from './JoinBatch'

const BatchList = () => {
  const { role, profile } = useAuth()
  const { data: batchesData, loading: batchesLoading, refetch: refetchBatches } = useAppQuery(`batches-${role}-${profile?.id}`, async () => {
    if (!profile) return { batches: [], teachers: [] }
    
    let batchQuery = supabase.from('batches').select('id, name, subject, created_at, teacher_id, max_uses, join_code, join_link, teachers(name, profile_id)')
    
    if (role === 'teacher') {
      batchQuery = batchQuery.eq('teacher_id', profile.id)
    } else if (role === 'admin') {
      batchQuery = batchQuery.eq('institute_id', profile.institute_id)
    } else if (role === 'student') {
      const { data: enrollment } = await supabase.from('batch_students').select('batch_id').eq('student_id', profile.id)
      const enrolledBatchIds = (enrollment || []).map(e => e.batch_id)
      if (enrolledBatchIds.length > 0) {
        batchQuery = batchQuery.in('id', enrolledBatchIds)
      } else {
        return { batches: [], teachers: [] }
      }
    }

    const [ { data: b }, { data: t } ] = await Promise.all([
      batchQuery.order('created_at', { ascending: false }),
      supabase.from('teachers').select('id, name, profile_id').eq('institute_id', profile.institute_id),
    ])

    return {
      batches: b || [],
      teachers: t || []
    }
  }, { enabled: !!profile })

  const batches = batchesData?.batches || []
  const teachers = batchesData?.teachers || []
  const loading = batchesLoading && !batchesData

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', subject: '', teacher_id: '', invite_expiry_days: '', max_uses: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedBatch, setExpandedBatch] = useState(null)
  const [studentsModalOpen, setStudentsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [batchStudents, setBatchStudents] = useState([])
  const [search, setSearch] = useState('')

  const fetchData = () => refetchBatches()

  useEffect(() => { fetchData() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', subject: '', teacher_id: '', invite_expiry_days: '', max_uses: '' })
    setModalOpen(true)
  }

  const openEdit = (batch) => {
    setEditing(batch)
    setForm({
      name: batch.name,
      subject: batch.subject || '',
      teacher_id: batch.teacher_id || '',
      invite_expiry_days: '',
      max_uses: batch.max_uses === -1 ? '' : batch.max_uses,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      // Only include core fields guaranteed to exist in the DB schema
      const payload = {
        name: form.name.trim(),
        subject: form.subject.trim() || null,
      }
      if (form.teacher_id) payload.teacher_id = form.teacher_id

      // invite_expiry — only add if column exists
      if (form.invite_expiry_days) {
        const d = new Date()
        d.setDate(d.getDate() + parseInt(form.invite_expiry_days))
        payload.invite_expiry = d.toISOString()
      }
      // max_uses — only add when user provides a value
      if (form.max_uses && !isNaN(parseInt(form.max_uses))) {
        payload.max_uses = parseInt(form.max_uses)
      }
      if (editing) {
        await updateBatch(editing.id, payload)
        toast.success('Batch updated successfully')
      } else {
        payload.institute_id = profile?.institute_id
        await createBatch(payload)
        toast.success('Batch created successfully')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to save batch')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this batch? Students in this batch will be unassigned.')) return
    try {
      await deleteBatch(id)
      toast.success('Batch deleted')
      if (expandedBatch?.id === id) {
        setStudentsModalOpen(false)
      }
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete batch')
    }
  }

  const handleRowClick = async (batch) => {
    setExpandedBatch(batch)
    setStudentsModalOpen(true)
    setSelectedStudent(null)
    
    // Optimized single-shot query batch fetch for drilldown
    const [
      { data: studentData },
      { data: attendanceData },
      { data: resultsData }
    ] = await Promise.all([
      supabase.from('batch_students').select('students(id, name, email)').eq('batch_id', batch.id),
      supabase.from('attendance').select('student_id, status').eq('batch_id', batch.id),
      supabase.from('results').select('student_id, marks, created_at, tests!inner(batch_id, total_marks)').eq('tests.batch_id', batch.id)
    ])

    const studentList = (studentData || [])
      .map(row => row.students)
      .filter(Boolean)
      .filter((s, index, self) => self.findIndex(t => t.id === s.id) === index)

    const attendanceRecords = attendanceData || []
    const rawResults = resultsData || []

    const studentScores = {}
    rawResults.forEach(r => {
      const sid = r.student_id;
      if (!studentScores[sid]) studentScores[sid] = { total: 0 }
      studentScores[sid].total += (r.marks || 0)
    })
    
    const rankedStudents = Object.keys(studentScores).sort((a, b) => studentScores[b].total - studentScores[a].total)
    
    const enrichedStudents = studentList.map(student => {
      const sId = student.id
      
      const sAtt = attendanceRecords.filter(a => a.student_id === sId)
      const totalClasses = sAtt.length || 0
      const present = sAtt.filter(a => a.status === 'present').length || 0
      const absent = totalClasses - present
      const attendancePercent = totalClasses ? ((present / totalClasses) * 100).toFixed(1) : 0
      
      const sRes = rawResults.filter(r => r.student_id === sId).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      const totalTests = sRes.length || 0
      const totalPossible = sRes.reduce((acc, r) => acc + (r.tests?.total_marks || 100), 0)
      const totalMarks = sRes.reduce((acc, r) => acc + (r.marks || 0), 0)
      const avgMarks = totalPossible ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0
      const latestScore = sRes.length > 0 ? (sRes[0].marks || 0) : '-'
      
      const rankIndex = rankedStudents.indexOf(sId)
      const rank = rankIndex !== -1 ? rankIndex + 1 : '-'
      const percentile = rankIndex !== -1 && rankedStudents.length > 0 ? ((1 - (rankIndex / rankedStudents.length)) * 100).toFixed(1) : '-'
      
      return {
        ...student,
        analytics: {
          attendance: { total: totalClasses, present, absent, percent: attendancePercent },
          tests: { total: totalTests, avg: avgMarks, latest: latestScore },
          leaderboard: { rank, percentile }
        }
      }
    })

    // Sort alphabetically naturally, but top ranked first if available
    enrichedStudents.sort((a, b) => {
      if (a.analytics.leaderboard.rank !== '-' && b.analytics.leaderboard.rank !== '-') {
        return a.analytics.leaderboard.rank - b.analytics.leaderboard.rank
      }
      return (a.name || '').localeCompare(b.name || '')
    })
    
    setBatchStudents(enrichedStudents)
  }

  const filtered = batches.filter(
    (b) => b.name.toLowerCase().includes(search.toLowerCase())
  )

  const teacherOptions = teachers.map((t) => ({ value: t.profile_id, label: t.name }))

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Batches</h1>
          <p className="text-sm text-gray-600 mt-1">{batches.length} active batches</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dashboard-input pl-10 w-full sm:w-64"
            />
          </div>
          {role === 'admin' && (
            <button
              onClick={openAdd}
              className="dashboard-btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout replacing DataTable */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <p className="text-gray-600 font-medium">No batches found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((batch, index) => (
            <div
              key={batch.id}
              onClick={() => handleRowClick(batch)}
              className="dashboard-card flex flex-col p-5 group cursor-pointer hover:shadow-md transition-all"
            >
              {/* Top: Year & Status */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
                  {new Date(batch.created_at).getFullYear()} BATCH
                </span>
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-green-600">Ongoing</span>
                </div>
              </div>

              {/* Middle: Title & Tags */}
              <div className="flex flex-col gap-2 mb-4 flex-1">
                <h2 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
                  {batch.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    #{batch.subject || 'Core'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                    Div A
                  </span>
                </div>
              </div>

              {/* Bottom: Teacher & CTA */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700 flex-shrink-0">
                    {batch.teachers?.name?.charAt(0) || 'T'}
                  </div>
                  <span className="text-sm font-medium text-gray-600 truncate">
                    {batch.teachers?.name || 'Unassigned'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {role === 'admin' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(batch); }}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                      title="Edit Batch"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRowClick(batch); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    View <Users className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Batch Students & Details Modal */}
      <Modal isOpen={studentsModalOpen} onClose={() => setStudentsModalOpen(false)} title="Batch Overview" size="lg">
        {expandedBatch && (
          <div className="space-y-6">
            
            {/* Batch Info Header */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white border border-gray-200">
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-bold text-gray-900">{expandedBatch.name}</h3>
                <p className="text-sm text-gray-600">Teacher: {expandedBatch.teachers?.name || 'Not assigned'}</p>
              </div>
              
              {/* Quick Actions for Join Links */}
              <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                 {expandedBatch.join_code && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(expandedBatch.join_code); toast.success('Code Copied!') }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200 text-xs font-bold font-mono transition-colors w-full justify-center"
                    title="Copy Join Code"
                  >
                    <Copy className="w-3.5 h-3.5" /> {expandedBatch.join_code}
                  </button>
                 )}
                 {expandedBatch.join_link && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(expandedBatch.join_link); toast.success('Link Copied!') }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200 text-xs font-bold transition-colors w-full justify-center whitespace-nowrap"
                    title="Copy Invite Link"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Copy Link
                  </button>
                 )}
              </div>
            </div>

            {/* Students List or Drilldown */}
            {selectedStudent ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setSelectedStudent(null)} className="p-2 sm:p-2.5 rounded-xl bg-gray-50 hover:bg-white/10 text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 active:scale-95">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{selectedStudent.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{selectedStudent.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard title="Attendance" value={`${selectedStudent?.analytics?.attendance?.percent || 0}%`} icon={ClipboardCheck} color={parseFloat(selectedStudent?.analytics?.attendance?.percent) >= 75 ? 'green' : 'amber'} />
                  <StatsCard title="Tests Taken" value={selectedStudent?.analytics?.tests?.total || 0} icon={BarChart3} color="blue" />
                  <StatsCard title="Avg Score" value={`${selectedStudent?.analytics?.tests?.avg || 0}%`} icon={TrendingUp} color="emerald" />
                  <StatsCard title="Batch Rank" value={selectedStudent?.analytics?.leaderboard?.rank === '-' ? '-' : `#${selectedStudent?.analytics?.leaderboard?.rank}`} icon={Trophy} color="amber" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] sm:text-xs text-gray-600 font-bold uppercase tracking-widest mb-3">Attendance details</p>
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Total Classes</span>
                      <span className="font-bold text-gray-900">{selectedStudent?.analytics?.attendance?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Present</span>
                      <span className="font-bold text-green-500">{selectedStudent?.analytics?.attendance?.present || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1.5">
                      <span className="text-gray-600 font-medium">Absent</span>
                      <span className="font-bold text-red-500">{selectedStudent?.analytics?.attendance?.absent || 0}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] sm:text-xs text-gray-600 font-bold uppercase tracking-widest mb-3">Performance details</p>
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Latest Score</span>
                      <span className="font-bold text-gray-900">{selectedStudent?.analytics?.tests?.latest || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Percentile (Batch)</span>
                      <span className="font-bold text-blue-400">{selectedStudent?.analytics?.leaderboard?.percentile === '-' ? '-' : `${selectedStudent?.analytics?.leaderboard?.percentile}%`}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1.5">
                      <span className="text-gray-600 font-medium">Active Status</span>
                      <span className="font-bold text-green-500">Enrolled</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white" />
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Enrolled Students ({batchStudents.length})</h4>
                  </div>
                  {role === 'admin' && (
                     <button
                      onClick={() => { setStudentsModalOpen(false); handleDelete(expandedBatch.id); }}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                     >
                       <Trash2 className="w-3.5 h-3.5" /> Delete Batch
                     </button>
                  )}
                </div>
                
                <div className="p-1 max-h-[40vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {batchStudents.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                      <p className="text-gray-600 text-sm">No students currently enrolled.</p>
                      <p className="text-gray-600 text-xs mt-1">Share the invite link to add students.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {batchStudents.map((s) => (
                        <div 
                          key={s.id} 
                          onClick={() => setSelectedStudent(s)}
                          className="flex flex-col px-4 py-3 rounded-xl bg-white/5 hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer hover:border-white/20 group relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between z-10">
                            <span className="text-sm font-medium text-gray-900 group-hover:text-white transition-colors">{s.full_name || s.name || "Unknown"}</span>
                            <ChevronLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 rotate-180 text-gray-600 transition-all transform group-hover:translate-x-1" />
                          </div>
                          <span className="text-xs text-gray-600 truncate z-10">{s.email}</span>
                          
                          {/* Quick indicators */}
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/50 z-10">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${parseFloat(s.analytics?.attendance?.percent) >= 75 ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                              {s.analytics?.attendance?.percent || 0}% Att.
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white bg-white/10">
                              {s.analytics?.tests?.total || 0} Tests
                            </span>
                            {s.analytics?.leaderboard?.rank !== '-' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white bg-white/10 ml-auto">
                                Rank #{s.analytics?.leaderboard?.rank}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Batch' : 'Create Batch'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Batch Name
            </label>
            <input
              className="dashboard-input"
              placeholder="e.g. Physics - Morning Batch"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject
            </label>
            <input
              className="dashboard-input"
              placeholder="e.g. Physics, Mathematics"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Assign Teacher
            </label>
            <select
              className="dashboard-input"
              value={form.teacher_id}
              onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
              disabled={teacherOptions.length === 0}
            >
              <option value="">
                {teacherOptions.length > 0 ? "Select a teacher" : "No teachers available (Add one first)"}
              </option>
              {teacherOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Invite Expiry (Days)
              </label>
              <input
                type="number"
                className="dashboard-input"
                placeholder="Blank = Never"
                value={form.invite_expiry_days}
                onChange={(e) => setForm({ ...form, invite_expiry_days: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max Usages
              </label>
              <input
                type="number"
                className="dashboard-input"
                placeholder="Blank = Unlimited"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="dashboard-btn-primary"
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Add Student Button Component for Students Tab
const StudentsPageAddButton = ({ onStudentAdded }) => {
  const { profile } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Please enter student name')
      return
    }
    if (!form.email.trim()) {
      toast.error('Please enter student email')
      return
    }
    if (!form.password.trim()) {
      toast.error('Please enter student password')
      return
    }
    setSaving(true)
    try {
      console.log('StudentsPageAddButton: Creating student with data:', { 
        email: form.email, 
        name: form.name, 
        phone: form.phone,
        institute_id: profile?.institute_id 
      })
      
      // Check session first
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("Your session has expired. Please log out and back in to add students.")
      }

      const { data, error: invokeError } = await supabase.functions.invoke('create-user', {
        body: {
          email: form.email,
          password: form.password,
          role: 'student',
          name: form.name,
          phone: form.phone || null,
          institute_id: profile?.institute_id
        }
      })
      
      console.log('StudentsPageAddButton: Edge function response:', { data, error: invokeError })
      
      if (invokeError) {
        if (invokeError.message?.includes('Invalid JWT') || invokeError.message?.includes('Unauthorized')) {
          throw new Error("Authentication failed: Your session is invalid. Please refresh the page or re-login.")
        }
        throw new Error(invokeError.message)
      }
      if (data?.error) throw new Error(data.error)

      console.log('StudentsPageAddButton: Student created successfully, triggering refresh...')
      
      setModalOpen(false)
      setForm({ name: '', email: '', password: '', phone: '' })
      toast.success('Student added successfully!')
      
      // Trigger refresh callback with a small delay to ensure DB operation is complete
      if (onStudentAdded) {
        setTimeout(() => {
          console.log('StudentsPageAddButton: Executing refresh callback...')
          onStudentAdded()
        }, 500)
      }
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to add student')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
      >
        <Plus size={18} />
        Add Student
      </button>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Student"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter student name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="student@example.com"
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1234567890"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Enter password"
            required
          />
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// Add Teacher Button Component for Teachers Tab
const TeachersPageAddButton = ({ onTeacherAdded }) => {
  const { profile } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', subject: '', phone: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Please enter teacher name')
      return
    }
    if (!form.email.trim()) {
      toast.error('Please enter teacher email')
      return
    }
    if (!form.password.trim()) {
      toast.error('Please enter teacher password')
      return
    }
    if (!form.subject.trim()) {
      toast.error('Please enter subject expertise')
      return
    }
    setSaving(true)
    try {
      // Check session first
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("Your session has expired. Please log out and back in to add teachers.")
      }

      const { data, error: invokeError } = await supabase.functions.invoke('create-user', {
        body: {
          email: form.email,
          password: form.password,
          role: 'teacher',
          name: form.name,
          subject: form.subject,
          phone: form.phone || null,
          institute_id: profile?.institute_id
        }
      })
      
      if (invokeError) {
        if (invokeError.message?.includes('Invalid JWT') || invokeError.message?.includes('Unauthorized')) {
          throw new Error("Authentication failed: Your session is invalid. Please refresh the page or re-login.")
        }
        throw new Error(invokeError.message)
      }
      if (data?.error) throw new Error(data.error)

      setModalOpen(false)
      setForm({ name: '', email: '', password: '', subject: '', phone: '' })
      toast.success('Teacher added successfully!')
      
      // Trigger refresh callback if provided
      if (onTeacherAdded) {
        onTeacherAdded()
      }
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to add teacher')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
      >
        <Plus size={18} />
        Add Teacher
      </button>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Teacher"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter teacher name"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="teacher@example.com"
            required
          />
          <Input
            label="Subject Expertise"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="e.g. Advanced Mathematics"
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. +91 98765 43210"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimum 6 characters"
            required
          />
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Teacher'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

const BatchesPage = () => {
  const { role, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('batches')
  const [refreshKey, setRefreshKey] = useState(0)

  // Callback to trigger students data refresh
  const handleStudentAdded = () => {
    console.log('BatchesPage: Student added, clearing cache and refreshing...')
    // Clear the cache to force refetch of students data
    clearAppCache(`students-list-${profile?.institute_id}`)
    // Force multiple refresh approaches
    setRefreshKey(prev => prev + 1)
    
    // Additional: Try to trigger a window-level refresh event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('forceRefreshStudents'))
      console.log('BatchesPage: Dispatched forceRefreshStudents event')
    }, 100)
  }

  // Callback to trigger teachers data refresh  
  const handleTeacherAdded = () => {
    // Clear the cache to force refetch of teachers data
    clearAppCache('teachers-list')
    // Force component remount as backup
    setRefreshKey(prev => prev + 1)
  }

  const tabs = [
    { id: 'batches', label: role === 'student' ? 'My Batches' : 'Batches', icon: Layers, roles: ['admin', 'teacher', 'student', 'master_admin'] },
    { id: 'join', label: 'Join Batch', icon: PlusCircle, roles: ['student'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['admin', 'master_admin'] },
    { id: 'teachers', label: 'Teachers', icon: Users, roles: ['admin', 'master_admin'] },
  ].filter(t => t.roles.includes(role))

  return (
    <div className="space-y-6">
      {/* Tab Navigation with Action Button */}
      <div className="flex items-center justify-between">
        <div className="flex border-b border-gray-200 gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </div>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabBatch"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons for Different Tabs - REMOVED: buttons now inside respective pages */}
      </div>

      <div className="pt-2" key={refreshKey}>
        {activeTab === 'batches' && <BatchList />}
        {activeTab === 'join' && <JoinBatch hideHeader={true} />}
        {activeTab === 'students' && <StudentsPage hideHeader={true} />}
        {activeTab === 'teachers' && <TeachersPage hideHeader={true} />}
      </div>
    </div>
  )
}

export default BatchesPage

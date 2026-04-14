import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Users, Search, Copy, Link as LinkIcon, CheckCircle, AlertCircle, Play, Trophy, ClipboardCheck, BarChart3, TrendingUp, ChevronLeft, PlusCircle, Layers } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import StatsCard from '../../components/ui/StatsCard'
import { Input, Select } from '../../components/ui/FormField'
import { getBatches, createBatch, updateBatch, deleteBatch } from '../../services/batchService'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { CardSkeleton } from '../../components/ui/Skeletons'

import StudentsPage from './StudentsPage'
import TeachersPage from './TeachersPage'
import AttendancePage from './AttendancePage'
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
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
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

      // invite_expiry — only add if column exists (requires DB migration)
      try {
        if (form.invite_expiry_days) {
          const d = new Date()
          d.setDate(d.getDate() + parseInt(form.invite_expiry_days))
          payload.invite_expiry = d.toISOString()
        }
        // max_uses — only add when user provides a value
        if (form.max_uses && !isNaN(parseInt(form.max_uses))) {
          payload.max_uses = parseInt(form.max_uses)
        }
      } catch {
        // columns may not exist yet — skip silently
      }
      if (editing) {
        await updateBatch(editing.id, payload)
        setToast({ type: 'success', message: 'Batch updated successfully' })
      } else {
        payload.institute_id = profile?.institute_id
        await createBatch(payload)
        setToast({ type: 'success', message: 'Batch created successfully' })
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: err.message || 'Failed to save batch' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this batch? Students in this batch will be unassigned.')) return
    try {
      await deleteBatch(id)
      setToast({ type: 'success', message: 'Batch deleted' })
      if (expandedBatch?.id === id) {
        setStudentsModalOpen(false)
      }
      fetchData()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to delete batch' })
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
      supabase.from('batch_students').select('students(id, name, full_name, email)').eq('batch_id', batch.id),
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
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium ${ toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
            >
              Batches Command Center
            </motion.h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">{batches.length} active batches managed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] outline-none focus:border-white/30 w-full sm:w-64 transition-all"
            />
          </div>
          {role === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 text-sm font-bold shadow-lg active:scale-95 transition-all w-full sm:w-auto overflow-hidden whitespace-nowrap"
            >
              <Plus className="w-5 h-5 flex-shrink-0" /> <span className="hidden sm:inline">Create Batch</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Grid Layout replacing DataTable */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm">
          <p className="text-[var(--text-secondary)] font-medium">No batches found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((batch) => (
            <motion.div
              key={batch.id}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleRowClick(batch)}
              className="glass-card flex flex-col aspect-square p-5 sm:p-6 justify-between group cursor-pointer hover:border-white/30 relative overflow-hidden preserve-3d"
            >

              {/* Top: Year & Status */}
              <div className="flex justify-between items-center z-10 w-full">
                <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase bg-[var(--bg-card)] px-2.5 py-1 rounded border border-[var(--border-subtle)]">
                  {new Date(batch.created_at).getFullYear()} BATCH
                </span>
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-green-400">Ongoing</span>
                </div>
              </div>

              {/* Middle: Title & Tags */}
              <div className="flex flex-col gap-2 z-10 my-auto pt-4 relative">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight line-clamp-2 drop-shadow-sm transition-all duration-300">
                  {batch.name}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/10 text-white/70 border-white/20 border backdrop-blur-md">
                    #{batch.subject || 'Core'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/5 text-white/50 border-white/10 border backdrop-blur-md">
                    Div A
                  </span>
                </div>
              </div>

              {/* Bottom: Teacher & CTA */}
              <div className="z-10 mt-auto pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between bg-white/5 -mx-5 sm:-mx-6 px-5 sm:px-6 -mb-5 sm:-mb-6 pb-5 sm:pb-6 rounded-b-[20px]">
                <div className="flex items-center gap-2 max-w-[50%]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--border-subtle)] flex items-center justify-center text-xs font-bold text-[var(--text-primary)] shadow-inner flex-shrink-0">
                    {batch.teachers?.name?.charAt(0) || 'T'}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] truncate">
                    {batch.teachers?.name || 'Unassigned'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {role === 'admin' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(batch); }}
                      className="p-1.5 sm:p-2 rounded-xl bg-[var(--bg-card)] hover:bg-white/10 text-[var(--text-secondary)] hover:text-white border-transparent hover:border-white/10 transition-colors border"
                      title="Edit Batch"
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRowClick(batch); }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide active:scale-95 flex items-center gap-1 sm:gap-1.5 shadow-sm transition-all bg-white text-black hover:bg-gray-200"
                  >
                    View Detail <Users className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Batch Students & Details Modal */}
      <Modal isOpen={studentsModalOpen} onClose={() => setStudentsModalOpen(false)} title="Batch Overview" size="lg">
        {expandedBatch && (
          <div className="space-y-6">
            
            {/* Batch Info Header */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{expandedBatch.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">Teacher: {expandedBatch.teachers?.name || 'Not assigned'}</p>
              </div>
              
              {/* Quick Actions for Join Links */}
              <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                 {expandedBatch.join_code && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(expandedBatch.join_code);
                      setToast({ type: 'success', message: 'Join Code copied!' });
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs font-bold font-mono transition-colors w-full justify-center"
                    title="Copy Join Code"
                  >
                    <Copy className="w-3.5 h-3.5" /> {expandedBatch.join_code}
                  </button>
                 )}
                 {expandedBatch.join_link && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(expandedBatch.join_link);
                      setToast({ type: 'success', message: 'Invite Link copied!' });
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs font-bold transition-colors w-full justify-center whitespace-nowrap"
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
                  <button onClick={() => setSelectedStudent(null)} className="p-2 sm:p-2.5 rounded-xl bg-[var(--bg-app)] hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)] active:scale-95">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h4 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">{selectedStudent.name}</h4>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{selectedStudent.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard title="Attendance" value={`${selectedStudent?.analytics?.attendance?.percent || 0}%`} icon={ClipboardCheck} color={parseFloat(selectedStudent?.analytics?.attendance?.percent) >= 75 ? 'green' : 'amber'} />
                  <StatsCard title="Tests Taken" value={selectedStudent?.analytics?.tests?.total || 0} icon={BarChart3} color="white" />
                  <StatsCard title="Avg Score" value={`${selectedStudent?.analytics?.tests?.avg || 0}%`} icon={TrendingUp} color="white" />
                  <StatsCard title="Batch Rank" value={selectedStudent?.analytics?.leaderboard?.rank === '-' ? '-' : `#${selectedStudent?.analytics?.leaderboard?.rank}`} icon={Trophy} color="white" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-[var(--bg-app)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
                    <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-3">Attendance details</p>
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--border-subtle)]">
                      <span className="text-[var(--text-secondary)] font-medium">Total Classes</span>
                      <span className="font-bold text-[var(--text-primary)]">{selectedStudent?.analytics?.attendance?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--border-subtle)]">
                      <span className="text-[var(--text-secondary)] font-medium">Present</span>
                      <span className="font-bold text-green-500">{selectedStudent?.analytics?.attendance?.present || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1.5">
                      <span className="text-[var(--text-secondary)] font-medium">Absent</span>
                      <span className="font-bold text-red-500">{selectedStudent?.analytics?.attendance?.absent || 0}</span>
                    </div>
                  </div>
                  
                  <div className="bg-[var(--bg-app)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
                    <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-3">Performance details</p>
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--border-subtle)]">
                      <span className="text-[var(--text-secondary)] font-medium">Latest Score</span>
                      <span className="font-bold text-[var(--text-primary)]">{selectedStudent?.analytics?.tests?.latest || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-[var(--border-subtle)]">
                      <span className="text-[var(--text-secondary)] font-medium">Percentile (Batch)</span>
                      <span className="font-bold text-blue-400">{selectedStudent?.analytics?.leaderboard?.percentile === '-' ? '-' : `${selectedStudent?.analytics?.leaderboard?.percentile}%`}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1.5">
                      <span className="text-[var(--text-secondary)] font-medium">Active Status</span>
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
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Enrolled Students ({batchStudents.length})</h4>
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
                    <div className="p-8 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl">
                      <p className="text-[var(--text-secondary)] text-sm">No students currently enrolled.</p>
                      <p className="text-gray-600 text-xs mt-1">Share the invite link to add students.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {batchStudents.map((s) => (
                        <div 
                          key={s.id} 
                          onClick={() => setSelectedStudent(s)}
                          className="flex flex-col px-4 py-3 rounded-xl bg-white/5 hover:bg-[var(--border-subtle)] transition-colors border border-[var(--border-subtle)] cursor-pointer hover:border-white/20 group relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between z-10">
                            <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-white transition-colors">{s.full_name || s.name || "Unknown"}</span>
                            <ChevronLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 rotate-180 text-[var(--text-secondary)] transition-all transform group-hover:translate-x-1" />
                          </div>
                          <span className="text-xs text-[var(--text-secondary)] truncate z-10">{s.email}</span>
                          
                          {/* Quick indicators */}
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border-subtle)]/50 z-10">
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
          <Input
            label="Batch Name"
            placeholder="e.g. Physics - Morning Batch"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Subject"
            placeholder="e.g. Physics, Mathematics"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <Select
            label="Assign Teacher"
            placeholder={teacherOptions.length > 0 ? "Select a teacher" : "No teachers available (Add one first)"}
            options={teacherOptions}
            value={form.teacher_id}
            onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
            disabled={teacherOptions.length === 0}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Invite Expiry (Days)"
              placeholder="Blank = Never"
              value={form.invite_expiry_days}
              onChange={(e) => setForm({ ...form, invite_expiry_days: e.target.value })}
            />
            <Input
              type="number"
              label="Max Usages"
              placeholder="Blank = Unlimited"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] border border-transparent hover:border-[var(--border-subtle)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-5 py-2 rounded-xl text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all bg-white text-black hover:bg-gray-200"
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const BatchesPage = () => {
  const { role } = useAuth()
  const [activeTab, setActiveTab] = useState('batches')

  const tabs = [
    { id: 'batches', label: role === 'student' ? 'My Batches' : 'Batches', icon: Layers, roles: ['admin', 'teacher', 'student', 'master_admin'] },
    { id: 'join', label: 'Join Batch', icon: PlusCircle, roles: ['student'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['admin', 'master_admin'] },
    { id: 'teachers', label: 'Teachers', icon: Users, roles: ['admin', 'master_admin'] },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, roles: ['admin', 'teacher', 'student', 'master_admin'] },
  ].filter(t => t.roles.includes(role))

  return (
    <div className="space-y-6">
      <div className="flex border-b border-[var(--border-subtle)] gap-8 mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === tab.id 
                ? 'text-[var(--text-primary)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabBatch"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
              />
            )}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {activeTab === 'batches' && <BatchList />}
        {activeTab === 'join' && <JoinBatch hideHeader={true} />}
        {activeTab === 'students' && <StudentsPage hideHeader={true} />}
        {activeTab === 'teachers' && <TeachersPage hideHeader={true} />}
        {activeTab === 'attendance' && <AttendancePage hideHeader={true} />}
      </div>
    </div>
  )
}

export default BatchesPage

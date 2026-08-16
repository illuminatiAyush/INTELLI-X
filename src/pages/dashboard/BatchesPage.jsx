import { useState, useEffect } from 'react'
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
      const payload = {
        name: form.name.trim(),
        subject: form.subject.trim() || null,
      }
      if (form.teacher_id) payload.teacher_id = form.teacher_id

      if (form.invite_expiry_days) {
        const d = new Date()
        d.setDate(d.getDate() + parseInt(form.invite_expiry_days))
        payload.invite_expiry = d.toISOString()
      }
      if (form.max_uses && !isNaN(parseInt(form.max_uses))) {
        payload.max_uses = parseInt(form.max_uses)
      }
      if (editing) {
        await updateBatch(editing.id, payload)
      } else {
        payload.institute_id = profile?.institute_id
        await createBatch(payload)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to save batch')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    if (!confirm('Delete this batch? Students in this batch will be unassigned.')) return
    try {
      await deleteBatch(id)
      if (expandedBatch?.id === id) {
        setStudentsModalOpen(false)
      }
      fetchData()
    } catch (err) {
      console.error(err)
      alert('Failed to delete batch')
    }
  }

  const handleRowClick = async (batch) => {
    setExpandedBatch(batch)
    setStudentsModalOpen(true)
    setSelectedStudent(null)
    
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Batches</h1>
            <p className="text-gray-500 text-sm mt-1">{batches.length} active batches managed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all"
            />
          </div>
          {role === 'admin' && (
            <button
              onClick={openAdd}
              className="btn-primary flex-shrink-0"
            >
              <Plus className="w-5 h-5 mr-2" /> Create Batch
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-[16px]">
           <Layers className="w-10 h-10 text-gray-300 mb-3" />
           <p className="text-gray-500 font-medium">No batches found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((batch) => (
            <div
              key={batch.id}
              onClick={() => handleRowClick(batch)}
              className="academic-card hover:border-blue-300 hover:bg-blue-50 flex flex-col justify-between cursor-pointer group transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-100 px-2.5 py-1 rounded-md">
                    {new Date(batch.created_at).getFullYear()} BATCH
                  </span>
                  <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] uppercase font-bold text-green-700">Ongoing</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 leading-snug mb-2 group-hover:text-blue-700 transition-colors">
                  {batch.name}
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                    {batch.subject || 'Core'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">
                    {batch.teachers?.name?.charAt(0) || 'T'}
                  </div>
                  <span className="text-sm font-medium text-gray-600 truncate max-w-[120px]">
                    {batch.teachers?.name || 'Unassigned'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  {role === 'admin' && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(batch); }}
                        className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(batch.id, e); }}
                        className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <div className="p-1.5 text-gray-400 group-hover:text-blue-600">
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </div>
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
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-[12px] bg-gray-50 border border-gray-200">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{expandedBatch.name}</h3>
                <p className="text-sm text-gray-500">Teacher: {expandedBatch.teachers?.name || 'Not assigned'}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                 {expandedBatch.join_code && (
                  <button
                    onClick={() => navigator.clipboard.writeText(expandedBatch.join_code)}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold font-mono"
                  >
                    <Copy className="w-3.5 h-3.5" /> Code: {expandedBatch.join_code}
                  </button>
                 )}
                 {expandedBatch.join_link && (
                  <button
                    onClick={() => navigator.clipboard.writeText(expandedBatch.join_link)}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Copy Link
                  </button>
                 )}
              </div>
            </div>

            {selectedStudent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 tracking-tight">{selectedStudent.name}</h4>
                    <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard title="Attendance" value={`${selectedStudent?.analytics?.attendance?.percent || 0}%`} icon={ClipboardCheck} color="success" />
                  <StatsCard title="Tests Taken" value={selectedStudent?.analytics?.tests?.total || 0} icon={BarChart3} color="primary" />
                  <StatsCard title="Avg Score" value={`${selectedStudent?.analytics?.tests?.avg || 0}%`} icon={TrendingUp} color="warning" />
                  <StatsCard title="Batch Rank" value={selectedStudent?.analytics?.leaderboard?.rank === '-' ? '-' : `#${selectedStudent?.analytics?.leaderboard?.rank}`} icon={Trophy} color="danger" />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Enrolled Students ({batchStudents.length})</h4>
                  </div>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  {batchStudents.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
                      <p className="text-gray-500 text-sm font-medium">No students currently enrolled.</p>
                      <p className="text-gray-400 text-xs mt-1">Share the invite link to add students.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {batchStudents.map((s) => (
                        <div 
                          key={s.id} 
                          onClick={() => setSelectedStudent(s)}
                          className="flex flex-col px-4 py-3 rounded-xl bg-white hover:bg-blue-50 transition-colors border border-gray-200 cursor-pointer hover:border-blue-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{s.full_name || s.name || "Unknown"}</span>
                            <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                          <span className="text-xs text-gray-500 truncate mt-0.5 mb-3">{s.email}</span>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-green-700 bg-green-100">
                              {s.analytics?.attendance?.percent || 0}% Att.
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-gray-700 bg-gray-100">
                              {s.analytics?.tests?.total || 0} Tests
                            </span>
                            {s.analytics?.leaderboard?.rank !== '-' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-amber-700 bg-amber-100 ml-auto">
                                Rank #{s.analytics?.leaderboard?.rank}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name.trim()} className="btn-primary">
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
      <div className="flex border-b border-gray-200 gap-8 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div>
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

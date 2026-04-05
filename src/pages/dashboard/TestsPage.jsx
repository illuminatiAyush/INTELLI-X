import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, FileText, Trash2, Search, ListOrdered, Sparkles, Brain, Clock, CheckCircle2 } from 'lucide-react'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/FormField'
import { getTests, createTest, deleteTest } from '../../services/testService'
import { getResultsByTest, upsertResults } from '../../services/resultService'
import { getStudentsByBatch } from '../../services/studentService'
import { getBatches } from '../../services/batchService'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import AITestCreatorModal from '../../components/teacher/AITestCreatorModal'

const TestsPage = () => {
  const { user, role } = useAuth()
  const [tests, setTests] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [resultsModal, setResultsModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState(null)
  const [testStudents, setTestStudents] = useState([])
  const [marks, setMarks] = useState({})
  const [form, setForm] = useState({ title: '', batch_id: '', date: new Date().toISOString().split('T')[0], total_marks: '100' })
  const [saving, setSaving] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)

  const fetchData = async () => {
    try {
      let query = supabase.from('tests').select('*, batches(name), questions(id)').order('date', { ascending: false })
      
      if (role === 'teacher') {
        const { data: myBatches } = await supabase.from('batches').select('id').eq('teacher_id', user.id)
        const batchIds = (myBatches || []).map((b) => b.id)
        if (batchIds.length > 0) {
          query = query.in('batch_id', batchIds)
        } else {
          setTests([])
          setLoading(false)
          return
        }
      } else if (role === 'student') {
        const { data: studentBatches } = await supabase.from('batch_students').select('batch_id').eq('student_id', user.id)
        const studentBatchIds = (studentBatches || []).map(b => b.batch_id)
        if (studentBatchIds.length > 0) {
          query = query.in('batch_id', studentBatchIds)
        } else {
          setTests([])
          setLoading(false)
          return
        }
      }
      
      const { data } = await query
      setTests(data || [])

      const { data: batchData } = role === 'teacher'
        ? await supabase.from('batches').select('*').eq('teacher_id', user.id)
        : await supabase.from('batches').select('*')
      setBatches(batchData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Realtime updates for tests
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('tests-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tests' }, payload => {
        fetchData()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleCreateTest = async () => {
    if (!form.title.trim() || !form.batch_id) return
    setSaving(true)
    try {
      await createTest({
        title: form.title,
        batch_id: form.batch_id,
        date: form.date,
        total_marks: parseInt(form.total_marks) || 100,
        created_by: user.id,
      })
      setModalOpen(false)
      setForm({ title: '', batch_id: '', date: new Date().toISOString().split('T')[0], total_marks: '100' })
      fetchData()
      toast.success('Test created successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to create test')
    } finally {
      setSaving(false)
    }
  }

  const openResults = async (test) => {
    setSelectedTest(test)
    try {
      const [students, results] = await Promise.all([
        getStudentsByBatch(test.batch_id),
        getResultsByTest(test.id),
      ])
      setTestStudents(students)
      const marksMap = {}
      results.forEach((r) => { marksMap[r.student_id] = r.marks })
      setMarks(marksMap)
      setResultsModal(true)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load results')
    }
  }

  const handleSaveResults = async () => {
    if (!selectedTest) return
    setSaving(true)
    try {
      const entries = testStudents
        .filter((s) => marks[s.id] !== undefined && marks[s.id] !== '')
        .map((s) => ({
          student_id: s.id,
          test_id: selectedTest.id,
          marks: parseInt(marks[s.id]) || 0,
        }))
        .sort((a, b) => b.marks - a.marks)
        .map((entry, i) => ({ ...entry, rank: i + 1 }))

      await upsertResults(entries)
      setResultsModal(false)
      toast.success('Results saved successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save results')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTest = async (id) => {
    try {
      await deleteTest(id)
      fetchData()
      toast.success('Test deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete test')
    }
  }

  const handleEndTest = async (id) => {
    try {
      const { error } = await supabase.from('tests').update({ end_time: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      toast.success('Test ended successfully')
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to end test')
    }
  }

  const handleStartTest = async (id) => {
    try {
      const { error } = await supabase.from('tests').update({ start_time: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      toast.success('Test started successfully')
      fetchData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to start test')
    }
  }

  const filtered = tests.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
  const canManage = role === 'admin' || role === 'teacher'

  const columns = [
    { key: 'title', label: 'Test Title', render: (r) => (
      <div className="flex items-center gap-2">
        <span>{r.title}</span>
        {r.is_ai_generated && (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>
        )}
      </div>
    )},
    { key: 'batch_id', label: 'Batch', render: (r) => r.batches?.name || '-' },
    { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { key: 'total_marks', label: 'Total Marks' },
    { key: 'questions_count', label: 'Questions', render: (r) => r.questions?.length || 0 },
  ]

  if (canManage) {
    columns.push({
      key: 'status_col',
      label: 'Status',
      render: (row) => {
        const now = new Date()
        const hasQuestions = row.questions?.length > 0
        if (!hasQuestions) return <span className="text-xs text-[var(--text-secondary)]">Manual</span>
        if (row.end_time && new Date(row.end_time) < now) return <span className="text-xs text-red-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ended</span>
        
        if (row.start_time && new Date(row.start_time) > now) {
          return (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled</span>
              {canManage && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleStartTest(row.id) }}
                  className="px-2 py-0.5 ml-2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  Start Now
                </button>
              )}
            </div>
          )
        }
        
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Active</span>
            {canManage && (
              <button
                onClick={(e) => { e.stopPropagation(); handleEndTest(row.id) }}
                className="px-2 py-0.5 ml-2 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                End Now
              </button>
            )}
          </div>
        )
      }
    })
    columns.push({
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openResults(row) }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-xs"
          >
            <ListOrdered className="w-3.5 h-3.5" /> Results
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteTest(row.id) }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    })
  }

  const batchOptions = batches.map((b) => ({ value: b.id, label: b.name }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
          >
            Tests & Results
          </motion.h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">{tests.length} tests conducted</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 outline-none focus:border-[var(--color-purple)] focus:bg-[var(--bg-surface)] w-64 transition-all"
            />
          </div>
          {canManage && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAiModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
              >
                <Brain className="w-5 h-5" /> Create AI Test
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-semibold hover:border-[var(--border-strong)] transition-all"
              >
                <Plus className="w-5 h-5" /> Manual Test
              </motion.button>
            </>
          )}
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <DataTable columns={columns} data={filtered} emptyMessage="No tests found" />
      </div>

      {/* AI Test Creator Modal */}
      <AITestCreatorModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        batches={batches}
        onTestCreated={fetchData}
      />

      {/* Create Manual Test Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Manual Test">
        <div className="space-y-4">
          <Input label="Test Title" placeholder="e.g. Physics Unit Test 1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="Batch" placeholder={batchOptions.length > 0 ? "Select batch" : "No batches available (Create one first)"} options={batchOptions} value={form.batch_id} onChange={(e) => setForm({ ...form, batch_id: e.target.value })} disabled={batchOptions.length === 0} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-purple-500/50" />
            </div>
            <Input label="Total Marks" type="number" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={handleCreateTest} disabled={saving || !form.title.trim() || !form.batch_id} className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Test'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Enter Results Modal */}
      <Modal isOpen={resultsModal} onClose={() => setResultsModal(false)} title={`Results: ${selectedTest?.title || ''}`} size="lg">
        <div className="space-y-4">
          <div className="bg-[var(--bg-app)]/50 p-4 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-medium">
            Enter marks for each student (out of {selectedTest?.total_marks}). Ranks are calculated automatically based on score.
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {testStudents.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-secondary)]">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No students in this batch</p>
              </div>
            ) : (
              testStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between px-5 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]/50 hover:border-[var(--color-purple)]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-app)] flex items-center justify-center text-xs font-bold text-[var(--text-primary)] border border-[var(--border-subtle)]">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{student.name}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={selectedTest?.total_marks || 100}
                    placeholder="Marks"
                    value={marks[student.id] ?? ''}
                    onChange={(e) => setMarks({ ...marks, [student.id]: e.target.value })}
                    className="w-24 px-4 py-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm text-center font-bold outline-none focus:border-[var(--color-purple)] focus:ring-1 focus:ring-[var(--color-purple)]"
                  />
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)]">
            <button 
              onClick={() => setResultsModal(false)} 
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)] transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveResults} 
              disabled={saving} 
              className="px-8 py-2.5 rounded-xl bg-[var(--color-purple)] text-white text-sm font-bold shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {saving ? 'Saving Results...' : 'Save All Results'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TestsPage

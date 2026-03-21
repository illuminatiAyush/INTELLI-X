import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import DataTable from '../../components/ui/DataTable'
import { Select } from '../../components/ui/FormField'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const ResultsPage = () => {
  const { user, role } = useAuth()
  const [results, setResults] = useState([])
  const [batches, setBatches] = useState([])
  const [tests, setTests] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedTest, setSelectedTest] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        let query = supabase.from('batches').select('*').order('name')
        if (role === 'teacher') query = query.eq('teacher_id', user.id)
        const { data } = await query
        setBatches(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBatches()
  }, [])

  useEffect(() => {
    if (!selectedBatch) { setTests([]); setResults([]); return }
    const fetchTests = async () => {
      const { data } = await supabase.from('tests').select('*').eq('batch_id', selectedBatch).order('date', { ascending: false })
      setTests(data || [])
    }
    fetchTests()
  }, [selectedBatch])

  useEffect(() => {
    if (!selectedTest) { setResults([]); return }
    const fetchResults = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('results')
          .select('*, students(name), tests(title, total_marks)')
          .eq('test_id', selectedTest)
          .order('rank', { ascending: true, nullsFirst: false })
        setResults(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [selectedTest])

  // For students, show their own results directly
  useEffect(() => {
    if (role !== 'student') return
    const fetchStudentResults = async () => {
      try {
        const { data: students } = await supabase.from('students').select('id').eq('profile_id', user.id)
        const studentId = students?.[0]?.id
        if (!studentId) { setLoading(false); return }
        const { data } = await supabase
          .from('results')
          .select('*, students(name), tests(title, total_marks, date, batches(name))')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false })
        setResults(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudentResults()
  }, [role, user])

  const columns = role === 'student'
    ? [
        { key: 'test', label: 'Test', render: (r) => r.tests?.title || '-' },
        { key: 'batch', label: 'Batch', render: (r) => r.tests?.batches?.name || '-' },
        { key: 'date', label: 'Date', render: (r) => r.tests?.date ? new Date(r.tests.date).toLocaleDateString() : '-' },
        { key: 'marks', label: 'Marks', render: (r) => `${r.marks}/${r.tests?.total_marks || '-'}` },
        { key: 'percentage', label: '%', render: (r) => r.tests?.total_marks ? `${((r.marks / r.tests.total_marks) * 100).toFixed(1)}%` : '-' },
        {
          key: 'rank',
          label: 'Rank',
          render: (r) => r.rank ? (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.rank === 1 ? 'bg-amber-500/20 text-amber-400' : r.rank <= 3 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'}`}>
              #{r.rank}
            </span>
          ) : '-',
        },
      ]
    : [
        { key: 'student', label: 'Student', render: (r) => r.students?.name || '-' },
        { key: 'marks', label: 'Marks', render: (r) => `${r.marks}/${r.tests?.total_marks || '-'}` },
        { key: 'percentage', label: '%', render: (r) => r.tests?.total_marks ? `${((r.marks / r.tests.total_marks) * 100).toFixed(1)}%` : '-' },
        {
          key: 'rank',
          label: 'Rank',
          render: (r) => r.rank ? (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.rank === 1 ? 'bg-amber-500/20 text-amber-400' : r.rank <= 3 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'}`}>
              #{r.rank}
            </span>
          ) : '-',
        },
      ]

  const batchOptions = batches.map((b) => ({ value: b.id, label: b.name }))
  const testOptions = tests.map((t) => ({ value: t.id, label: `${t.title} (${new Date(t.date).toLocaleDateString()})` }))

  return (
    <div className="space-y-8">
      <div>
        <motion.h1 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          Results
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
          {role === 'student' ? 'Your test scores and rankings' : 'View and manage test results across your batches'}
        </p>
      </div>

      {role !== 'student' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex-1">
            <Select 
              label="Batch" 
              placeholder="Choose a batch" 
              options={batchOptions} 
              value={selectedBatch} 
              onChange={(e) => { setSelectedBatch(e.target.value); setSelectedTest('') }} 
            />
          </div>
          <div className="flex-1">
            <Select 
              label="Test" 
              placeholder="Choose a test" 
              options={testOptions} 
              value={selectedTest} 
              onChange={(e) => setSelectedTest(e.target.value)} 
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[var(--color-purple)]/20 border-t-[var(--color-purple)] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
          <DataTable columns={columns} data={results} emptyMessage={role === 'student' ? 'No results found for your account' : 'Select a batch and test to view results'} />
        </div>
      )}
    </div>
  )
}

export default ResultsPage

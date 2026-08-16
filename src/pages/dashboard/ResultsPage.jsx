import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import DataTable from '../../components/ui/DataTable'
import { Select } from '../../components/ui/FormField'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Sparkles, Download, X, AlertTriangle, Trophy } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'
import { useAppQuery } from '../../hooks/useAppQuery'
import { TableSkeleton } from '../../components/ui/Skeletons'

const ResultsPage = ({ hideHeader = false }) => {
  const { user, role } = useAuth()
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedTest, setSelectedTest] = useState('')
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)

  // 1. Fetch Batches (and tests if student)
  const { data: initialData, loading: initialLoading } = useAppQuery(`results-init-${role}-${user?.id}`, async () => {
    if (!user) return { batches: [], studentResults: [] }
    
    let batches = []
    if (role !== 'student') {
      let query = supabase.from('batches').select('id, name').order('name')
      if (role === 'teacher') query = query.eq('teacher_id', user.id)
      const { data } = await query
      batches = data || []
    }

    let studentResults = []
    if (role === 'student') {
      const studentId = user.id
      const { data } = await supabase
          .from('results')
          .select('id, marks, rank, violation_count, tests(id, title, total_marks, date, batches(name))')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false })
        studentResults = data || []
    }

    return { batches, studentResults }
  }, { enabled: !!user })

  const batches = initialData?.batches || []
  const [tests, setTests] = useState([])
  const [results, setResults] = useState(initialData?.studentResults || [])
  const [loading, setLoading] = useState(false)

  const isInitialLoading = initialLoading && !initialData


  const handleGeneratePDF = (r) => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(22)
      doc.setTextColor('#000000')
      doc.text('IntelliX Test Report', 105, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.setTextColor('#000000')
      
      const studentName = role === 'student' 
        ? user?.user_metadata?.full_name 
        : (r.students?.full_name || r.students?.name || "Unknown");
        
      doc.text(`Student: ${studentName}`, 14, 40)
      doc.text(`Test Name: ${r.tests?.title || 'Unknown Test'}`, 14, 50)
      
      const total = r.tests?.total_marks || '-'
      const pct = total !== '-' ? ((r.marks / total) * 100).toFixed(1) : '-'
      
      doc.text(`Marks Obtained: ${r.marks} / ${total}`, 14, 60)
      doc.text(`Percentage: ${pct}%`, 14, 70)
      doc.text(`Global Rank: ${r.rank ? '#' + r.rank : 'N/A'}`, 14, 80)
      
      if (r.violation_count > 0) {
        doc.setTextColor('#ef4444')
        doc.text(`⚠️ Tab Switch Violations: ${r.violation_count}`, 14, 90)
        doc.setTextColor('#000000')
      }

      const fileName = `InteliX_${(studentName || 'Student').replace(/\s+/g, '_')}_${(r.tests?.title || 'Report').replace(/\s+/g, '_')}.pdf`
      doc.save(fileName)
      toast.success('Report downloaded successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF')
    }
  }

  useEffect(() => {
    if (initialData?.studentResults) {
      setResults(initialData.studentResults)
    }
  }, [initialData])

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
          .select('*, students(name, full_name), tests(title, total_marks)')
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

  const renderActions = (r) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleGeneratePDF(r)}
        className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent hover:border-gray-300 transition-all shadow-sm"
        title="Download Report (PDF)"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  )

  const columns = role === 'student'
    ? [
        { key: 'test', label: 'Test', render: (r) => <span className="font-medium text-gray-900">{r.tests?.title || '-'}</span> },
        { key: 'batch', label: 'Batch', render: (r) => <span className="text-gray-600">{r.tests?.batches?.name || '-'}</span> },
        { key: 'date', label: 'Date', render: (r) => <span className="text-gray-500">{r.tests?.date ? new Date(r.tests.date).toLocaleDateString() : '-'}</span> },
        { key: 'marks', label: 'Marks', render: (r) => <span className="font-bold text-gray-900">{r.marks}</span> },
        { key: 'percentage', label: '%', render: (r) => r.tests?.total_marks ? <span className="font-semibold text-blue-600">{((r.marks / r.tests.total_marks) * 100).toFixed(1)}%</span> : '-' },
        {
          key: 'rank',
          label: 'Rank',
          render: (r) => r.rank ? (
            <span className={`px-2 py-1 rounded-md text-xs font-bold ${
              r.rank === 1 ? 'bg-amber-100 text-amber-700' : 
              r.rank === 2 ? 'bg-gray-200 text-gray-700' :
              r.rank === 3 ? 'bg-orange-100 text-orange-700' :
              'bg-blue-50 text-blue-600'
            }`}>
              #{r.rank}
            </span>
          ) : '-',
        },
        { key: 'actions', label: '', render: renderActions }
      ]
    : [
        { 
          key: 'student', 
          label: 'Student', 
          render: (r) => {
            const studentName = r.students?.full_name || r.students?.name || 'Unknown';
            return <span className="font-semibold text-gray-900">{studentName}</span>
          } 
        },
        { key: 'marks', label: 'Marks', render: (r) => <span className="font-bold text-gray-900">{r.marks}</span> },
        { key: 'percentage', label: '%', render: (r) => r.tests?.total_marks ? <span className="font-semibold text-blue-600">{((r.marks / r.tests.total_marks) * 100).toFixed(1)}%</span> : '-' },
        {
          key: 'rank',
          label: 'Rank',
          render: (r) => r.rank ? (
            <span className={`px-2 py-1 rounded-md text-xs font-bold ${
              r.rank === 1 ? 'bg-amber-100 text-amber-700' : 
              r.rank === 2 ? 'bg-gray-200 text-gray-700' :
              r.rank === 3 ? 'bg-orange-100 text-orange-700' :
              'bg-blue-50 text-blue-600'
            }`}>
              #{r.rank}
            </span>
          ) : '-',
        },
        {
          key: 'violations',
          label: 'Violations',
          render: (r) => {
            const count = r.violation_count || 0
            if (count === 0) return (
              <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-green-100 text-green-700">Clean</span>
            )
            return (
              <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-1 w-fit">
                <AlertTriangle className="w-3 h-3" /> {count}
              </span>
            )
          }
        },
        { key: 'actions', label: '', render: renderActions }
      ];

  const batchOptions = batches.map((b) => ({ value: b.id, label: b.name }))
  const testOptions = tests.map((t) => ({ value: t.id, label: `${t.title} (${new Date(t.date).toLocaleDateString()})` }))

  return (
    <div className={hideHeader ? "space-y-6" : "space-y-8"}>
      {!hideHeader && (
        <div className="flex items-center gap-4 bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Results & Insights</h1>
            <p className="text-gray-500 text-sm mt-1">
              {role === 'student' ? 'Your test scores and rankings' : 'View and manage test results across your batches'}
            </p>
          </div>
        </div>
      )}

      {role !== 'student' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm">
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
              disabled={testOptions.length === 0}
            />
          </div>
        </div>
      )}

      {(isInitialLoading || loading) ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-[16px] overflow-hidden shadow-sm">
          <DataTable columns={columns} data={results} emptyMessage={role === 'student' ? 'No results found for your account' : 'Select a batch and test to view results'} />
        </div>
      )}
    </div>
  )
}

export default ResultsPage

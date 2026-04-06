import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import DataTable from '../../components/ui/DataTable'
import { Select } from '../../components/ui/FormField'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Sparkles, Download, X, AlertTriangle } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'

const ResultsPage = () => {
  const { user, role } = useAuth()
  const [results, setResults] = useState([])
  const [batches, setBatches] = useState([])
  const [tests, setTests] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedTest, setSelectedTest] = useState('')
  const [loading, setLoading] = useState(true)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)

  const handleGeneratePDF = (r) => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(22)
      doc.setTextColor('#8b5cf6')
      doc.text('IntelliX Test Report', 105, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.setTextColor('#000000')
      const studentName = role === 'student' ? user?.user_metadata?.full_name : r.students?.name
      doc.text(`Student: ${studentName || 'Student'}`, 14, 40)
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

      if (r.ai_feedback) {
         doc.setFontSize(16)
         doc.setTextColor('#8b5cf6')
         doc.text('AI Feedback & Insights', 14, 100)
         
         doc.setFontSize(11)
         doc.setTextColor('#333333')
         let yPos = 110
         
         if (r.ai_feedback.overall_summary) {
           doc.text(`Summary: ${r.ai_feedback.overall_summary}`, 14, yPos, { maxWidth: 180 })
           yPos += 12
         }
         if (r.ai_feedback.strengths?.length) {
           doc.setFontSize(12); doc.setTextColor('#22c55e')
           doc.text('Strengths:', 14, yPos); yPos += 6; doc.setFontSize(11); doc.setTextColor('#333')
           r.ai_feedback.strengths.forEach(s => { doc.text(`• ${s}`, 18, yPos, { maxWidth: 170 }); yPos += 6 })
           yPos += 4
         }
         if (r.ai_feedback.weak_topics?.length) {
           doc.setFontSize(12); doc.setTextColor('#ef4444')
           doc.text('Areas for Improvement:', 14, yPos); yPos += 6; doc.setFontSize(11); doc.setTextColor('#333')
           r.ai_feedback.weak_topics.forEach(s => { doc.text(`• ${s}`, 18, yPos, { maxWidth: 170 }); yPos += 6 })
           yPos += 4
         }
         if (r.ai_feedback.improvement_suggestions?.length) {
           doc.setFontSize(12); doc.setTextColor('#3b82f6')
           doc.text('Suggestions:', 14, yPos); yPos += 6; doc.setFontSize(11); doc.setTextColor('#333')
           r.ai_feedback.improvement_suggestions.forEach(s => { doc.text(`• ${s}`, 18, yPos, { maxWidth: 170 }); yPos += 6 })
         }
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
        // violation_count is auto-included with '*'
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
    if (role !== 'student' || !user?.id) return
    const fetchStudentResults = async () => {
      try {
        setLoading(true)
        const { data } = await supabase
          .from('results')
          .select('*, tests(title, total_marks, date, batches(name))')
          .eq('student_id', user.id) // Corrected to use profile_id (User UUID)
          .order('created_at', { ascending: false })
        setResults(data || [])
      } catch (err) {
        console.error('Error fetching student results:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudentResults()
  }, [role, user])

  const renderActions = (r) => (
    <div className="flex items-center justify-end gap-2">
      {r.ai_feedback && Object.keys(r.ai_feedback).length > 0 && (
        <button
          onClick={() => { setSelectedResult(r); setAiModalOpen(true); }}
          className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:scale-105 transition-all shadow-sm"
          title="View AI Insights"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={() => handleGeneratePDF(r)}
        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:scale-105 transition-all shadow-sm"
        title="Download Report (PDF)"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  )

  const columns = role === 'student'
    ? [
        { key: 'test', label: 'Test', render: (r) => r.tests?.title || '-' },
        { key: 'batch', label: 'Batch', render: (r) => r.tests?.batches?.name || '-' },
        { key: 'date', label: 'Date', render: (r) => r.tests?.date ? new Date(r.tests.date).toLocaleDateString() : '-' },
        { key: 'marks', label: 'Marks', render: (r) => <span className="font-bold text-[var(--text-primary)]">{r.marks}</span> },
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
        { key: 'actions', label: '', render: renderActions }
      ]
    : [
        { key: 'student', label: 'Student', render: (r) => <span className="font-medium text-[var(--text-primary)]">{r.students?.name || '-'}</span> },
        { key: 'marks', label: 'Marks', render: (r) => <span className="font-bold text-[var(--text-primary)]">{r.marks}</span> },
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
        {
          key: 'violations',
          label: 'Violations',
          render: (r) => {
            const count = r.violation_count || 0
            if (count === 0) return (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">Clean</span>
            )
            return (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-fit">
                <AlertTriangle className="w-3 h-3" /> {count}
              </span>
            )
          }
        },
        { key: 'actions', label: '', render: renderActions }
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

      {/* AI Feedback Modal */}
      <AnimatePresence>
        {aiModalOpen && selectedResult?.ai_feedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setAiModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-[var(--bg-app)] text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">AI Performance Insights</h2>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">{selectedResult.tests?.title}</p>
                </div>
              </div>

              <div className="space-y-6">
                {selectedResult.ai_feedback.overall_summary && (
                  <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-medium leading-relaxed">
                    "{selectedResult.ai_feedback.overall_summary}"
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedResult.ai_feedback.strengths?.length > 0 && (
                    <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/5">
                      <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span> Strengths
                      </h3>
                      <ul className="space-y-2">
                        {selectedResult.ai_feedback.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedResult.ai_feedback.weak_topics?.length > 0 && (
                    <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5">
                      <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span> Areas to Improve
                      </h3>
                      <ul className="space-y-2">
                        {selectedResult.ai_feedback.weak_topics.map((s, i) => (
                          <li key={i} className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {selectedResult.ai_feedback.improvement_suggestions?.length > 0 && (
                  <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5">
                    <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span> Action Plan
                    </h3>
                    <ul className="space-y-2">
                      {selectedResult.ai_feedback.improvement_suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ResultsPage

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import DataTable from '../../components/ui/DataTable'
import { Select } from '../../components/ui/FormField'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import { Sparkles, Download, X, AlertTriangle } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'
import { useAppQuery } from '../../hooks/useAppQuery'
import { TableSkeleton } from '../../components/ui/Skeletons'

const ResultsPage = ({ hideHeader = false }) => {
  const { user, role } = useAuth()
  const { isDark } = useTheme()
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
      const { data } = await supabase
        .from('results')
        .select('id, marks, rank, violation_count, tests(id, title, total_marks, date, batches(name))')
        .eq('student_id', user.id)
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
      
      // DATA MAPPING FIX: Prioritize full_name
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

      if (r.ai_feedback) {
         doc.setFontSize(16)
         doc.setTextColor('#000000')
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
           doc.setFontSize(12); doc.setTextColor('#4b5563')
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
        
        // DEBUG SAFETY
        if (data && data.length > 0) console.log('Results Sample:', data[0]);

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

  // Student auto-fetch is handled by useAppQuery init


  const renderActions = (r) => (
    <div className="flex items-center justify-end gap-2">
      {r.ai_feedback && Object.keys(r.ai_feedback).length > 0 && (
        <button
          onClick={() => { setSelectedResult(r); setAiModalOpen(true); }}
          className={`p-1.5 rounded-lg hover:scale-105 transition-all shadow-sm ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}`}
          title="View AI Insights"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={() => handleGeneratePDF(r)}
        className={`p-1.5 rounded-lg hover:scale-105 transition-all shadow-sm ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}`}
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
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${
              r.rank === 1 ? 'bg-white text-black' : 'bg-white/10 text-white/70 border border-white/5'
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
            return <span className="font-medium text-[var(--text-primary)]">{studentName}</span>
          } 
        },
        { key: 'marks', label: 'Marks', render: (r) => <span className="font-bold text-[var(--text-primary)]">{r.marks}</span> },
        { key: 'percentage', label: '%', render: (r) => r.tests?.total_marks ? `${((r.marks / r.tests.total_marks) * 100).toFixed(1)}%` : '-' },
        {
          key: 'rank',
          label: 'Rank',
          render: (r) => r.rank ? (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${
              r.rank === 1 ? 'bg-white text-black' : 'bg-white/10 text-white/70 border border-white/5'
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
      ];

  const batchOptions = batches.map((b) => ({ value: b.id, label: b.name }))
  const testOptions = tests.map((t) => ({ value: t.id, label: `${t.title} (${new Date(t.date).toLocaleDateString()})` }))

  return (
    <div className="space-y-8">
      {!hideHeader && (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-sm shadow-amber-500/5">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
            >
              Results & Insights
            </motion.h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
              {role === 'student' ? 'Your test scores and rankings' : 'View and manage test results across your batches'}
            </p>
          </div>
        </div>
      )}

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

      {(isInitialLoading || loading) ? (
        <TableSkeleton rows={8} cols={6} />
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
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-xl shadow-black/20">
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
                  <div className="p-5 rounded-2xl border border-white/20 bg-white/5">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white"></span> Action Plan
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

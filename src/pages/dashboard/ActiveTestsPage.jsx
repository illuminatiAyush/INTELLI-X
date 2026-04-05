import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle2, Lock, Play, Trophy, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const ActiveTestsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tests, setTests] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active') // active, upcoming, completed

  const fetchTests = async () => {
    if (!user) return
    try {
      // Get student record
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('profile_id', user.id)
      const studentId = students?.[0]?.id
      if (!studentId) { setLoading(false); return }

      // Get student's batch IDs using profile_id
      const { data: batchStudents } = await supabase
        .from('batch_students')
        .select('batch_id')
        .eq('student_id', user.id)
      const batchIds = (batchStudents || []).map(bs => bs.batch_id)

      if (batchIds.length === 0) { setLoading(false); return }

      // Get all tests with questions for these batches
      const { data: testData } = await supabase
        .from('tests')
        .select('*, batches(name), questions(id)')
        .in('batch_id', batchIds)
        .order('created_at', { ascending: false })

      // Only show tests that have questions (AI-generated tests)
      const testsWithQuestions = (testData || []).filter(t => t.questions && t.questions.length > 0)
      setTests(testsWithQuestions)

      // Get student's results
      const { data: resultData } = await supabase
        .from('results')
        .select('*')
        .eq('student_id', user.id)

      const resultMap = {}
      ;(resultData || []).forEach(r => { resultMap[r.test_id] = r })
      setResults(resultMap)
    } catch (err) {
      console.error('Failed to load tests:', err)
      toast.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchTests()
  }, [user])

  // Realtime updates for tests
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('student-tests-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tests' }, () => {
        // Refetch whenever there's an update (e.g. test added or ended)
        fetchTests()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const now = new Date()

  const categorizeTest = (test) => {
    const hasResult = !!results[test.id]
    if (hasResult) return 'completed'

    if (test.end_time && new Date(test.end_time) < now) return 'completed' // expired
    if (test.start_time && new Date(test.start_time) > now) return 'upcoming'
    return 'active'
  }

  const filteredTests = tests.filter(t => categorizeTest(t) === tab)

  const getTestStatus = (test) => {
    const category = categorizeTest(test)
    const hasResult = !!results[test.id]

    if (hasResult) {
      const r = results[test.id]
      const total = test.questions?.length || test.total_marks
      const pct = total ? ((r.marks / total) * 100).toFixed(0) : 0
      return {
        label: `Score: ${r.marks}/${total} (${pct}%)`,
        color: pct >= 70 ? 'text-green-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400',
        bgColor: pct >= 70 ? 'bg-green-500/10 border-green-500/20' : pct >= 40 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20',
        icon: CheckCircle2,
        canAttempt: false,
      }
    }

    if (category === 'upcoming') {
      return {
        label: `Starts ${new Date(test.start_time).toLocaleString()}`,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        icon: Lock,
        canAttempt: false,
      }
    }

    if (category === 'completed') {
      return {
        label: 'Test Closed',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/20',
        icon: Lock, 
        canAttempt: false,
      }
    }

    return {
      label: test.duration_minutes ? `${test.duration_minutes} min` : 'Open',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      icon: Play,
      canAttempt: true,
    }
  }

  const handleStartTest = (test) => {
    const status = getTestStatus(test)
    if (!status.canAttempt) {
      toast.error('This test is not available for attempt')
      return
    }
    navigate(`/dashboard/test-attempt/${test.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  const tabs = [
    { key: 'active', label: 'Active', count: tests.filter(t => categorizeTest(t) === 'active').length },
    { key: 'upcoming', label: 'Upcoming', count: tests.filter(t => categorizeTest(t) === 'upcoming').length },
    { key: 'completed', label: 'Completed', count: tests.filter(t => categorizeTest(t) === 'completed').length },
  ]

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3"
        >
          <Sparkles className="w-7 h-7 text-purple-400" />
          AI Tests
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
          Attempt AI-generated tests from your classes
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-[var(--color-purple)] text-white shadow-lg shadow-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                tab === t.key ? 'bg-white/20' : 'bg-[var(--bg-app)]'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Test List */}
      {filteredTests.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-surface)]/50 rounded-3xl border border-dashed border-[var(--border-subtle)]">
          <FileText className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-20" />
          <p className="text-[var(--text-secondary)] font-medium text-lg">
            No {tab} tests
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test, i) => {
            const status = getTestStatus(test)
            const StatusIcon = status.icon
            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 hover:border-[var(--border-strong)] transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[var(--text-primary)] truncate group-hover:text-purple-400 transition-colors">
                      {test.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                      {test.batches?.name || 'Unknown Batch'} • {test.questions?.length || 0} questions
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-medium ${status.bgColor} ${status.color}`}>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{status.label}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                    {test.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {test.duration_minutes} min
                      </span>
                    )}
                    <span>
                      {new Date(test.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {status.canAttempt ? (
                    <button
                      onClick={() => handleStartTest(test)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Test
                    </button>
                  ) : results[test.id] ? (
                    <button
                      onClick={() => navigate('/dashboard/results')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 hover:bg-green-500/20 active:scale-95 transition-all"
                    >
                      <Trophy className="w-3.5 h-3.5" /> View Result
                    </button>
                  ) : null}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ActiveTestsPage

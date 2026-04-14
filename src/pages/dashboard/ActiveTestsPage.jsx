import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle2, Lock, Play, Trophy, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { CardSkeleton } from '../../components/ui/Skeletons'

const ActiveTestsPage = ({ hideHeader = false }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('active')

  const { data: pageData, loading: pageLoading, refetch: refetchPage } = useAppQuery(`active-tests-${user?.id}`, async () => {
    if (!user) return { tests: [], results: {} }
    
    // Get student's batch IDs using profile_id
    const { data: batchStudents } = await supabase
      .from('batch_students')
      .select('batch_id')
      .eq('student_id', user.id)
    const batchIds = (batchStudents || []).map(bs => bs.batch_id)

    if (batchIds.length === 0) return { tests: [], results: {} }

    // Get all tests with questions for these batches
    const { data: testData } = await supabase
      .from('tests')
      .select('id, title, start_time, end_time, duration_minutes, created_at, total_marks, batches(name), questions(id)')
      .in('batch_id', batchIds)
      .order('created_at', { ascending: false })

    // Only show tests that have questions (AI-generated tests)
    const testsWithQuestions = (testData || []).filter(t => t.questions && t.questions.length > 0)

    // Get student's results
    const { data: resultData } = await supabase
      .from('results')
      .select('id, test_id, marks, rank, violation_count')
      .eq('student_id', user.id)

    const resultMap = {}
    ;(resultData || []).forEach(r => { resultMap[r.test_id] = r })

    return { tests: testsWithQuestions, results: resultMap }
  }, { enabled: !!user })

  const tests = pageData?.tests || []
  const results = pageData?.results || {}
  const loading = pageLoading && !pageData

  const fetchTests = () => refetchPage()

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
      const total = (test.questions && test.questions.length > 0) ? test.questions.length : (test.total_marks || 100)
      const pct = total > 0 ? ((r.marks / total) * 100).toFixed(0) : 0
      return {
        label: `Score: ${r.marks || 0}/${total} (${pct}%)`,
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
      <div className="space-y-8">
        <div className="h-24 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] animate-pulse" />
        <div className="space-y-4">
           <div className="h-8 w-48 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton /><CardSkeleton />
           </div>
        </div>
      </div>
    )
  }

  const activeTests = tests.filter(t => categorizeTest(t) === 'active')
  const upcomingTests = tests.filter(t => categorizeTest(t) === 'upcoming')
  const completedTests = tests.filter(t => categorizeTest(t) === 'completed')

  const TestCard = ({ test, index }) => {
    const status = getTestStatus(test)
    const StatusIcon = status.icon
    const isUpcoming = categorizeTest(test) === 'upcoming'

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`rounded-2xl border bg-[var(--bg-surface)] p-5 transition-all group ${ isUpcoming ? 'border-[var(--border-subtle)] opacity-75' : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[var(--text-primary)] truncate transition-colors">
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-xl active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5" /> Start Test
            </button>
          ) : isUpcoming ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-bold">
              <Lock className="w-3.5 h-3.5" /> Starts at {new Date(test.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          ) : results[test.id] ? (
            <button
              onClick={() => navigate('/dashboard/results')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 hover:bg-green-500/20 active:scale-95 transition-all"
            >
              <Trophy className="w-3.5 h-3.5" /> View Result
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-xs font-bold">
              Test Ended
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {!hideHeader && (
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3"
          >
            <Sparkles className="w-7 h-7 text-white" />
            AI Tests
          </motion.h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
            Attempt AI-generated tests from your classes
          </p>
        </div>
      )}

      {/* 1. ACTIVE SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
            <Play className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Active Exams</h2>
          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">{activeTests.length}</span>
        </div>
        {activeTests.length === 0 ? (
          <div className="py-10 text-center bg-[var(--bg-surface)]/30 rounded-3xl border border-dashed border-[var(--border-subtle)]">
            <p className="text-[var(--text-secondary)] text-sm">No live exams at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTests.map((t, i) => <TestCard key={t.id} test={t} index={i} />)}
          </div>
        )}
      </section>

      {/* 2. UPCOMING SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-5 pt-4">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Scheduled Tests</h2>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">{upcomingTests.length}</span>
        </div>
        {upcomingTests.length === 0 ? (
          <div className="py-10 text-center bg-[var(--bg-surface)]/30 rounded-3xl border border-dashed border-[var(--border-subtle)]">
            <p className="text-[var(--text-secondary)] text-sm">No tests scheduled for later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingTests.map((t, i) => <TestCard key={t.id} test={t} index={i} />)}
          </div>
        )}
      </section>

      {/* 3. COMPLETED SECTION */}
      <section>
        <div className="flex items-center gap-2 mb-5 pt-4">
          <div className="p-2 rounded-lg bg-white/10 text-white">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Exam History</h2>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/20">{completedTests.length}</span>
        </div>
        {completedTests.length === 0 ? (
          <div className="py-10 text-center bg-[var(--bg-surface)]/30 rounded-3xl border border-dashed border-[var(--border-subtle)]">
            <p className="text-[var(--text-secondary)] text-sm">You haven't participated in any tests yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTests.map((t, i) => <TestCard key={t.id} test={t} index={i} />)}
          </div>
        )}
      </section>
    </div >
  )
}

export default ActiveTestsPage

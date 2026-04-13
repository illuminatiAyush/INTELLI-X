import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Send, Shield, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { generateAIFeedback } from '../../services/aiTestService'
import { TestAttemptSkeleton } from '../../components/ui/Skeletons'

const TestAttemptPage = () => {
  // 1. HOOKS
  const { testId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [violationCount, setViolationCount] = useState(0)
  const [attemptId, setAttemptId] = useState(null)

  const timerRef = useRef(null)
  const pollRef = useRef(null)
  const questionsRef = useRef([])
  const answersRef = useRef({})
  const testRef = useRef(null)
  const submittingRef = useRef(false)
  const submittedRef = useRef(false)
  const violationRef = useRef(0)
  const attemptIdRef = useRef(null)

  // Sync refs for stable access in timer/realtime callbacks
  useEffect(() => {
    questionsRef.current = questions
    answersRef.current = answers
    testRef.current = test
    submittingRef.current = submitting
    submittedRef.current = submitted
    violationRef.current = violationCount
    attemptIdRef.current = attemptId
  }, [questions, answers, test, submitting, submitted, violationCount, attemptId])

  // 2. HELPER FUNCTIONS
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--'
    if (seconds <= 0) return '00:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (timeLeft === null) return 'text-[var(--text-primary)]'
    if (timeLeft <= 60) return 'text-red-400 animate-pulse'
    if (timeLeft <= 300) return 'text-amber-400'
    return 'text-green-400'
  }

  // 3. SAVE ANSWERS TO DB (Persistent across refresh)
  const persistAnswers = async (newAnswers) => {
    if (!attemptIdRef.current) return
    try {
      await supabase
        .from('student_attempts')
        .update({ answers: newAnswers })
        .eq('id', attemptIdRef.current)
    } catch (err) {
      console.warn('Answer save failed (non-critical):', err)
    }
  }

  // 4. EVENT HANDLERS
  async function handleSubmit(isAutoSubmit = false, reason = '') {
    if (submittingRef.current || submittedRef.current) return
    const qList = questionsRef.current
    const ansList = answersRef.current
    const currentT = testRef.current
    if (!qList.length) return

    submittingRef.current = true
    setSubmitting(true)

    try {
      if (timerRef.current) clearInterval(timerRef.current)
      if (pollRef.current) clearInterval(pollRef.current)

      // 1. DATA VALIDATION
      if (!attemptIdRef.current) {
        // Emergency fetch attempt id if missing from state
        const { data: syncAttempt } = await supabase
          .from('student_attempts')
          .select('id, status')
          .eq('student_id', user.id)
          .eq('test_id', testId)
          .maybeSingle()
        
        if (syncAttempt) {
            if (syncAttempt.status === 'submitted' || syncAttempt.status === 'forced_end') {
                toast('Tests already submitted.')
                navigate('/dashboard')
                return
            }
            attemptIdRef.current = syncAttempt.id
        } else {
            throw new Error('Attempt Session Missing. Please refresh and try again.')
        }
      }

      const currentAttemptId = attemptIdRef.current

      // Calculate score
      let score = 0
      if (qList && qList.length > 0) {
        qList.forEach(q => {
          if (q && ansList[q.id] === q.answer) score++
        })
      }

      // 2. UPDATE ATTEMPT STATUS
      const status = reason === 'teacher_stop' ? 'forced_end' : 
                     reason === 'violation' ? 'submitted' :
                     isAutoSubmit ? 'submitted' : 'submitted'
      
      await supabase
        .from('student_attempts')
        .update({ 
          status,
          answers: ansList 
        })
        .eq('id', currentAttemptId)

      // 3. INSERT RESULT WITH RETRY
      let resultData = null
      let resultErr = null
      
      const insertResult = async () => {
        return await supabase
          .from('results')
          .insert({
            student_id: user.id,
            test_id: testId,
            marks: score,
            answers: ansList,
            submitted_at: new Date().toISOString(),
            institute_id: currentT?.institute_id,
            violation_count: violationRef.current,
          })
          .select()
          .single()
      }

      const res = await insertResult()
      resultData = res.data
      resultErr = res.error

      if (resultErr) {
        if (resultErr.code === '23505') {
          // Already exists, just fetch it
          const { data: existing } = await supabase.from('results').select('*').eq('student_id', user.id).eq('test_id', testId).single()
          setResult(existing)
        } else {
          // Retry once
          console.warn('Submission failed once, retrying...', resultErr)
          const retryRes = await insertResult()
          if (retryRes.error) throw retryRes.error
          resultData = retryRes.data
        }
      }

      if (resultData) {
        setResult(resultData)
        // Background: Generate AI Feedback
        generateAIFeedback(resultData, currentT, qList)
          .then(async (feedback) => {
            if (feedback) {
              await supabase.from('results').update({ ai_feedback: feedback }).eq('id', resultData.id)
            }
          })
          .catch(err => console.error("AI feedback gen failed:", err))
      }

      submittedRef.current = true
      setSubmitted(true)

      if (reason === 'teacher_stop') {
        toast('The teacher has ended this test.', { icon: '🛑' })
      } else if (reason === 'violation') {
        toast.error('❌ Auto-submitted due to tab switching violations.', { duration: 6000 })
      } else if (isAutoSubmit) {
        toast('⏰ Time\'s up! Test auto-submitted.', { icon: '⏱️' })
      } else {
        toast.success(`Test submitted! Score: ${score}/${qList.length}`)
      }
    } catch (err) {
      console.error('Submit error:', err)
      toast.error('Submission failed. Please check your connection and try again.', { duration: 5000 })
      setSubmitting(false)
      submittingRef.current = false
    }
  }

  function handleOptionSelect(questionId, option) {
    setAnswers(prev => {
      const updated = { ...prev, [questionId]: option }
      // Persist to DB (fire-and-forget)
      persistAnswers(updated)
      return updated
    })
  }

  function goNext() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  function goPrev() {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  // 5. DATA LOADING & EFFECTS
  useEffect(() => {
    if (!user || !testId) return

    const loadData = async () => {
      try {
        setLoading(true)

        // 1. Check if already submitted
        const { data: existingResult } = await supabase
          .from('results')
          .select('*')
          .eq('student_id', user.id)
          .eq('test_id', testId)
          .maybeSingle()

        if (existingResult) {
          setResult(existingResult)
          setSubmitted(true)
          setLoading(false)
          return
        }

        // 2. Load test details
        const { data: testData, error: tErr } = await supabase
          .from('tests')
          .select('*')
          .eq('id', testId)
          .single()

        if (tErr || !testData) throw new Error('Test not found')
        setTest(testData)

        // 3. Check if test is locked (ended by teacher or past end_time)
        if (testData.end_time && new Date(testData.end_time) <= new Date()) {
          toast.error('This test has already ended.')
          navigate('/dashboard')
          return
        }

        // 4. Check if test hasn't started yet
        if (testData.start_time && new Date(testData.start_time) > new Date()) {
          toast.error('This test has not started yet.')
          navigate('/dashboard')
          return
        }

        // 5. Timer Persistence: Check or Create attempt record
        const { data: attemptData } = await supabase
          .from('student_attempts')
          .select('*')
          .eq('student_id', user.id)
          .eq('test_id', testId)
          .maybeSingle()

        let currentAttempt
        const durationSecs = (testData.duration_minutes || 30) * 60

        if (!attemptData) {
          // First time starting — create attempt with server-persisted ends_at
          const startedAt = new Date()
          const endsAt = new Date(startedAt.getTime() + durationSecs * 1000)

          const { data: newAttempt, error: iErr } = await supabase
            .from('student_attempts')
            .insert({
              student_id: user.id,
              test_id: testId,
              institute_id: testData.institute_id,
              ends_at: endsAt.toISOString(),
              status: 'in_progress',
              answers: {},
              violation_count: 0,
            })
            .select()
            .single()

          if (iErr) {
            console.error('student_attempts insert failed:', iErr)
            // Retry once immediately for robustness
            const { data: retryAttempt, error: rErr } = await supabase
              .from('student_attempts')
              .insert({
                student_id: user.id,
                test_id: testId,
                institute_id: testData.institute_id,
                ends_at: endsAt.toISOString(),
                status: 'in_progress',
              })
              .select().single()
            
            if (rErr) throw new Error('Failed to initialize test session. Please try again.')
            currentAttempt = retryAttempt
            setAttemptId(retryAttempt.id)
          } else {
            currentAttempt = newAttempt
            setAttemptId(newAttempt.id)
          }
        } else {
          // Resuming — check if already submitted
          if (attemptData.status === 'submitted' || attemptData.status === 'forced_end') {
            toast('This test was already submitted.')
            navigate('/dashboard')
            return
          }

          currentAttempt = attemptData
          setAttemptId(attemptData.id)

          // Restore saved answers
          if (attemptData.answers && Object.keys(attemptData.answers).length > 0) {
            setAnswers(attemptData.answers)
          }

          // If ends_at is missing (old record), compute it
          if (!attemptData.ends_at) {
            const endsAt = new Date(new Date(attemptData.started_at).getTime() + durationSecs * 1000)
            currentAttempt.ends_at = endsAt.toISOString()
            // Patch the DB
            if (attemptData.id) {
              await supabase.from('student_attempts').update({ ends_at: endsAt.toISOString() }).eq('id', attemptData.id)
            }
          }
        }

        // Set violation count from DB
        setViolationCount(currentAttempt.violation_count || 0)

        // 6. Load questions
        const { data: qData, error: qErr } = await supabase
          .from('questions')
          .select('*')
          .eq('test_id', testId)
          .order('sort_order', { ascending: true })

        if (qErr || !qData || qData.length === 0) throw new Error('Questions not found')
        setQuestions(qData)

        // 7. Calculate remaining time from SERVER-BASED ends_at
        const endsAtTime = new Date(currentAttempt.ends_at)
        const now = new Date()
        const remaining = Math.max(0, Math.floor((endsAtTime - now) / 1000))

        setTimeLeft(remaining)
        if (remaining <= 0) {
          handleSubmit(true)
        }

      } catch (err) {
        console.error('Loader error:', err)
        toast.error(err.message)
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [testId, user])

  // Timer Effect — counts down locally but is initialized from server
  useEffect(() => {
    if (timeLeft === null || submitted || loading) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [timeLeft === null, submitted, loading])

  // Realtime Listener — teacher stop
  useEffect(() => {
    if (!testId || submitted || loading) return

    const channel = supabase
      .channel(`test-attempt-${testId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tests', filter: `id=eq.${testId}` }, payload => {
        const updated = payload.new
        // If teacher forced an early end
        if (updated?.end_time && new Date(updated.end_time) <= new Date()) {
          handleSubmit(true, 'teacher_stop')
        }
      })
      .subscribe()

    // Fallback polling every 30 seconds in case Realtime misses an event
    pollRef.current = setInterval(async () => {
      if (submittedRef.current) return
      try {
        const { data: freshTest } = await supabase
          .from('tests')
          .select('end_time')
          .eq('id', testId)
          .single()
        if (freshTest?.end_time && new Date(freshTest.end_time) <= new Date()) {
          handleSubmit(true, 'teacher_stop')
        }
      } catch {}
    }, 30000)

    return () => {
      supabase.removeChannel(channel)
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [testId, submitted, loading])

  // Anti-Cheat: Server-Persisted Tab Switch Detection
  useEffect(() => {
    if (submitted || loading || !testId) return

    const handleVisibilityChange = async () => {
      if (document.hidden && !submittedRef.current) {
        const newCount = violationRef.current + 1
        setViolationCount(newCount)

        // Persist to DB
        if (attemptIdRef.current) {
          try {
            await supabase
              .from('student_attempts')
              .update({ violation_count: newCount })
              .eq('id', attemptIdRef.current)
          } catch (err) {
            console.warn('Violation save failed:', err)
          }
        }

        if (newCount === 1) {
          toast.error('⚠️ WARNING: Do not switch tabs! Your next tab switch will auto-submit the test.', {
            duration: 6000,
            icon: '🚨',
            style: { border: '1px solid #ef4444', backgroundColor: '#450a0a', color: '#f87171' }
          })
        } else if (newCount >= 2) {
          toast.error('❌ Tab switch detected again. Auto-submitting test.', {
            duration: 6000,
            icon: '🔒',
            style: { border: '1px solid #ef4444', backgroundColor: '#450a0a', color: '#f87171' }
          })
          handleSubmit(true, 'violation')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [submitted, loading, testId, user])

  // 6. RENDER LOGIC
  if (loading) return <TestAttemptSkeleton />

  if (submitted) {
    const score = result?.marks || 0
    const total = questions.length || test?.total_marks || 0
    const pct = total ? Math.round((score / total) * 100) : 0

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto py-12"
      >
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-8 text-center shadow-xl">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${ pct >= 70 ? 'bg-green-500/10' : pct >= 40 ? 'bg-amber-500/10' : 'bg-red-500/10'
          }`}>
            <CheckCircle2 className={`w-10 h-10 ${ pct >= 70 ? 'text-green-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400'
            }`} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Submission Successful!</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8">{test?.title}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{score}/{total}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-1 font-bold">Marks Obtained</p>
            </div>
            <div className={`p-4 rounded-2xl border ${ pct >= 70 ? 'border-green-500/20' : pct >= 40 ? 'border-amber-500/20' : 'border-red-500/20'
            }`}>
              <p className={`text-2xl font-bold ${ pct >= 70 ? 'text-green-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400'
              }`}>{pct}%</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-1 font-bold">Final Score</p>
            </div>
          </div>

          {/* Violations Badge */}
          {(result?.violation_count > 0 || violationCount > 0) && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs font-bold text-red-400">
                ⚠️ {result?.violation_count || violationCount} Tab Switch Violation{(result?.violation_count || violationCount) > 1 ? 's' : ''} Detected
              </p>
            </div>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 rounded-xl bg-white text-black font-bold shadow-xl active:scale-[0.98] transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    )
  }

  if (!test || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] bg-[var(--bg-surface)] rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Test Unavailable</h3>
        <p className="text-sm text-[var(--text-secondary)] mt-2">No question data found for this exam.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-6 text-white hover:underline text-sm font-medium">Return Dashboard</button>
      </div>
    )
  }

  const q = questions[currentQuestion]
  const answeredCount = Object.keys(answers).length

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 mb-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            <Clock className={`w-6 h-6 ${getTimerColor()}`} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] leading-none">{test?.title}</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
              Progress: {answeredCount} / {questions.length} Questions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Violations indicator */}
          {violationCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {violationCount} Violation{violationCount > 1 ? 's' : ''}
            </div>
          )}
          <div className={`px-5 py-3 rounded-xl border font-mono text-xl font-black ${ timeLeft <= 60 ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-primary)]'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="px-6 py-3 bg-white text-black font-bold rounded-xl shadow-xl flex items-center gap-2 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Finish
          </button>
        </div>
      </div>

      {/* Navigation Matrix */}
      <div className="flex flex-wrap gap-2 mb-8 px-2">
        {questions.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setCurrentQuestion(idx)}
            className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${ idx === currentQuestion ? 'bg-white text-black shadow-xl ring-2 ring-white/50' 
                : answers[item.id] 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 shadow-sm"
      >
        <div className="flex items-start gap-5 mb-10">
          <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/70 font-black text-xl border border-white/10">
            {currentQuestion + 1}
          </span>
          <h2 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] leading-relaxed pt-1">
            {q?.question}
          </h2>
        </div>

        <div className="grid gap-4 mb-10">
          {q?.options?.map((opt, oIdx) => {
            const letter = ['A', 'B', 'C', 'D'][oIdx]
            const isSelected = answers[q.id] === letter
            return (
              <button
                key={oIdx}
                onClick={() => handleOptionSelect(q.id, letter)}
                className={`flex items-center gap-5 p-5 rounded-2xl border text-left transition-all ${ isSelected ? 'bg-white/10 border-white/30 shadow-white/[0.05]' 
                    : 'bg-[var(--bg-app)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border transition-all ${ isSelected ? 'bg-white text-black border-white' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                }`}>
                  {letter}
                </div>
                <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                  {opt}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-[var(--border-subtle)]">
          <button
            onClick={goPrev}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>

          <div className="text-xs font-bold text-[var(--text-secondary)] tracking-widest uppercase opacity-40">
            Question {currentQuestion + 1} of {questions.length}
          </div>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-xl shadow-xl hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-xl shadow-xl hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" /> Submit Exam
            </button>
          )}
        </div>
      </motion.div>

      {/* Safety Banner */}
      <div className="mt-6 flex items-center justify-center gap-3 py-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
        <Shield className="w-4 h-4 text-amber-500/60" />
        <p className="text-[10px] md:text-xs font-bold text-amber-500/60 uppercase tracking-widest">
          Intelligent Proctoring Active • Secure Session • Do Not Refresh
        </p>
      </div>
    </div>
  )
}

export default TestAttemptPage

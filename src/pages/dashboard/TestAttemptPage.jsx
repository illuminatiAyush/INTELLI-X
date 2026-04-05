import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Send, Shield, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { generateAIFeedback } from '../../services/aiTestService'

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
  const [studentId, setStudentId] = useState(null)

  const [attempt, setAttempt] = useState(null)

  const timerRef = useRef(null)
  const questionsRef = useRef([])
  const answersRef = useRef({})
  const testRef = useRef(null)
  const submittingRef = useRef(false)
  const submittedRef = useRef(false)

  // Sync refs for stable access in timer/realtime
  useEffect(() => {
    questionsRef.current = questions
    answersRef.current = answers
    testRef.current = test
    submittingRef.current = submitting
    submittedRef.current = submitted
  }, [questions, answers, test, submitting, submitted])

  // 2. HELPER FUNCTIONS
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--'
    if (seconds <= 0) return '00:00'
    const m = Math.floor(seconds / (60))
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (timeLeft === null) return 'text-[var(--text-primary)]'
    if (timeLeft <= 60) return 'text-red-400 animate-pulse'
    if (timeLeft <= 300) return 'text-amber-400'
    return 'text-green-400'
  }

  // 3. EVENT HANDLERS (Declared before useEffect/usage)
  async function handleSubmit(isAutoSubmit = false) {
    if (submittingRef.current || submittedRef.current) return
    
    const qList = questionsRef.current
    const ansList = answersRef.current
    const currentT = testRef.current
    if (!qList.length) return

    submittingRef.current = true
    setSubmitting(true)

    try {
      if (timerRef.current) clearInterval(timerRef.current)

      // Calculate score
      let score = 0
      qList.forEach(q => {
        if (ansList[q.id] === q.answer) score++
      })

      // Save result using profile_id as student_id standard
      const { data: resultData, error: resultErr } = await supabase
        .from('results')
        .insert({
          student_id: user.id, 
          test_id: testId,
          marks: score,
          answers: ansList,
          submitted_at: new Date().toISOString(),
          institute_id: currentT?.institute_id,
        })
        .select()
        .single()

      if (resultErr) {
        if (resultErr.code === '23505') {
          // Already exists, just fetch it
          const { data: existing } = await supabase.from('results').select('*').eq('student_id', user.id).eq('test_id', testId).single()
          setResult(existing)
        } else {
          throw resultErr
        }
      } else {
        setResult(resultData)
        // Background task: Generate AI Feedback for this result
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

      if (isAutoSubmit) {
        toast('⏰ Time\'s up! Test auto-submitted.', { icon: '⏱️' })
      } else {
        toast.success(`Test submitted! Score: ${score}/${qList.length}`)
      }
    } catch (err) {
      console.error('Submit error:', err)
      toast.error('Failed to submit test. Please try again.')
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  function handleOptionSelect(questionId, option) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }))
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

  // 4. DATA LOADING & EFFECTS
  useEffect(() => {
    if (!user || !testId) return

    const loadData = async () => {
      try {
        setLoading(true)
        
        // 1. Check if already attempted (results)
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

        // 3. Timer Persistence: Check or Create attempt record
        const { data: attemptData, error: aErr } = await supabase
          .from('student_attempts')
          .select('*')
          .eq('student_id', user.id)
          .eq('test_id', testId)
          .maybeSingle()

        let currentStartTime;
        if (!attemptData) {
          // First time starting
          const { data: newAttempt, error: iErr } = await supabase
            .from('student_attempts')
            .insert({
              student_id: user.id,
              test_id: testId,
              institute_id: testData.institute_id
            })
            .select()
            .single()
          
          if (iErr) {
             // Fallback to now if table doesn't exist
             currentStartTime = new Date()
             console.warn('student_attempts table might be missing. Using local start time.')
          } else {
             currentStartTime = new Date(newAttempt.started_at)
          }
        } else {
          currentStartTime = new Date(attemptData.started_at)
        }

        // 4. Load questions
        const { data: qData, error: qErr } = await supabase
          .from('questions')
          .select('*')
          .eq('test_id', testId)
          .order('sort_order', { ascending: true })

        if (qErr || !qData || qData.length === 0) throw new Error('Questions not found')
        setQuestions(qData)

        // 5. Calculate remaining time
        const durationSecs = (testData.duration_minutes || 30) * 60
        const now = new Date()
        const elapsedSecs = Math.floor((now - currentStartTime) / 1000)
        const remaining = Math.max(0, durationSecs - elapsedSecs)
        
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

  // Timer Effect
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

  // Realtime Listeners
  useEffect(() => {
    if (!testId || submitted || loading) return

    const channel = supabase
      .channel(`test-attempt-${testId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tests', filter: `id=eq.${testId}` }, payload => {
        const updated = payload.new
        // If teacher forced an early end
        if (updated?.end_time && new Date(updated.end_time) <= new Date()) {
          toast('The teacher has ended this test.', { icon: '🛑' })
          handleSubmit(true)
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [testId, submitted, loading])

  // Anti-Cheat: Tab Switch Detection
  useEffect(() => {
    if (submitted || loading || !testId) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const storageKey = `cheat_count_${user.id}_${testId}`
        const count = parseInt(localStorage.getItem(storageKey) || '0')
        
        if (count === 0) {
          toast.error('⚠️ WARNING: Do not switch tabs! Your next tab switch will auto-submit the test.', {
            duration: 6000,
            icon: '🚨',
            style: { border: '1px solid #ef4444', backgroundColor: '#450a0a', color: '#f87171' }
          })
          localStorage.setItem(storageKey, '1')
        } else {
          toast.error('❌ Tab switch detected again. Auto-submitting test.', {
            duration: 6000,
            icon: '🔒',
            style: { border: '1px solid #ef4444', backgroundColor: '#450a0a', color: '#f87171' }
          })
          handleSubmit(true) // Auto submit on second violation
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [submitted, loading, testId, user])

  // 5. RENDER LOGIC
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-sm text-[var(--text-secondary)] animate-pulse">Initializing Exam Environment...</p>
      </div>
    )
  }

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
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
            pct >= 70 ? 'bg-green-500/10' : pct >= 40 ? 'bg-amber-500/10' : 'bg-red-500/10'
          }`}>
            <CheckCircle2 className={`w-10 h-10 ${
              pct >= 70 ? 'text-green-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400'
            }`} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Submission Successful!</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8">{test?.title}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{score}/{total}</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-1 font-bold">Marks Obtained</p>
            </div>
            <div className={`p-4 rounded-2xl border ${
              pct >= 70 ? 'border-green-500/20' : pct >= 40 ? 'border-amber-500/20' : 'border-red-500/20'
            }`}>
              <p className={`text-2xl font-bold ${
                pct >= 70 ? 'text-green-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400'
              }`}>{pct}%</p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mt-1 font-bold">Final Score</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 rounded-xl bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
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
        <button onClick={() => navigate('/dashboard')} className="mt-6 text-purple-400 hover:underline text-sm font-medium">Return Dashboard</button>
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
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
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
          <div className={`px-5 py-3 rounded-xl border font-mono text-xl font-black ${
            timeLeft <= 60 ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-primary)]'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
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
            className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
              idx === currentQuestion 
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
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
          <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 font-black text-xl border border-purple-500/20">
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
                className={`flex items-center gap-5 p-5 rounded-2xl border text-left transition-all ${
                  isSelected 
                    ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_4px_15px_rgba(168,85,247,0.1)]' 
                    : 'bg-[var(--bg-app)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border transition-all ${
                  isSelected ? 'bg-purple-500 text-white border-purple-500' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                }`}>
                  {letter}
                </div>
                <span className={`text-sm md:text-base font-medium ${isSelected ? 'text-purple-400' : 'text-[var(--text-primary)]'}`}>
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
              className="flex items-center gap-2 px-8 py-3 bg-[var(--color-purple)] text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
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

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, FileText, Users, Brain, Sparkles, Activity, CheckCircle2 } from 'lucide-react'
import StatsCard from '../../components/ui/StatsCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'

const TeacherDashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [batches, setBatches] = useState([])
  const [stats, setStats] = useState({ batches: 0, students: 0, tests: 0, aiTests: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTests, setActiveTests] = useState([])
  const [liveResults, setLiveResults] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: myBatches } = await supabase
          .from('batches')
          .select('*, students(id)')
          .eq('teacher_id', user.id)

        const batchList = myBatches || []
        const batchIds = (batchList || []).map((b) => b.id).filter(Boolean)

        let testCount = 0
        let aiTestCount = 0
        if (batchIds.length > 0) {
          const { count } = await supabase
            .from('tests')
            .select('id', { count: 'exact', head: true })
            .in('batch_id', batchIds)
          testCount = count || 0

          const { count: aiCount } = await supabase
            .from('tests')
            .select('id', { count: 'exact', head: true })
            .in('batch_id', batchIds)
            .eq('is_ai_generated', true)
          aiTestCount = aiCount || 0
        }

        const totalStudents = (batchList || []).reduce((sum, b) => sum + (b.students?.length || 0), 0)

        setStats({
          batches: batchList.length,
          students: totalStudents,
          tests: testCount,
          aiTests: aiTestCount,
        })
        setBatches(batchList)

        // Fetch active/recent tests for live analytics
        if (batchIds.length > 0) {
          const { data: recentTests } = await supabase
            .from('tests')
            .select('id, title, end_time, total_marks')
            .in('batch_id', batchIds)
            .order('created_at', { ascending: false })
            .limit(3)
          
          if (recentTests && recentTests.length > 0) {
            setActiveTests(recentTests)
            const testIds = recentTests.map(t => t.id)
            
            const { data: resData } = await supabase
              .from('results')
              .select('id, test_id, marks')
              .in('test_id', testIds)
            
            setLiveResults(resData || [])
          }
        }

      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchData()
  }, [user])

  // Realtime subscription for live results
  useEffect(() => {
    if (activeTests.length === 0) return

    const testIds = activeTests.map(t => t.id)
    const channel = supabase
      .channel('live-results')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'results' }, payload => {
        if (testIds.includes(payload.new.test_id)) {
          setLiveResults(prev => [...prev, payload.new])
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [activeTests])

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
            Faculty Dashboard
          </motion.h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">Manage your classes and student progress</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/tests')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
        >
          <Brain className="w-5 h-5" /> Create AI Test
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="My Batches" value={stats.batches} icon={Layers} color="purple" />
        <StatsCard title="Total Students" value={stats.students} icon={Users} color="blue" />
        <StatsCard title="Tests Created" value={stats.tests} icon={FileText} color="cyan" />
        <StatsCard title="AI Tests" value={stats.aiTests} icon={Sparkles} color="amber" />
      </div>

      {/* My Batches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-[var(--color-purple)]/10 text-[var(--color-purple)]">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">My Batches</h2>
        </div>
        {batches.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No batches assigned yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] transition-all group"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-purple)] transition-colors">{batch.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{batch.subject || 'No subject'}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <Users className="w-3.5 h-3.5" />
                  <span className="font-semibold text-[var(--text-primary)]">{batch.students?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Live Test Analytics */}
      {activeTests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Live Test Analytics</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
              Real-time
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTests.map((t) => {
              const testResults = (liveResults || []).filter(r => r.test_id === t.id)
              const attemptCount = testResults.length
              const isEnded = (t.end_time && new Date(t.end_time) < new Date()) || false
              const avgScore = attemptCount > 0 
                ? (testResults.reduce((sum, r) => sum + (r.marks || 0), 0) / attemptCount).toFixed(1) 
                : 0

              return (
                <div key={t.id} className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--color-purple)]/50 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] truncate pr-2">{t.title}</h3>
                      {isEnded ? (
                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                      )}
                    </div>
                    
                    <div className="flex items-end gap-2 mt-4">
                      <div className="text-3xl font-black text-[var(--text-primary)]">{attemptCount}</div>
                      <div className="text-xs text-[var(--text-secondary)] font-medium pb-1 uppercase tracking-wider">Submissions</div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase text-[var(--text-secondary)] font-bold mb-0.5 tracking-wider">Avg Score</p>
                      <p className="text-sm font-semibold text-[var(--color-purple)]">{avgScore} <span className="text-[var(--text-secondary)]">/ {t.total_marks || '?'}</span></p>
                    </div>
                    <button onClick={() => navigate('/dashboard/results')} className="text-xs font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default TeacherDashboard

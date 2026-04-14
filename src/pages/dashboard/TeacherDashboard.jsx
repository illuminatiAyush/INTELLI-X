import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, FileText, Users, Brain, Sparkles, Activity, CheckCircle2 } from 'lucide-react'
import StatsCard from '../../components/ui/StatsCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

const TeacherDashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [liveResults, setLiveResults] = useState([])

  const { data: dashboardData, loading } = useAppQuery(`teacher-dashboard-${user?.id}`, async () => {
    if (!user) return null
    
    const { data: myBatches } = await supabase
      .from('batches')
      .select('id, name, subject, students(id)')
      .eq('teacher_id', user.id)

    const batchList = myBatches || []
    const batchIds = batchList.map((b) => b.id).filter(Boolean)

    let testCount = 0
    let aiTestCount = 0
    let activeTests = []
    let liveResults = []

    if (batchIds.length > 0) {
      const [{ count }, { count: aiCount }] = await Promise.all([
        supabase.from('tests').select('id', { count: 'exact', head: true }).in('batch_id', batchIds),
        supabase.from('tests').select('id', { count: 'exact', head: true }).in('batch_id', batchIds).eq('is_ai_generated', true)
      ])
      testCount = count || 0
      aiTestCount = aiCount || 0

      const { data: recentTests } = await supabase
        .from('tests')
        .select('id, title, end_time, total_marks')
        .in('batch_id', batchIds)
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (recentTests && recentTests.length > 0) {
        activeTests = recentTests
        const testIds = recentTests.map(t => t.id)
        
        const { data: resData } = await supabase
          .from('results')
          .select('id, test_id, marks')
          .in('test_id', testIds)
        
        liveResults = resData || []
      }
    }

    const totalStudents = batchList.reduce((sum, b) => sum + (b.students?.length || 0), 0)

    return {
      stats: {
        batches: batchList.length,
        students: totalStudents,
        tests: testCount,
        aiTests: aiTestCount,
      },
      batches: batchList,
      activeTests,
      initialLiveResults: liveResults
    }
  }, { enabled: !!user })

  useEffect(() => {
    if (dashboardData?.initialLiveResults) {
      setLiveResults(dashboardData.initialLiveResults)
    }
  }, [dashboardData])

  if (loading && !dashboardData) return <DashboardSkeleton />

  const { stats, batches, activeTests } = dashboardData || {
    stats: { batches: 0, students: 0, tests: 0, aiTests: 0 },
    batches: [],
    activeTests: []
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold text-[var(--text-primary)] tracking-tight"
          >
            Faculty Overview
          </motion.h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1.5 font-medium">Manage institutional classes and sync student progress</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/tests')}
          className="flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-white text-black shadow-sm text-sm font-bold active:scale-95 transition-all hover:bg-gray-200"
        >
          <Sparkles className="w-5 h-5" /> Create AI Test
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="My Batches" value={stats.batches} icon={Layers} color="white" />
        <StatsCard title="Total Students" value={stats.students} icon={Users} color="white" />
        <StatsCard title="Tests Created" value={stats.tests} icon={FileText} color="white" />
        <StatsCard title="AI Tests" value={stats.aiTests} icon={Sparkles} color="white" />
      </div>

      {/* My Batches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden"
      >

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-white/5 text-white/50 border border-white/10 shadow-xl' : 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'}`}>
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Active Batches</h2>
          </div>
          <button onClick={() => navigate('/dashboard/batches')} className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors border-b border-transparent hover:border-[var(--text-primary)]/20 pb-1">
            Manage All
          </button>
        </div>
        {batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-[2rem] border border-dashed border-[var(--border-subtle)] gap-3">
             <div className="p-4 rounded-2xl bg-[var(--bg-card)]">
                <Users className="w-8 h-8 opacity-20" />
              </div>
              <p className="uppercase tracking-widest text-[10px] font-bold">No institutional batches found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between px-6 py-5 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-white/[0.03] hover:border-white/10 transition-all group cursor-pointer"
                onClick={() => navigate(`/dashboard/batches/${batch.id}`)}
              >
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)] transition-colors">{batch.name}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">{batch.subject || 'Core Subject'}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight">
                  <Users className="w-3.5 h-3.5 opacity-50" />
                  <span className="text-[var(--text-primary)]">{batch.students?.length || 0} Students</span>
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
          className="rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden"
        >

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Real-time Analytics</h2>
            </div>
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-[0.1em]">
               Link Established
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {activeTests.map((t) => {
              const testResults = (liveResults || []).filter(r => r.test_id === t.id)
              const attemptCount = testResults.length
              const isEnded = (t.end_time && new Date(t.end_time) < new Date()) || false
              const avgScore = attemptCount > 0 
                ? (testResults.reduce((sum, r) => sum + (r.marks || 0), 0) / attemptCount).toFixed(1) 
                : 0

              return (
                <div key={t.id} className="p-6 rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-white/[0.05] hover:border-white/10 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden">
                   <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] transition-colors truncate pr-2">{t.title}</h3>
                      {isEnded ? (
                        <CheckCircle2 className="w-4 h-4 text-gray-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                      )}
                    </div>
                    
                    <div className="flex items-end gap-3 mt-6">
                      <div className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">{attemptCount}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-bold pb-2 uppercase tracking-widest">Submissions</div>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase text-[var(--text-secondary)] font-bold mb-1 tracking-widest">Global Avg</p>
                      <p className="text-sm font-bold text-[var(--text-primary)]">{avgScore} <span className="text-[var(--text-secondary)] font-medium">/ {t.total_marks || '?'}</span></p>
                    </div>
                    <button onClick={() => navigate('/dashboard/results')} className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-all border-b border-transparent hover:border-[var(--border-subtle)]">
                      Sync Results &rarr;
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

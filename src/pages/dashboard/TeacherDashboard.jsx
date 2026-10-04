import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Layers, FileText, Users, Sparkles,
  Activity, CheckCircle2, ArrowRight, Plus,
} from 'lucide-react'
import StatsCard from '../../components/ui/StatsCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

/* ── helpers ─────────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut', delay },
})

const SectionHeader = ({ title, action, onAction }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
      {title}
    </h2>
    {action && (
      <button
        onClick={onAction}
        className="text-[11px] font-semibold uppercase tracking-widest transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        {action} →
      </button>
    )}
  </div>
)

/* ── component ───────────────────────────────────────────────────── */
const TeacherDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [liveResults, setLiveResults] = useState([])

  const { data: dashboardData, loading } = useAppQuery(
    `teacher-dashboard-${user?.id}`,
    async () => {
      if (!user) return null

      const { data: myBatches } = await supabase
        .from('batches')
        .select('id, name, subject, students(id)')
        .eq('teacher_id', user.id)

      const batchList = myBatches || []
      const batchIds = batchList.map(b => b.id).filter(Boolean)

      let testCount = 0, aiTestCount = 0, activeTests = [], liveResults = []

      if (batchIds.length > 0) {
        const [{ count }, { count: aiCount }] = await Promise.all([
          supabase.from('tests').select('id', { count: 'exact', head: true }).in('batch_id', batchIds),
          supabase.from('tests').select('id', { count: 'exact', head: true }).in('batch_id', batchIds).eq('is_ai_generated', true),
        ])
        testCount = count || 0
        aiTestCount = aiCount || 0

        const { data: recentTests } = await supabase
          .from('tests')
          .select('id, title, end_time, total_marks, batch_id')
          .in('batch_id', batchIds)
          .order('created_at', { ascending: false })
          .limit(6)

        if (recentTests?.length) {
          activeTests = recentTests
          const { data: resData } = await supabase
            .from('results')
            .select('id, test_id, marks')
            .in('test_id', recentTests.map(t => t.id))
          liveResults = resData || []
        }
      }

      const totalStudents = batchList.reduce((sum, b) => sum + (b.students?.length || 0), 0)

      return {
        stats: { batches: batchList.length, students: totalStudents, tests: testCount, aiTests: aiTestCount },
        batches: batchList,
        activeTests,
        initialLiveResults: liveResults,
      }
    },
    { enabled: !!user }
  )

  useEffect(() => {
    if (dashboardData?.initialLiveResults) setLiveResults(dashboardData.initialLiveResults)
  }, [dashboardData])

  if (loading && !dashboardData) return <DashboardSkeleton />

  const { stats, batches, activeTests } = dashboardData || {
    stats: { batches: 0, students: 0, tests: 0, aiTests: 0 },
    batches: [],
    activeTests: [],
  }

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <motion.div {...fadeUp()} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            Faculty overview
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Manage your batches and track student progress
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/tests')}
          className="btn-primary flex-shrink-0"
          style={{ height: 36, paddingLeft: 14, paddingRight: 14 }}
        >
          <Sparkles size={13} strokeWidth={2} /> Create AI Test
        </button>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard title="My Batches"      value={stats.batches}   icon={Layers}   color="purple"  />
        <StatsCard title="Total Students"  value={stats.students}  icon={Users}    color="blue"    />
        <StatsCard title="Tests Created"   value={stats.tests}     icon={FileText} color="emerald" />
        <StatsCard title="AI Tests"        value={stats.aiTests}   icon={Sparkles} color="indigo"  />
      </motion.div>

      {/* ── Main grid: batches + analytics ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Active batches — 2 cols */}
        <motion.div
          {...fadeUp(0.1)}
          className="xl:col-span-2 rounded-2xl p-6 flex flex-col"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <SectionHeader
            title="Active batches"
            action="Manage all"
            onAction={() => navigate('/dashboard/batches')}
          />

          {batches.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                <Users size={16} strokeWidth={1.6} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                No batches yet
              </p>
              <button
                onClick={() => navigate('/dashboard/batches')}
                className="btn-ghost text-[11px]"
                style={{ height: 32, paddingLeft: 12, paddingRight: 12 }}
              >
                <Plus size={12} /> Create batch
              </button>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {batches.map(batch => (
                <button
                  key={batch.id}
                  onClick={() => navigate('/dashboard/batches')}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {batch.name}
                    </p>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {batch.subject || 'Core Subject'}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-lg"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Users size={10} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {batch.students?.length || 0}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Real-time analytics — 3 cols */}
        <motion.div
          {...fadeUp(0.12)}
          className="xl:col-span-3 rounded-2xl p-6 flex flex-col"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Test analytics
              </h2>
              {activeTests.length > 0 && (
                <span
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    color: 'rgb(74,222,128)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/dashboard/results')}
              className="text-[11px] font-semibold uppercase tracking-widest transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              All results →
            </button>
          </div>

          {activeTests.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                <Activity size={16} strokeWidth={1.6} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No tests yet — create one to see live data
              </p>
              <button
                onClick={() => navigate('/dashboard/tests')}
                className="btn-primary text-[11px]"
                style={{ height: 32, paddingLeft: 12, paddingRight: 12 }}
              >
                <Sparkles size={12} /> Create AI test
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
              {activeTests.map(t => {
                const testResults = liveResults.filter(r => r.test_id === t.id)
                const attemptCount = testResults.length
                const isEnded = t.end_time && new Date(t.end_time) < new Date()
                const avgScore = attemptCount > 0
                  ? (testResults.reduce((s, r) => s + (r.marks || 0), 0) / attemptCount).toFixed(1)
                  : 0
                const pct = t.total_marks
                  ? Math.round((parseFloat(avgScore) / t.total_marks) * 100)
                  : 0

                return (
                  <div
                    key={t.id}
                    className="rounded-xl p-4 flex flex-col justify-between transition-colors cursor-pointer"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                    }}
                    onClick={() => navigate('/dashboard/results')}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    {/* title row */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <p
                        className="text-xs font-semibold leading-snug line-clamp-2"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {t.title}
                      </p>
                      {isEnded
                        ? <CheckCircle2 size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        : <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0 mt-0.5" />
                      }
                    </div>

                    {/* big number */}
                    <div className="mb-4">
                      <span
                        className="text-3xl font-black tabular-nums tracking-tighter"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {attemptCount}
                      </span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider ml-2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        submissions
                      </span>
                    </div>

                    {/* avg score + bar */}
                    <div
                      className="pt-3"
                      style={{ borderTop: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                          Avg score
                        </span>
                        <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                          {avgScore}
                          <span style={{ color: 'var(--text-muted)' }}>/{t.total_marks || '?'}</span>
                        </span>
                      </div>
                      <div
                        className="w-full h-0.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--border-subtle)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: 'var(--text-primary)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Quick actions ── */}
      <motion.div {...fadeUp(0.18)}>
        <SectionHeader title="Quick actions" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'New Lecture',   icon: FileText,    path: '/dashboard/lectures'  },
            { label: 'View Students', icon: Users,       path: '/dashboard/students'  },
            { label: 'Attendance',    icon: CheckCircle2, path: '/dashboard/attendance'},
            { label: 'Analytics',     icon: Activity,    path: '/dashboard/analytics' },
          ].map(({ label, icon: Icon, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-colors group"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                <Icon size={14} strokeWidth={1.8} style={{ color: 'var(--text-muted)' }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

    </div>
  )
}

export default TeacherDashboard

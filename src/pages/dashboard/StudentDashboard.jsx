import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Trophy, ClipboardCheck, TrendingUp,
  Sparkles, Play, Clock, Activity, Plus, Bell, X, Lock,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import StatsCard from '../../components/ui/StatsCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

/* ── tiny helpers ──────────────────────────────────────────────── */
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

/* custom recharts tooltip */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs font-semibold"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        color: 'var(--text-primary)',
      }}
    >
      <p style={{ color: 'var(--text-muted)' }} className="mb-0.5">{label}</p>
      <p>{payload[0].value}%</p>
    </div>
  )
}

/* ── component ─────────────────────────────────────────────────── */
const StudentDashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const { data: studentData, loading } = useAppQuery(
    `student-dashboard-${user?.id}`,
    async () => {
      if (!user) return null
      const now = new Date()

      const { data: students } = await supabase
        .from('students').select('id, name, profile_id').eq('profile_id', user.id)
      const student = students?.[0]
      if (!student) return { studentRecord: null }

      const { data: batches } = await supabase
        .from('batch_students').select('batch_id').eq('student_id', user.id)
      if (!batches?.length) return { studentRecord: student, hasBatches: false }

      const batchIds = batches.map(b => b.batch_id)

      const { data: batchDetails } = await supabase
        .from('batches').select('id, name, subject').in('id', batchIds).order('name')

      const { data: results } = await supabase
        .from('results')
        .select('id, marks, test_id, created_at, rank, tests(id, title, total_marks, date)')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      const resultList = results || []
      const totalMarks = resultList.reduce((s, r) => s + r.marks, 0)
      const totalPossible = resultList.reduce((s, r) => s + (r.tests?.total_marks || 100), 0)
      const avgScore = totalPossible ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0

      const { data: attendance } = await supabase
        .from('attendance').select('status').eq('student_id', user.id)
      const totalA = attendance?.length || 0
      const presentA = attendance?.filter(a => a.status === 'present').length || 0
      const attendanceRate = totalA ? ((presentA / totalA) * 100).toFixed(1) : 0

      const { data: testData } = await supabase
        .from('tests')
        .select('id, title, date, start_time, end_time, duration_minutes, batch_id, batches(name)')
        .in('batch_id', batchIds)
        .order('date', { ascending: false })

      const resultTestIds = new Set(resultList.map(r => r.test_id))
      const activeOrUpcoming = (testData || [])
        .filter(t => t.id && !resultTestIds.has(t.id))
        .filter(t => !(t.end_time && new Date(t.end_time) < now))
        .slice(0, 4)

      const chartData = resultList.slice(0, 10).reverse().map(r => ({
        name: r.tests?.title?.substring(0, 12) || 'Test',
        score: Math.round((r.marks / (r.tests?.total_marks || 100)) * 100),
        date: new Date(r.tests?.date || r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }))

      const { data: notifies } = await supabase
        .from('notifications')
        .select('id, title, message, read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      return {
        studentRecord: student,
        hasBatches: true,
        stats: { tests: resultList.length, avgScore, attendanceRate, rank: resultList[0]?.rank || '-' },
        recentResults: resultList.slice(0, 5),
        activeTests: activeOrUpcoming,
        chartData,
        enrolledBatches: batchDetails || [],
        notifications: notifies || [],
        unreadCount: notifies?.filter(n => !n.read).length || 0,
      }
    },
    { enabled: !!user }
  )

  useEffect(() => {
    if (studentData?.notifications) {
      setNotifications(studentData.notifications)
      setUnreadCount(studentData.unreadCount)
    }
  }, [studentData])

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  if (loading && !studentData) return <DashboardSkeleton />

  const {
    studentRecord, stats, recentResults, activeTests,
    hasBatches, chartData, enrolledBatches,
  } = studentData || {
    studentRecord: null,
    stats: { tests: 0, avgScore: 0, attendanceRate: 0, rank: '-' },
    recentResults: [], activeTests: [], hasBatches: true,
    chartData: [], enrolledBatches: [],
  }

  /* no profile */
  if (!studentRecord) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Activity size={32} className="mb-4" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          No student profile found
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Contact your admin to link your account.
        </p>
      </div>
    )
  }

  /* no batches */
  if (!hasBatches) {
    return (
      <motion.div
        {...fadeUp()}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <BookOpen size={22} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h2 className="text-xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
          Welcome to IntelliX
        </h2>
        <p className="text-sm max-w-sm mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          You haven't joined any classes yet. Get your join code from your teacher to get started.
        </p>
        <button
          onClick={() => navigate('/dashboard/join')}
          className="btn-primary"
        >
          <Plus size={14} strokeWidth={2} /> Join your first subject
        </button>
      </motion.div>
    )
  }

  const gridLine = isDark
    ? 'rgba(255,255,255,0.04)'
    : 'rgba(0,0,0,0.06)'

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <motion.div {...fadeUp()} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            {studentRecord.name}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Academic performance &amp; progress
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(v => !v)}
              className="relative p-2 rounded-lg transition-colors"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <Bell size={15} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--text-primary)' }}
                />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 rounded-xl overflow-hidden z-50"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-strong)',
                    boxShadow: 'var(--shadow-elevated)',
                  }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                      Notifications
                    </span>
                    <button onClick={() => setShowNotifications(false)} style={{ color: 'var(--text-muted)' }}>
                      <X size={13} />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                        No notifications
                      </p>
                    ) : notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => !n.read && markAsRead(n.id)}
                        className="px-4 py-3 cursor-pointer transition-colors"
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          background: n.read ? 'transparent' : 'var(--accent-muted)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: 'var(--text-primary)' }} />
                          )}
                        </div>
                        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                        <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                          {new Date(n.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => navigate('/dashboard/join')}
            className="btn-primary"
            style={{ height: 36, paddingLeft: 14, paddingRight: 14 }}
          >
            <Plus size={13} strokeWidth={2.5} /> Join Subject
          </button>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard title="Tests Taken"  value={stats.tests}                icon={BookOpen}      color="blue"   />
        <StatsCard title="Avg Score"    value={`${stats.avgScore}%`}        icon={TrendingUp}    color="emerald"/>
        <StatsCard title="Attendance"   value={`${stats.attendanceRate}%`}  icon={ClipboardCheck} color="indigo"/>
        <StatsCard title="Last Rank"    value={`#${stats.rank}`}            icon={Trophy}        color="amber"  />
      </motion.div>

      {/* ── Main grid: chart + active tests ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Performance chart — 3 cols */}
        <motion.div
          {...fadeUp(0.1)}
          className="xl:col-span-3 rounded-2xl p-6"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <SectionHeader title="Performance trend" />
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No test data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--text-primary)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--text-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridLine} strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 600 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 600 }}
                  axisLine={false} tickLine={false}
                />
                <RechartsTooltip content={<ChartTooltip />} cursor={false} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--text-primary)"
                  strokeWidth={1.5}
                  fill="url(#scoreGrad)"
                  dot={false}
                  activeDot={{ r: 3, fill: 'var(--text-primary)', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Active tests — 2 cols */}
        <motion.div
          {...fadeUp(0.12)}
          className="xl:col-span-2 rounded-2xl p-6 flex flex-col"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <SectionHeader
            title="Active tests"
            action="View all"
            onAction={() => navigate('/dashboard/active-tests')}
          />

          {activeTests.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No active tests right now</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {activeTests.map(test => {
                const isLocked = test.start_time && new Date(test.start_time) > new Date()
                return (
                  <button
                    key={test.id}
                    onClick={() => !isLocked && navigate(`/dashboard/test-attempt/${test.id}`)}
                    disabled={isLocked}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors group"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      opacity: isLocked ? 0.55 : 1,
                      cursor: isLocked ? 'default' : 'pointer',
                    }}
                    onMouseEnter={e => {
                      if (!isLocked) e.currentTarget.style.borderColor = 'var(--border-accent)'
                    }}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <div className="min-w-0">
                      <p
                        className="text-xs font-semibold truncate mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {test.title}
                      </p>
                      <div className="flex items-center gap-2">
                        {isLocked ? (
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Clock size={10} /> Scheduled
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            Live now
                          </span>
                        )}
                        {test.duration_minutes && (
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            · {test.duration_minutes}m
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {isLocked ? <Lock size={12} strokeWidth={1.8} /> : <Play size={12} strokeWidth={1.8} />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Enrolled subjects ── */}
      <motion.div {...fadeUp(0.15)}>
        <SectionHeader
          title="My subjects"
          action="Manage"
          onAction={() => navigate('/dashboard/batches')}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {enrolledBatches.map((batch, i) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.28 }}
              className="rounded-xl p-4 cursor-pointer transition-colors group"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                <BookOpen size={14} strokeWidth={1.8} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-xs font-semibold truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {batch.name}
              </p>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider truncate"
                style={{ color: 'var(--text-muted)' }}
              >
                {batch.subject || 'Subject'}
              </p>
            </motion.div>
          ))}

          {/* Add more */}
          <button
            onClick={() => navigate('/dashboard/join')}
            className="rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors"
            style={{
              background: 'transparent',
              border: '1px dashed var(--border-strong)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
          >
            <Plus size={14} strokeWidth={1.8} style={{ color: 'var(--text-muted)' }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Join
            </span>
          </button>
        </div>
      </motion.div>

      {/* ── Recent results ── */}
      {recentResults.length > 0 && (
        <motion.div {...fadeUp(0.18)}>
          <SectionHeader
            title="Recent results"
            action="View all"
            onAction={() => navigate('/dashboard/results')}
          />
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            {recentResults.map((r, i) => {
              const pct = Math.round((r.marks / (r.tests?.total_marks || 100)) * 100)
              const isLast = i === recentResults.length - 1
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{
                    background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-surface)',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {r.tests?.title || 'Test'}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {r.tests?.date
                        ? new Date(r.tests.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {/* score bar */}
                    <div className="hidden sm:flex items-center gap-2">
                      <div
                        className="w-20 h-1 rounded-full overflow-hidden"
                        style={{ background: 'var(--border-subtle)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 70
                              ? 'var(--text-primary)'
                              : pct >= 40
                                ? 'rgb(234 179 8)'
                                : 'rgb(239 68 68)',
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold tabular-nums w-12 text-right"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {r.marks}
                      <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>
                        /{r.tests?.total_marks || 100}
                      </span>
                    </span>
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

export default StudentDashboard

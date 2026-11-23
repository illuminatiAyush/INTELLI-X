import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Users, Layers, FileText, ClipboardCheck, Plus,
  Activity, AlertTriangle, Brain, Calendar, UserPlus, FolderPlus, FileCheck,
} from 'lucide-react'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip as ChartTooltip, Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'
import { FALLBACK_ADMIN_DASHBOARD } from '../../demo/dashboardMockData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, Filler)

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut', delay },
})

const AdminDashboard = () => {
  const { isDark } = useTheme()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const displayName = profile?.name || 
    (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : null) || 
    'Admin'

  const { data: dashboardData, loading } = useAppQuery('admin-dashboard', async () => {
    const [studentsRes, batchesRes, testsRes, attendanceRes] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }),
      supabase.from('batches').select('id', { count: 'exact', head: true }),
      supabase.from('tests').select('id, date').gte('date', new Date().toISOString()),
      supabase.from('attendance').select('status'),
    ])

    const upcomingTests = testsRes.data?.length || 0
    const totalA = attendanceRes.data?.length || 0
    const presentA = attendanceRes.data?.filter(a => a.status === 'present').length || 0
    const attendanceRate = totalA ? ((presentA / totalA) * 100).toFixed(1) : 0

    const { data: allResults } = await supabase
      .from('results')
      .select('id, marks, test_id, tests(id, title, total_marks, date, batch_id, batches(name))')
      .order('created_at', { ascending: false })
      .limit(50)

    let performanceData = []
    if (allResults?.length) {
      const testMap = {}
      allResults.forEach(r => {
        const tid = r.tests?.id
        if (!tid) return
        if (!testMap[tid]) {
          testMap[tid] = { 
            name: r.tests.title, 
            date: new Date(r.tests.date), 
            total: 0, 
            count: 0, 
            max: r.tests.total_marks || 100 
          }
        }
        testMap[tid].total += r.marks
        testMap[tid].count += 1
      })
      performanceData = Object.values(testMap)
        .sort((a, b) => a.date - b.date)
        .slice(-6)
        .map(t => ({
          name: t.name,
          avg: Math.round((t.total / t.count / t.max) * 100),
          date: t.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        }))
    }

    return {
      stats: { 
        students: studentsRes.count || 0, 
        batches: batchesRes.count || 0, 
        tests: upcomingTests, 
        attendance: attendanceRate 
      },
      performanceData,
    }
  })

  if (loading && !dashboardData) return <DashboardSkeleton />

  const rawStats = dashboardData?.stats
  const hasRealData = rawStats && (rawStats.students > 0 || rawStats.batches > 0 || rawStats.tests > 0)
  const stats = hasRealData ? rawStats : FALLBACK_ADMIN_DASHBOARD.stats
  const performanceData = (dashboardData?.performanceData?.length ? dashboardData.performanceData : FALLBACK_ADMIN_DASHBOARD.performanceData)

  return (
    <div className="space-y-6">

      {/* ── Header with Greeting ── */}
      <motion.div {...fadeUp()}>
        <h1 className="text-2xl sm:text-3xl font-bold text-dashboard-text tracking-tight mb-1">
          {getGreeting()}, {displayName.toLowerCase()}.
        </h1>
        <p className="text-dashboard-text-secondary text-xs sm:text-sm font-medium">
          Welcome back to your institute command center
        </p>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div {...fadeUp(0.05)}>
        <h2 className="text-xs font-bold uppercase tracking-wider text-dashboard-text-secondary mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Add Student — Emerald Accent */}
          <div
            onClick={() => navigate('/dashboard/students')}
            className="quick-action-card group hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 dark:hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)]"
          >
            <div className="quick-action-icon bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-500/25 group-hover:scale-105 transition-all">
              <UserPlus size={22} strokeWidth={2.2} />
            </div>
            <h3 className="text-sm font-semibold text-dashboard-text tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Add Student
            </h3>
            <p className="text-[11px] text-dashboard-text-secondary mt-0.5">Enroll new candidate</p>
          </div>

          {/* 2. Add Teachers — Violet Accent */}
          <div
            onClick={() => navigate('/dashboard/teachers')}
            className="quick-action-card group hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 dark:hover:shadow-[0_8px_24px_rgba(139,92,246,0.12)]"
          >
            <div className="quick-action-icon bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-200/70 dark:border-violet-500/25 group-hover:scale-105 transition-all">
              <Users size={22} strokeWidth={2.2} />
            </div>
            <h3 className="text-sm font-semibold text-dashboard-text tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Add Teachers
            </h3>
            <p className="text-[11px] text-dashboard-text-secondary mt-0.5">Onboard faculty</p>
          </div>

          {/* 3. Create Batch — Signature Theme Lime Accent */}
          <div
            onClick={() => navigate('/dashboard/batches')}
            className="quick-action-card group hover:border-lime-500/50 dark:hover:border-lime-400/50 hover:shadow-lg hover:shadow-lime-500/10 dark:hover:shadow-[0_8px_24px_rgba(190,242,100,0.15)]"
          >
            <div className="quick-action-icon bg-lime-100/70 dark:bg-lime-400/15 text-lime-700 dark:text-lime-300 border border-lime-300 dark:border-lime-400/30 group-hover:scale-105 transition-all shadow-[0_0_12px_rgba(190,242,100,0.20)]">
              <FolderPlus size={22} strokeWidth={2.2} />
            </div>
            <h3 className="text-sm font-semibold text-dashboard-text tracking-tight group-hover:text-lime-700 dark:group-hover:text-lime-300 transition-colors">
              Create Batch
            </h3>
            <p className="text-[11px] text-dashboard-text-secondary mt-0.5">Cohort & schedule</p>
          </div>

          {/* 4. Record Test — Amber Accent */}
          <div
            onClick={() => navigate('/dashboard/tests')}
            className="quick-action-card group hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 dark:hover:shadow-[0_8px_24px_rgba(245,158,11,0.12)]"
          >
            <div className="quick-action-icon bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-500/25 group-hover:scale-105 transition-all">
              <FileCheck size={22} strokeWidth={2.2} />
            </div>
            <h3 className="text-sm font-semibold text-dashboard-text tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Record Test
            </h3>
            <p className="text-[11px] text-dashboard-text-secondary mt-0.5">Publish test scores</p>
          </div>
        </div>
      </motion.div>

      {/* ── Performance Overview ── */}
      <motion.div {...fadeUp(0.1)}>
        <h2 className="text-xs font-bold uppercase tracking-wider text-dashboard-text-secondary mb-4">
          Performance Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Student Growth — Sky Blue / Indigo Accent */}
          <div className="dashboard-card hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-dashboard-text">Student Growth</h3>
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-200/70 dark:border-sky-500/20 flex items-center justify-center">
                <Users size={19} strokeWidth={2.2} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-dashboard-text tracking-tight mb-1">{stats.students}</div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300">
                Enrolled
              </span>
            </div>
            <p className="text-xs text-dashboard-text-secondary">Total enrolled students</p>
          </div>

          {/* Attendance Rate — Theme Lime Accent */}
          <div className="dashboard-card hover:border-lime-400/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-dashboard-text">Attendance Rate</h3>
              <div className="w-10 h-10 rounded-xl bg-lime-100/70 dark:bg-lime-400/15 text-lime-700 dark:text-lime-300 border border-lime-300/70 dark:border-lime-400/25 flex items-center justify-center shadow-[0_0_10px_rgba(190,242,100,0.15)]">
                <ClipboardCheck size={19} strokeWidth={2.2} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-dashboard-text tracking-tight mb-1">{stats.attendance}%</div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-lime-100 dark:bg-lime-400/20 text-lime-800 dark:text-lime-300">
                Target: 85%
              </span>
            </div>
            <p className="text-xs text-dashboard-text-secondary">Overall session attendance</p>
          </div>

          {/* Active Batches — Fuchsia Accent */}
          <div className="dashboard-card hover:border-fuchsia-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-dashboard-text">Active Batches</h3>
              <div className="w-10 h-10 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200/70 dark:border-fuchsia-500/20 flex items-center justify-center">
                <Layers size={19} strokeWidth={2.2} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-dashboard-text tracking-tight mb-1">{stats.batches}</div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300">
                In Session
              </span>
            </div>
            <p className="text-xs text-dashboard-text-secondary">Running academic cohorts</p>
          </div>
        </div>
      </motion.div>

      {/* ── Performance Chart ── */}
      {performanceData.length > 0 && (
        <motion.div {...fadeUp(0.15)} className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-dashboard-text">Recent Performance Trend</h3>
              <p className="text-xs text-dashboard-text-secondary mt-0.5">Average score per examination cohort</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-dashboard-text-secondary">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500 dark:bg-lime-400 shadow-[0_0_8px_rgba(190,242,100,0.5)]" />
              <span>Score %</span>
            </div>
          </div>

          <div style={{ height: 250 }}>
            <Line
              data={{
                labels: performanceData.map(d => d.date),
                datasets: [{
                  label: 'Average Score',
                  data: performanceData.map(d => d.avg),
                  borderColor: isDark ? '#bef264' : '#65a30d',
                  backgroundColor: isDark ? 'rgba(190, 242, 100, 0.12)' : 'rgba(101, 163, 13, 0.08)',
                  borderWidth: 2.5,
                  tension: 0.35,
                  fill: true,
                  pointBackgroundColor: isDark ? '#bef264' : '#65a30d',
                  pointBorderColor: isDark ? '#121215' : '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 4.5,
                  pointHoverRadius: 7,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: isDark ? '#121215' : '#FFFFFF',
                    titleColor: isDark ? '#FAFAFA' : '#111827',
                    bodyColor: isDark ? '#A1A1AA' : '#6B7280',
                    borderColor: isDark ? '#27272A' : '#E5E7EB',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                      title: (items) => performanceData[items[0].dataIndex]?.name || '',
                      label: (item) => `Average: ${item.formattedValue}%`,
                    },
                  },
                },
                scales: {
                  x: { 
                    grid: { display: false }, 
                    ticks: { color: isDark ? '#A1A1AA' : '#6B7280', font: { size: 11, weight: '500' } },
                    border: { display: false }
                  },
                  y: { 
                    min: 0, 
                    max: 100, 
                    grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6' }, 
                    ticks: { color: isDark ? '#A1A1AA' : '#6B7280', font: { size: 11, weight: '500' }, stepSize: 25 },
                    border: { display: false }
                  },
                },
              }}
            />
          </div>
        </motion.div>
      )}

    </div>
  )
}

export default AdminDashboard

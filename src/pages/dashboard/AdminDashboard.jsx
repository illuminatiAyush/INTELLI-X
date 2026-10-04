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

  const { stats, performanceData } = dashboardData || {
    stats: { students: 0, batches: 0, tests: 0, attendance: 0 },
    performanceData: [],
  }

  return (
    <div className="space-y-6">

      {/* ── Header with Greeting ── */}
      <motion.div {...fadeUp()}>
        <h1 className="text-3xl font-bold text-dashboard-text mb-2">
          {getGreeting()}, {displayName.toLowerCase()}.
        </h1>
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span className="text-sm text-dashboard-text-secondary">
              <span className="font-semibold text-dashboard-text">{stats.students}</span> Total Students
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
            <span className="text-sm text-dashboard-text-secondary">
              <span className="font-semibold text-dashboard-text">{stats.batches}</span> Total Batches
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-600"></div>
            <span className="text-sm text-dashboard-text-secondary">
              <span className="font-semibold text-dashboard-text">{stats.tests}</span> Upcoming Tests
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div {...fadeUp(0.05)}>
        <h2 className="text-xs font-bold uppercase tracking-wider text-dashboard-text-secondary mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/dashboard/students')}
            className="quick-action-card"
          >
            <div className="quick-action-icon">
              <UserPlus size={24} strokeWidth={2} />
            </div>
            <h3 className="text-base font-semibold text-dashboard-text">Add Student</h3>
          </div>

          <div
            onClick={() => navigate('/dashboard/teachers')}
            className="quick-action-card"
          >
            <div className="quick-action-icon">
              <Users size={24} strokeWidth={2} />
            </div>
            <h3 className="text-base font-semibold text-dashboard-text">Add Teachers</h3>
          </div>

          <div
            onClick={() => navigate('/dashboard/batches')}
            className="quick-action-card"
          >
            <div className="quick-action-icon">
              <FolderPlus size={24} strokeWidth={2} />
            </div>
            <h3 className="text-base font-semibold text-dashboard-text">Create Batch</h3>
          </div>

          <div
            onClick={() => navigate('/dashboard/tests')}
            className="quick-action-card"
          >
            <div className="quick-action-icon">
              <FileCheck size={24} strokeWidth={2} />
            </div>
            <h3 className="text-base font-semibold text-dashboard-text">Record Test</h3>
          </div>
        </div>
      </motion.div>

      {/* ── Performance Overview ── */}
      <motion.div {...fadeUp(0.1)}>
        <h2 className="text-xs font-bold uppercase tracking-wider text-dashboard-text-secondary mb-4">
          Performance Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Student Growth */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-dashboard-text">Student Growth</h3>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users size={20} className="text-blue-600" strokeWidth={2} />
              </div>
            </div>
            <div className="text-3xl font-bold text-dashboard-text mb-1">{stats.students}</div>
            <p className="text-xs text-dashboard-text-secondary">Total enrolled students</p>
          </div>

          {/* Attendance Rate */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-dashboard-text">Attendance Rate</h3>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <ClipboardCheck size={20} className="text-green-600" strokeWidth={2} />
              </div>
            </div>
            <div className="text-3xl font-bold text-dashboard-text mb-1">{stats.attendance}%</div>
            <p className="text-xs text-dashboard-text-secondary">Overall attendance</p>
          </div>

          {/* Active Batches */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-dashboard-text">Active Batches</h3>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Layers size={20} className="text-purple-600" strokeWidth={2} />
              </div>
            </div>
            <div className="text-3xl font-bold text-dashboard-text mb-1">{stats.batches}</div>
            <p className="text-xs text-dashboard-text-secondary">Currently active</p>
          </div>
        </div>
      </motion.div>

      {/* ── Performance Chart ── */}
      {performanceData.length > 0 && (
        <motion.div {...fadeUp(0.15)} className="dashboard-card">
          <h3 className="text-sm font-semibold text-dashboard-text mb-6">Recent Performance Trend</h3>
          <div style={{ height: 250 }}>
            <Line
              data={{
                labels: performanceData.map(d => d.date),
                datasets: [{
                  label: 'Average Score',
                  data: performanceData.map(d => d.avg),
                  borderColor: '#2563EB',
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: '#2563EB',
                  pointRadius: 4,
                  pointHoverRadius: 6,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#FFFFFF',
                    titleColor: '#111827',
                    bodyColor: '#6B7280',
                    borderColor: '#E5E7EB',
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
                    ticks: { color: '#6B7280', font: { size: 11, weight: '500' } },
                    border: { display: false }
                  },
                  y: { 
                    min: 0, 
                    max: 100, 
                    grid: { color: '#F3F4F6' }, 
                    ticks: { color: '#6B7280', font: { size: 11, weight: '500' }, stepSize: 25 },
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

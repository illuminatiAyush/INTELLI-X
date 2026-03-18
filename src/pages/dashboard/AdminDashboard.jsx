import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Layers, FileText, ClipboardCheck, TrendingUp, Calendar } from 'lucide-react'
import StatsCard from '../../components/ui/StatsCard'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'

const AdminDashboard = () => {
  const { isDark } = useTheme()
  const [stats, setStats] = useState({
    students: 0,
    batches: 0,
    tests: 0,
    attendance: 0,
  })
  const [recentTests, setRecentTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, batchesRes, testsRes, attendanceRes] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('batches').select('id', { count: 'exact', head: true }),
          supabase.from('tests').select('id', { count: 'exact', head: true }),
          supabase.from('attendance').select('status'),
        ])

        const totalAttendance = attendanceRes.data?.length || 0
        const presentCount = attendanceRes.data?.filter((a) => a.status === 'present').length || 0
        const attendanceRate = totalAttendance ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0

        setStats({
          students: studentsRes.count || 0,
          batches: batchesRes.count || 0,
          tests: testsRes.count || 0,
          attendance: attendanceRate,
        })

        const { data: tests } = await supabase
          .from('tests')
          .select('*, batches(name)')
          .order('date', { ascending: false })
          .limit(5)
        setRecentTests(tests || [])
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          Admin Dashboard
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">Overview of your institute's performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={stats.students} icon={Users} color="purple" />
        <StatsCard title="Total Batches" value={stats.batches} icon={Layers} color="blue" />
        <StatsCard title="Tests Conducted" value={stats.tests} icon={FileText} color="cyan" />
        <StatsCard title="Attendance Rate" value={`${stats.attendance}%`} icon={ClipboardCheck} color="green" />
      </div>

      {/* Recent Tests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-[var(--color-purple)]/10 text-[var(--color-purple)]">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Tests</h2>
        </div>
        {recentTests.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No tests created yet</p>
        ) : (
          <div className="space-y-3">
            {recentTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] transition-all group"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-purple)] transition-colors">{test.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{test.batches?.name || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{test.total_marks} marks</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{new Date(test.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Add Student', path: '/dashboard/students', color: 'bg-purple-500' },
            { label: 'Create Batch', path: '/dashboard/batches', color: 'bg-blue-500' },
            { label: 'View Results', path: '/dashboard/results', color: 'bg-cyan-500' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.path}
              className={`flex items-center justify-center px-4 py-3.5 rounded-xl ${action.color} text-white text-sm font-semibold hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-${action.color.split('-')[1]}-500/20`}
            >
              {action.label}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard

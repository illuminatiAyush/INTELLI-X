import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Layers, FileText, ClipboardCheck, TrendingUp, Calendar, Activity, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
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
  const [performanceData, setPerformanceData] = useState([])
  const [weakTopics, setWeakTopics] = useState([])
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

        // Aggregation for Admin Analytics
        const { data: allResults } = await supabase
          .from('results')
          .select('marks, tests(title, total_marks), ai_feedback')
        
        if (allResults && allResults.length > 0) {
          // Average Performance by Test
          const testMap = {}
          allResults.forEach(r => {
             const title = r.tests?.title?.substring(0, 15) || 'Test'
             if (!testMap[title]) testMap[title] = { name: title, totalScore: 0, count: 0, maxScore: r.tests?.total_marks || 100 }
             testMap[title].totalScore += r.marks
             testMap[title].count += 1
          })
          const chartPayload = Object.values(testMap).map(t => ({
             name: t.name,
             avg: Math.round(((t.totalScore / t.count) / t.maxScore) * 100)
          }))
          setPerformanceData(chartPayload.slice(0, 5))

          // Weakest Subjects / Topics
          const topicMap = {}
          allResults.forEach(r => {
            if (r.ai_feedback?.weak_topics) {
              r.ai_feedback.weak_topics.forEach(topic => {
                topicMap[topic] = (topicMap[topic] || 0) + 1
              })
            }
          })
          const sortedTopics = Object.entries(topicMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([topic, freq]) => ({ topic, freq }))
          setWeakTopics(sortedTopics)
        }

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

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="col-span-1 lg:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm flex flex-col h-[350px]"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[var(--color-blue)]/10 text-[var(--color-blue)]">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Institute Average Performance (%)</h2>
          </div>
          {performanceData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-[var(--text-secondary)]">No sufficient data</div>
          ) : (
            <div className="flex-1 w-full h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: 'var(--bg-app)' }}
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)', borderRadius: '12px' }} 
                  />
                  <Bar dataKey="avg" name="Avg Score %" radius={[6, 6, 0, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#06b6d4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Weakest Subjects */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2 }}
           className="col-span-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm flex flex-col h-[350px]"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Common Weaknesses</h2>
          </div>
          {weakTopics.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-[var(--text-secondary)]">AI feedback not generated yet.</div>
          ) : (
            <div className="flex-1 space-y-3">
              {weakTopics.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate pr-2">{item.topic}</span>
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-md">{item.freq} incidents</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
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

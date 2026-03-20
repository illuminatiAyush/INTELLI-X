import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, ClipboardCheck, TrendingUp, AlertTriangle, Trophy } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import StatsCard from '../../components/ui/StatsCard'

const AnalyticsPage = () => {
  const { isDark } = useTheme()
  const { role } = useAuth()
  const [loading, setLoading] = useState(true)
  const [batchStats, setBatchStats] = useState([])
  const [topStudents, setTopStudents] = useState([])
  const [weakStudents, setWeakStudents] = useState([])
  const [overallStats, setOverallStats] = useState({ totalStudents: 0, avgAttendance: 0, totalTests: 0, avgScore: 0 })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch batches with student counts
      const { data: batches } = await supabase
        .from('batches')
        .select('id, name, subject')

      // Fetch all attendance records
      const { data: attendance } = await supabase
        .from('attendance')
        .select('batch_id, status')

      // Fetch all results with test info
      const { data: results } = await supabase
        .from('results')
        .select('student_id, marks, tests(total_marks, batch_id)')

      // Fetch students
      const { data: students } = await supabase
        .from('students')
        .select('id, name, batch_id')

      // Fetch test count
      const { count: testCount } = await supabase
        .from('tests')
        .select('id', { count: 'exact', head: true })

      const batchList = batches || []
      const attendanceList = attendance || []
      const resultsList = results || []
      const studentList = students || []

      // Per-batch analytics
      const batchAnalytics = batchList.map(batch => {
        const batchAttendance = attendanceList.filter(a => a.batch_id === batch.id)
        const present = batchAttendance.filter(a => a.status === 'present').length
        const total = batchAttendance.length
        const rate = total ? ((present / total) * 100).toFixed(1) : 0

        const batchStudents = studentList.filter(s => s.batch_id === batch.id)
        const batchResults = resultsList.filter(r => r.tests?.batch_id === batch.id)
        const avgMarks = batchResults.length
          ? (batchResults.reduce((s, r) => s + r.marks, 0) / batchResults.length).toFixed(1)
          : 0

        return {
          ...batch,
          studentCount: batchStudents.length,
          attendanceRate: rate,
          avgMarks,
          testsTaken: batchResults.length,
        }
      })

      // Top students (by average score)
      const studentScores = {}
      resultsList.forEach(r => {
        if (!studentScores[r.student_id]) {
          studentScores[r.student_id] = { totalMarks: 0, totalPossible: 0, count: 0 }
        }
        studentScores[r.student_id].totalMarks += r.marks
        studentScores[r.student_id].totalPossible += (r.tests?.total_marks || 100)
        studentScores[r.student_id].count += 1
      })

      const scoredStudents = Object.entries(studentScores).map(([sid, s]) => {
        const student = studentList.find(st => st.id === sid)
        return {
          id: sid,
          name: student?.name || 'Unknown',
          percentage: s.totalPossible ? ((s.totalMarks / s.totalPossible) * 100).toFixed(1) : 0,
          testsAttempted: s.count,
        }
      }).sort((a, b) => b.percentage - a.percentage)

      // Overall stats
      const totalAttendance = attendanceList.length
      const totalPresent = attendanceList.filter(a => a.status === 'present').length
      const avgAttendance = totalAttendance ? ((totalPresent / totalAttendance) * 100).toFixed(1) : 0
      const totalMarks = resultsList.reduce((s, r) => s + r.marks, 0)
      const totalPossible = resultsList.reduce((s, r) => s + (r.tests?.total_marks || 100), 0)
      const avgScore = totalPossible ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0

      setOverallStats({
        totalStudents: studentList.length,
        avgAttendance,
        totalTests: testCount || 0,
        avgScore,
      })
      setBatchStats(batchAnalytics)
      setTopStudents(scoredStudents.slice(0, 5))
      setWeakStudents(scoredStudents.filter(s => parseFloat(s.percentage) < 40).slice(0, 5))
    } catch (err) {
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--color-purple)]/30 border-t-[var(--color-purple)] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          {role === 'master_admin' ? 'System Analytics' : 'Institute Analytics'}
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
          Comprehensive performance and engagement metrics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={overallStats.totalStudents} icon={Users} color="purple" />
        <StatsCard title="Avg Attendance" value={`${overallStats.avgAttendance}%`} icon={ClipboardCheck} color="green" />
        <StatsCard title="Tests Conducted" value={overallStats.totalTests} icon={BarChart3} color="blue" />
        <StatsCard title="Avg Score" value={`${overallStats.avgScore}%`} icon={TrendingUp} color="cyan" />
      </div>

      {/* Batch Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-[var(--color-purple)]/10 text-[var(--color-purple)]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Batch Performance</h2>
        </div>
        {batchStats.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-sm py-4 text-center">No batches found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Batch</th>
                  <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Subject</th>
                  <th className="text-center py-3 px-4 font-semibold text-[var(--text-secondary)]">Students</th>
                  <th className="text-center py-3 px-4 font-semibold text-[var(--text-secondary)]">Attendance</th>
                  <th className="text-center py-3 px-4 font-semibold text-[var(--text-secondary)]">Avg Marks</th>
                </tr>
              </thead>
              <tbody>
                {batchStats.map(batch => (
                  <tr key={batch.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-app)] transition-colors">
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{batch.name}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{batch.subject || '—'}</td>
                    <td className="py-3 px-4 text-center text-[var(--text-primary)] font-semibold">{batch.studentCount}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        parseFloat(batch.attendanceRate) >= 80
                          ? 'bg-green-500/10 text-green-500'
                          : parseFloat(batch.attendanceRate) >= 60
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-red-500/10 text-red-500'
                      }`}>
                        {batch.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-[var(--text-primary)] font-semibold">{batch.avgMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Top Performers</h2>
          </div>
          {topStudents.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm py-4 text-center">No results data yet</p>
          ) : (
            <div className="space-y-3">
              {topStudents.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                      i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                      i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-[var(--border-strong)]'
                    }`}>
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{s.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{s.testsAttempted} tests</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-500">{s.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Weak Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Needs Attention</h2>
          </div>
          {weakStudents.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm py-4 text-center">No weak students detected 🎉</p>
          ) : (
            <div className="space-y-3">
              {weakStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-red-500/10 bg-red-500/5">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{s.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{s.testsAttempted} tests attempted</p>
                  </div>
                  <span className="text-sm font-bold text-red-500">{s.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyticsPage

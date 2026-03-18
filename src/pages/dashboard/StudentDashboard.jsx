import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, ClipboardCheck, TrendingUp } from 'lucide-react'
import StatsCard from '../../components/ui/StatsCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'

const StudentDashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [studentRecord, setStudentRecord] = useState(null)
  const [stats, setStats] = useState({ tests: 0, avgScore: 0, attendanceRate: 0, rank: '-' })
  const [recentResults, setRecentResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get student record
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('profile_id', user.id)
        const student = students?.[0]
        setStudentRecord(student)

        if (!student) { setLoading(false); return }

        // Get results
        const { data: results } = await supabase
          .from('results')
          .select('*, tests(title, total_marks, date)')
          .eq('student_id', student.id)
          .order('created_at', { ascending: false })

        const resultList = results || []
        const totalMarks = resultList.reduce((s, r) => s + r.marks, 0)
        const totalPossible = resultList.reduce((s, r) => s + (r.tests?.total_marks || 100), 0)
        const avgScore = totalPossible ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0

        // Get attendance
        const { data: attendance } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', student.id)
        const totalA = attendance?.length || 0
        const presentA = attendance?.filter((a) => a.status === 'present').length || 0
        const attendanceRate = totalA ? ((presentA / totalA) * 100).toFixed(1) : 0

        setStats({
          tests: resultList.length,
          avgScore,
          attendanceRate,
          rank: resultList[0]?.rank || '-',
        })
        setRecentResults(resultList.slice(0, 5))
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!studentRecord) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No student profile found.</p>
        <p className="text-gray-600 text-sm mt-2">Please contact your admin to link your account.</p>
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
          Welcome, {studentRecord.name}
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">Your academic performance and progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Tests Taken" value={stats.tests} icon={BookOpen} color="purple" />
        <StatsCard title="Avg Score" value={`${stats.avgScore}%`} icon={TrendingUp} color="blue" />
        <StatsCard title="Attendance" value={`${stats.attendanceRate}%`} icon={ClipboardCheck} color="green" />
        <StatsCard title="Last Rank" value={`#${stats.rank}`} icon={Trophy} color="amber" />
      </div>

      {/* Recent Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-[var(--color-blue)]/10 text-[var(--color-blue)]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Test Results</h2>
        </div>
        {recentResults.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No test results yet</p>
        ) : (
          <div className="space-y-3">
            {recentResults.map((r) => (
              <div 
                key={r.id} 
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] transition-all group"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-blue)] transition-colors">{r.tests?.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                    {r.tests?.date ? new Date(r.tests.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {r.marks} <span className="opacity-40 font-normal">/</span> {r.tests?.total_marks}
                  </p>
                  {r.rank && <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-0.5">Rank #{r.rank}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default StudentDashboard

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Layers, ClipboardCheck, FileText, Users } from 'lucide-react'
import StatsCard from '../../components/ui/StatsCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'

const TeacherDashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [batches, setBatches] = useState([])
  const [stats, setStats] = useState({ batches: 0, students: 0, tests: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: myBatches } = await supabase
          .from('batches')
          .select('*, students(id)')
          .eq('teacher_id', user.id)

        const batchList = myBatches || []
        const batchIds = batchList.map((b) => b.id)

        let testCount = 0
        if (batchIds.length > 0) {
          const { count } = await supabase
            .from('tests')
            .select('id', { count: 'exact', head: true })
            .in('batch_id', batchIds)
          testCount = count || 0
        }

        const totalStudents = batchList.reduce((sum, b) => sum + (b.students?.length || 0), 0)

        setStats({
          batches: batchList.length,
          students: totalStudents,
          tests: testCount,
        })
        setBatches(batchList)
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

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="My Batches" value={stats.batches} icon={Layers} color="purple" />
        <StatsCard title="Total Students" value={stats.students} icon={Users} color="blue" />
        <StatsCard title="Tests Created" value={stats.tests} icon={FileText} color="cyan" />
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
    </div>
  )
}

export default TeacherDashboard

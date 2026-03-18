import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Layers, ShieldAlert, TrendingUp, Activity } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import StatsCard from '../../components/ui/StatsCard'

const MasterAdminDashboard = () => {
  const { isDark } = useTheme()
  const [stats, setStats] = useState({
    institutes: 0,
    totalUsers: 0,
    activeAdmins: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGlobalStats()
  }, [])

  const fetchGlobalStats = async () => {
    try {
      // Fetch Institutes count
      const { count: instCount } = await supabase
        .from('institutes')
        .select('*', { count: 'exact', head: true })

      // Fetch Total Users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch Admins count
      const { count: adminCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')

      setStats({
        institutes: instCount || 0,
        totalUsers: usersCount || 0,
        activeAdmins: adminCount || 0,
      })
    } catch (error) {
      console.error('Error fetching global stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
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
          Master Dashboard
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">Global statistics and system health for IntelliX</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Institutes"
          value={stats.institutes}
          icon={Layers}
          color="purple"
        />
        <StatsCard
          title="Platform Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Admins"
          value={stats.activeAdmins}
          icon={ShieldAlert}
          color="amber"
        />
        <StatsCard
          title="System Status"
          value="Healthy"
          icon={TrendingUp}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[var(--color-purple)]/10 text-[var(--color-purple)]">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Platform Activity</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-app)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
              <Activity className="w-6 h-6 text-[var(--text-secondary)] opacity-20" />
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-medium">
              Detailed activity logs will appear here soon.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MasterAdminDashboard

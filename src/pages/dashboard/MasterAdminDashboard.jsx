import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Layers, ShieldAlert, TrendingUp, Activity } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import StatsCard from '../../components/ui/StatsCard'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

const MasterAdminDashboard = () => {
  const { isDark } = useTheme()
  const { data: stats, loading } = useAppQuery('master-admin-dashboard', async () => {
    // Fetch Institutes count
    const { count: instCount } = await supabase
      .from('institutes')
      .select('id', { count: 'exact', head: true })

    // Fetch Total Users count
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    // Fetch Admins count
    const { count: adminCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')

    return {
      institutes: instCount || 0,
      totalUsers: usersCount || 0,
      activeAdmins: adminCount || 0,
    }
  })

  if (loading && !stats) return <DashboardSkeleton />

  const { institutes, totalUsers, activeAdmins } = stats || { institutes: 0, totalUsers: 0, activeAdmins: 0 }

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
          value={institutes}
          icon={Layers}
          color="neutral"
        />
        <StatsCard
          title="Platform Users"
          value={totalUsers}
          icon={Users}
          color="neutral"
        />
        <StatsCard
          title="Active Admins"
          value={activeAdmins}
          icon={ShieldAlert}
          color="neutral"
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
          className={`rounded-[32px] border ${ isDark ? 'bg-black/40 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.4)]' 
              : 'bg-white/60 border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.03)]'
          } p-8 backdrop-blur-xl`}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/10 text-white border-white/20' : 'bg-slate-100 text-slate-700 border-slate-200'} border shadow-inner transition-colors`}>
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Recent Platform Activity</h2>
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

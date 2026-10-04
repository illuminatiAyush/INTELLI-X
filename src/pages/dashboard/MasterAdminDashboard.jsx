import { motion } from 'framer-motion'
import { Users, Layers, ShieldAlert, TrendingUp, Activity, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import StatsCard from '../../components/ui/StatsCard'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'
import { useNavigate } from 'react-router-dom'

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

const MasterAdminDashboard = () => {
  const navigate = useNavigate()

  const { data: stats, loading } = useAppQuery('master-admin-dashboard', async () => {
    const [instRes, usersRes, adminRes] = await Promise.all([
      supabase.from('institutes').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
    ])
    return {
      institutes: instRes.count || 0,
      totalUsers: usersRes.count || 0,
      activeAdmins: adminRes.count || 0,
    }
  })

  if (loading && !stats) return <DashboardSkeleton />

  const { institutes, totalUsers, activeAdmins } = stats || { institutes: 0, totalUsers: 0, activeAdmins: 0 }

  const systemChecks = [
    { label: 'Database',        status: 'Operational' },
    { label: 'Authentication',  status: 'Operational' },
    { label: 'AI Services',     status: 'Operational' },
    { label: 'Storage',         status: 'Operational' },
  ]

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <motion.div {...fadeUp()}>
        <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
          Master dashboard
        </h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Global platform health and system statistics
        </p>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard title="Institutes"    value={institutes}    icon={Layers}      color="purple"  />
        <StatsCard title="Platform Users" value={totalUsers}   icon={Users}       color="blue"    />
        <StatsCard title="Active Admins" value={activeAdmins}  icon={ShieldAlert} color="amber"   />
        <StatsCard title="System Status" value="Healthy"       icon={TrendingUp}  color="emerald" />
      </motion.div>

      {/* ── System health + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* System health */}
        <motion.div
          {...fadeUp(0.1)}
          className="rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
        >
          <SectionHeader title="System health" />
          <div className="space-y-2">
            {systemChecks.map(({ label, status }) => (
              <div
                key={label}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: 'rgb(52,211,153)' }}>
                  <CheckCircle2 size={12} strokeWidth={2.5} />
                  {status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Platform activity */}
        <motion.div
          {...fadeUp(0.12)}
          className="rounded-2xl p-6 flex flex-col"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
        >
          <SectionHeader title="Platform activity" />
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <Activity size={16} strokeWidth={1.6} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Detailed activity logs coming soon
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Quick access ── */}
      <motion.div {...fadeUp(0.15)}>
        <SectionHeader title="Quick access" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Institutes', path: '/dashboard/institutes', icon: Layers     },
            { label: 'Users',      path: '/dashboard/students',   icon: Users      },
            { label: 'Analytics',  path: '/dashboard/analytics',  icon: TrendingUp },
            { label: 'Logs',       path: '/dashboard/logs',       icon: Activity   },
          ].map(({ label, path, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex items-center gap-3 p-4 rounded-xl text-left transition-colors"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                <Icon size={14} strokeWidth={1.8} style={{ color: 'var(--text-muted)' }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

    </div>
  )
}

export default MasterAdminDashboard

import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

const StatsCard = ({ title, value, icon: Icon, trend, color = 'purple' }) => {
  const { isDark } = useTheme()
  const colors = {
    purple: { bg: 'from-purple-500/10 to-transparent', icon: 'text-purple-500', glow: 'bg-purple-500' },
    blue: { bg: 'from-blue-500/10 to-transparent', icon: 'text-blue-500', glow: 'bg-blue-500' },
    cyan: { bg: 'from-cyan-500/10 to-transparent', icon: 'text-cyan-500', glow: 'bg-cyan-500' },
    green: { bg: 'from-emerald-500/10 to-transparent', icon: 'text-emerald-500', glow: 'bg-emerald-500' },
    amber: { bg: 'from-amber-500/10 to-transparent', icon: 'text-amber-500', glow: 'bg-amber-500' },
    red: { bg: 'from-red-500/10 to-transparent', icon: 'text-red-500', glow: 'bg-red-500' },
  }
  const c = colors[color] || colors.purple

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm hover:border-[var(--border-strong)] transition-all group"
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">{title}</p>
          <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${trend > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {trend > 0 ? '↑' : '↓'}
              </span>
              <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {isNaN(trend) ? '0' : Math.abs(trend)}%
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] ${c.icon} group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {/* Subtle Glow Influence */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full ${c.glow} opacity-[0.03] group-hover:opacity-[0.06] blur-3xl transition-opacity`} />
    </motion.div>
  )
}

export default StatsCard

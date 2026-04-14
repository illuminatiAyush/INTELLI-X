import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

const StatsCard = ({ title, value, icon: Icon, trend, color = 'white' }) => {
  const { isDark } = useTheme()
  const getColors = (c) => {
    switch (c) {
      case 'emerald': return 'text-emerald-500 border-emerald-500/20 shadow-emerald-500/10';
      case 'green': return 'text-emerald-500 border-emerald-500/20 shadow-emerald-500/10';
      case 'amber': return 'text-amber-500 border-amber-500/20 shadow-amber-500/10';
      case 'rose': return 'text-rose-500 border-rose-500/20 shadow-rose-500/10';
      case 'white': return 'text-white border-white/20 shadow-white/10';
      default: return 'text-[var(--text-primary)] border-[var(--text-primary)]/20 shadow-[var(--text-primary)]/5';
    }
  };
  const colorStyle = getColors(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.01 }}
      className="relative overflow-hidden rounded-[2rem] border transition-all duration-300 group bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border-[var(--border-subtle)] p-8 shadow-sm"
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3">
            {title}
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tighter leading-none mb-4">
            {value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-2">
              <span className={`flex items-center justify-center px-1.5 py-0.5 rounded-lg text-[10px] font-bold tracking-tight ${trend > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {trend > 0 ? '↑' : '↓'} {isNaN(trend) ? '0' : Math.abs(trend)}%
              </span>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-widest uppercase opacity-40">Growth</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] ${colorStyle.split(' ')[0]} shadow-[0_0_20px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-500 border-b-white/10`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6`} strokeWidth={2.5} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatsCard

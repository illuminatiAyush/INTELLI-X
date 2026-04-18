import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import IconWrapper from './IconWrapper'

const StatsCard = ({ title, value, icon: Icon, trend, color = 'white' }) => {
  const { isDark } = useTheme()
  const getColors = (c) => {
    switch (c) {
      case 'emerald': 
      case 'green': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'amber': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'rose': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'blue': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'purple': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'indigo': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      case 'cyan': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      case 'white': return isDark ? 'text-white bg-white/10 border-white/20' : 'text-slate-800 bg-slate-100 border-slate-200';
      default: return 'text-[var(--text-primary)] bg-[var(--text-primary)]/5 border-[var(--border-subtle)]';
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
          <IconWrapper 
            icon={Icon} 
            colorOverride={true}
            className={`${colorStyle} shadow-sm group-hover:scale-110 transition-transform duration-500`}
            wrapperSize={56}
            iconSize={24}
          />
        )}
      </div>
    </motion.div>
  )
}

export default StatsCard

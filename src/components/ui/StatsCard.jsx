import { motion } from 'framer-motion'

/* color → tailwind classes map with rich, refined background tints that pop in both light and dark modes */
const colorMap = {
  blue: {
    bg: 'bg-blue-50/70 dark:bg-blue-950/30',
    border: 'border-blue-200/80 dark:border-blue-800/40',
    icon: 'bg-blue-600 text-white dark:bg-blue-500',
    glow: 'from-blue-500/10 to-transparent',
    accentText: 'text-blue-700 dark:text-blue-300'
  },
  emerald: {
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    border: 'border-emerald-200/80 dark:border-emerald-800/40',
    icon: 'bg-emerald-600 text-white dark:bg-emerald-500',
    glow: 'from-emerald-500/10 to-transparent',
    accentText: 'text-emerald-700 dark:text-emerald-300'
  },
  amber: {
    bg: 'bg-amber-50/70 dark:bg-amber-950/30',
    border: 'border-amber-200/80 dark:border-amber-800/40',
    icon: 'bg-amber-600 text-white dark:bg-amber-500',
    glow: 'from-amber-500/10 to-transparent',
    accentText: 'text-amber-700 dark:text-amber-300'
  },
  purple: {
    bg: 'bg-purple-50/70 dark:bg-purple-950/30',
    border: 'border-purple-200/80 dark:border-purple-800/40',
    icon: 'bg-purple-600 text-white dark:bg-purple-500',
    glow: 'from-purple-500/10 to-transparent',
    accentText: 'text-purple-700 dark:text-purple-300'
  },
  indigo: {
    bg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
    border: 'border-indigo-200/80 dark:border-indigo-800/40',
    icon: 'bg-indigo-600 text-white dark:bg-indigo-500',
    glow: 'from-indigo-500/10 to-transparent',
    accentText: 'text-indigo-700 dark:text-indigo-300'
  },
  rose: {
    bg: 'bg-rose-50/70 dark:bg-rose-950/30',
    border: 'border-rose-200/80 dark:border-rose-800/40',
    icon: 'bg-rose-600 text-white dark:bg-rose-500',
    glow: 'from-rose-500/10 to-transparent',
    accentText: 'text-rose-700 dark:text-rose-300'
  },
  green: {
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    border: 'border-emerald-200/80 dark:border-emerald-800/40',
    icon: 'bg-emerald-600 text-white dark:bg-emerald-500',
    glow: 'from-emerald-500/10 to-transparent',
    accentText: 'text-emerald-700 dark:text-emerald-300'
  },
  cyan: {
    bg: 'bg-cyan-50/70 dark:bg-cyan-950/30',
    border: 'border-cyan-200/80 dark:border-cyan-800/40',
    icon: 'bg-cyan-600 text-white dark:bg-cyan-500',
    glow: 'from-cyan-500/10 to-transparent',
    accentText: 'text-cyan-700 dark:text-cyan-300'
  },
  neutral: {
    bg: 'bg-indigo-50/60 dark:bg-indigo-950/30',
    border: 'border-indigo-200/70 dark:border-indigo-800/40',
    icon: 'bg-indigo-600 text-white dark:bg-indigo-500',
    glow: 'from-indigo-500/10 to-transparent',
    accentText: 'text-indigo-700 dark:text-indigo-300'
  },
  default: {
    bg: 'bg-slate-50/70 dark:bg-zinc-900/60',
    border: 'border-slate-200 dark:border-zinc-800',
    icon: 'bg-slate-800 text-white dark:bg-zinc-700',
    glow: 'from-slate-500/5 to-transparent',
    accentText: 'text-slate-700 dark:text-zinc-300'
  }
}

const StatsCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const c = colorMap[color] || colorMap.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-md ${c.bg} ${c.border}`}
      style={{ minHeight: 115 }}
    >
      {/* Subtle top corner gradient accent */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${c.glow} pointer-events-none blur-lg`} />

      {/* Top row: label + icon */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <p className={`text-[11px] font-bold uppercase tracking-wider ${c.accentText} leading-none`}>
          {title}
        </p>

        {Icon && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${c.icon}`}>
            <Icon size={15} strokeWidth={2.2} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3 relative z-10">
        <p className="text-2xl lg:text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none tabular-nums">
          {value}
        </p>

        {trend !== undefined && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                trend > 0
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
              }`}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(isNaN(trend) ? 0 : trend)}%
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              vs last week
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatsCard

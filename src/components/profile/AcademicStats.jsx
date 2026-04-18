import { motion } from 'framer-motion'
import { ClipboardCheck, TrendingUp, Trophy } from 'lucide-react'

const statConfig = [
  { key: 'attendance', label: 'Attendance', icon: ClipboardCheck, color: 'green', suffix: '%' },
  { key: 'avgScore', label: 'Avg Test Score', icon: TrendingUp, color: 'blue', suffix: '%' },
  { key: 'rank', label: 'Rank in Batch', icon: Trophy, color: 'amber', prefix: '#' },
]

const colorMap = {
  green: {
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-500',
    glow: 'bg-emerald-500',
  },
  blue: {
    iconBg: 'bg-[var(--border-subtle)]',
    iconText: 'text-[var(--text-primary)]',
    glow: 'bg-[var(--border-strong)]',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-500',
    glow: 'bg-amber-500',
  },
}

const Skeleton = () => (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-[var(--border-subtle)]" />
        <div className="h-8 w-16 rounded bg-[var(--border-subtle)]" />
      </div>
      <div className="h-11 w-11 rounded-xl bg-[var(--border-subtle)]" />
    </div>
  </div>
)

const AcademicStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statConfig.map((s, idx) => {
        const c = colorMap[s.color]
        const value = stats?.[s.key] ?? '—'
        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm hover:border-[var(--border-strong)] transition-all group"
          >
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {s.label}
                </p>
                <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                  {s.prefix || ''}{value}{s.suffix || ''}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] ${c.iconText} group-hover:scale-110 transition-transform`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--border-subtle)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        )
      })}
    </div>
  )
}

export default AcademicStats

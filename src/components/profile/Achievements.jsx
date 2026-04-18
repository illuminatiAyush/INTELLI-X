import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Zap } from 'lucide-react'

const badges = [
  {
    id: 'top-performer',
    title: 'Top Performer',
    description: 'Ranked in the top 10% of your batch',
    icon: Trophy,
    color: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-500',
      glow: 'shadow-amber-500/10',
    },
  },
  {
    id: 'consistent',
    title: 'Consistent Student',
    description: 'Maintained above-average scores for 5+ tests',
    icon: TrendingUp,
    color: {
      bg: 'bg-[var(--border-subtle)]',
      border: 'border-[var(--border-strong)]',
      text: 'text-[var(--text-primary)]',
      glow: 'shadow-sm',
    },
  },
  {
    id: 'improving',
    title: 'Improving',
    description: 'Score improved in 3 consecutive tests',
    icon: Zap,
    color: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-500',
      glow: 'shadow-emerald-500/10',
    },
  },
]

const Achievements = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
          <Trophy className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Achievements</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {badges.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + idx * 0.08 }}
            className={`relative overflow-hidden rounded-2xl border ${badge.color.border} ${badge.color.bg} p-5 shadow-lg ${badge.color.glow} hover:scale-[1.02] transition-transform`}
          >
            <div className={`inline-flex p-3 rounded-xl ${badge.color.bg} ${badge.color.text} mb-3`}>
              <badge.icon className="w-6 h-6" />
            </div>
            <h4 className={`text-sm font-bold ${badge.color.text} mb-1`}>{badge.title}</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{badge.description}</p>

            {/* Decorative glow */}
            <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full ${badge.color.text.replace('text-', 'bg-')} opacity-[0.04] blur-2xl`} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Achievements

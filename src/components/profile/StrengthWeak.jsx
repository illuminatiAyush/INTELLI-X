import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'

const SubjectCard = ({ label, subject, isStrength }) => {
  const accent = isStrength
    ? { text: 'text-emerald-500', bg: 'bg-emerald-500', barBg: 'bg-emerald-500/20', iconBg: 'bg-emerald-500/10' }
    : { text: 'text-amber-500', bg: 'bg-amber-500', barBg: 'bg-amber-500/20', iconBg: 'bg-amber-500/10' }
  const Icon = isStrength ? ArrowUp : ArrowDown

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm hover:border-[var(--border-strong)] transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${accent.iconBg} ${accent.text}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{label}</span>
      </div>

      <p className="text-xl font-bold text-[var(--text-primary)] mb-1">{subject.name}</p>
      <p className={`text-sm font-semibold ${accent.text} mb-3`}>{subject.avg}%</p>

      {/* Progress bar */}
      <div className={`w-full h-2 rounded-full ${accent.barBg}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${subject.avg}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${accent.bg}`}
        />
      </div>
    </div>
  )
}

const Skeleton = () => (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 animate-pulse">
    <div className="h-4 w-28 rounded bg-[var(--border-subtle)] mb-4" />
    <div className="h-6 w-20 rounded bg-[var(--border-subtle)] mb-2" />
    <div className="h-3 w-12 rounded bg-[var(--border-subtle)] mb-3" />
    <div className="h-2 w-full rounded-full bg-[var(--border-subtle)]" />
  </div>
)

const StrengthWeak = ({ subjects, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton />
        <Skeleton />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      <SubjectCard label="Strongest Subject" subject={subjects.strong} isStrength />
      <SubjectCard label="Weakest Subject" subject={subjects.weak} isStrength={false} />
    </motion.div>
  )
}

export default StrengthWeak

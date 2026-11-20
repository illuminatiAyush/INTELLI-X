import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'

const SubjectCard = ({ label, subject, isStrength }) => {
  const accent = isStrength
    ? { 
        text: 'text-emerald-500', 
        bg: 'bg-emerald-500', 
        barBg: 'bg-emerald-500/20', 
        iconBg: 'bg-emerald-500/10',
        card: 'border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-white via-white to-emerald-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-700'
      }
    : { 
        text: 'text-amber-500', 
        bg: 'bg-amber-500', 
        barBg: 'bg-amber-500/20', 
        iconBg: 'bg-amber-500/10',
        card: 'border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-white via-white to-amber-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20 hover:border-amber-300 dark:hover:border-amber-700'
      }
  const Icon = isStrength ? ArrowUp : ArrowDown

  return (
    <div className={`rounded-2xl border p-6 transition-all shadow-xs ${accent.card}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${accent.iconBg} ${accent.text}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">{label}</span>
      </div>

      <p className="text-xl font-bold text-gray-900 mb-1">{subject.name}</p>
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
  <div className="rounded-2xl border border-gray-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900 p-6 animate-pulse">
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

  if (!subjects || (!subjects.strong && !subjects.weak)) {
    return (
      <div className="rounded-2xl border border-teal-200/60 dark:border-teal-900/40 bg-gradient-to-br from-white via-white to-teal-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-teal-950/20 p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mx-auto mb-4 border border-teal-500/20">
          <ArrowUp className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">No Subject Insights Yet</h3>
        <p className="text-gray-600 text-xs font-medium max-w-[220px] mx-auto leading-relaxed">
          Complete your first few tests to see which subjects are your strengths and which need more focus.
        </p>
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
      {subjects.strong ? (
        <SubjectCard label="Strongest Subject" subject={subjects.strong} isStrength />
      ) : (
        <div className="rounded-2xl border border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 opacity-60">
          <p className="text-xs font-semibold text-gray-600 uppercase">Strongest Subject</p>
          <p className="text-sm font-medium text-gray-900 mt-2">Insufficient data</p>
        </div>
      )}
      
      {subjects.weak ? (
        <SubjectCard label="Weakest Subject" subject={subjects.weak} isStrength={false} />
      ) : (
        <div className="rounded-2xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/20 p-6 opacity-60">
          <p className="text-xs font-semibold text-gray-600 uppercase">Weakest Subject</p>
          <p className="text-sm font-medium text-gray-900 mt-2">Insufficient data</p>
        </div>
      )}
    </motion.div>
  )
}

export default StrengthWeak


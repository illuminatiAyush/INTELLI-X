import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, TrendingUp, Trophy } from 'lucide-react'

const DEFAULTS = { score: 0, rank: '-' }

const GoalRow = ({ icon: Icon, label, current, target, setTarget, suffix = '', prefix = '' }) => {
  const progress = target ? Math.min(100, (current / target) * 100) : 0
  const isAhead = target && current >= target

  return (
    <div className="px-4 py-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)]">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{label}</span>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold mb-1">Current</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{prefix}{current}{suffix}</p>
        </div>
        <div className="text-[var(--text-secondary)] text-lg font-light">→</div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold mb-1">Target</p>
          <div className="flex items-center gap-1">
            <span className="text-[var(--text-secondary)] text-lg font-bold">{prefix}</span>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-20 bg-transparent text-2xl font-bold text-[var(--text-primary)] outline-none border-b-2 border-[var(--border-strong)] focus:border-[var(--text-primary)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={0}
            />
            <span className="text-[var(--text-primary)] text-lg font-bold">{suffix}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {target > 0 && (
        <div className="w-full h-1.5 rounded-full bg-[var(--border-subtle)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${isAhead ? 'bg-emerald-500' : 'bg-[var(--text-primary)]'}`}
          />
        </div>
      )}
    </div>
  )
}

const Goals = ({ currentStats }) => {
  const current = { ...DEFAULTS, ...currentStats }
  const [targetScore, setTargetScore] = useState(85)
  const [targetRank, setTargetRank] = useState(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-[var(--border-subtle)] text-[var(--text-primary)]">
          <Target className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Personal Goals</h3>
      </div>

      <div className="space-y-4">
        <GoalRow
          icon={TrendingUp}
          label="Target Score"
          current={current.score}
          target={targetScore}
          setTarget={setTargetScore}
          suffix="%"
        />
        <GoalRow
          icon={Trophy}
          label="Target Rank"
          current={current.rank}
          target={targetRank}
          setTarget={setTargetRank}
          prefix="#"
        />
      </div>
    </motion.div>
  )
}

export default Goals

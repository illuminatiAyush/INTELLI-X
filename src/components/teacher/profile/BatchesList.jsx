import { motion } from 'framer-motion'
import { Layers, Users } from 'lucide-react'

const Skeleton = () => (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 animate-pulse">
    <div className="h-5 w-36 rounded bg-[var(--border-subtle)] mb-6" />
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-14 rounded-xl bg-[var(--border-subtle)]" />
      ))}
    </div>
  </div>
)

const BatchesList = ({ batches, loading }) => {
  if (loading) return <Skeleton />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-white/10 text-white">
          <Layers className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Assigned Batches</h3>
        {batches && batches.length > 0 && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20">
            {batches.length}
          </span>
        )}
      </div>

      {!batches || batches.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--border-subtle)] flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6 text-[var(--text-secondary)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">No batches assigned yet</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Contact your admin to get assigned to batches.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {batches.map((batch, idx) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-white transition-colors truncate">
                    {batch.name}
                  </p>
                  {batch.subject && (
                    <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{batch.subject}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default BatchesList

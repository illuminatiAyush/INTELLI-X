import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'

const Skeleton = () => (
  <div className="dashboard-card animate-pulse">
    <div className="h-5 w-36 rounded bg-gray-100 mb-6" />
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-14 rounded-xl bg-gray-100" />
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
      className="dashboard-card"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
          <Layers className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Assigned Batches</h3>
        {batches && batches.length > 0 && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
            {batches.length}
          </span>
        )}
      </div>

      {!batches || batches.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No batches assigned yet</p>
          <p className="text-xs text-gray-400 mt-1">Contact your admin to get assigned to batches.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {batches.map((batch, idx) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {batch.name}
                  </p>
                  {batch.subject && (
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{batch.subject}</p>
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

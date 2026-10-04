import { motion } from 'framer-motion'

/* color → tailwind classes map */
const colorMap = {
  blue:    { icon: 'bg-blue-50 text-blue-600',    border: 'border-blue-100'  },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
  amber:   { icon: 'bg-amber-50 text-amber-600',  border: 'border-amber-100' },
  rose:    { icon: 'bg-rose-50 text-rose-600',    border: 'border-rose-100'  },
  purple:  { icon: 'bg-purple-50 text-purple-600',border: 'border-purple-100'},
  indigo:  { icon: 'bg-indigo-50 text-indigo-600',border: 'border-indigo-100'},
  cyan:    { icon: 'bg-cyan-50 text-cyan-600',    border: 'border-cyan-100'  },
  green:   { icon: 'bg-green-50 text-green-600',  border: 'border-green-100' },
  orange:  { icon: 'bg-orange-50 text-orange-600',border: 'border-orange-100'},
  yellow:  { icon: 'bg-yellow-50 text-yellow-600',border: 'border-yellow-100'},
  white:   { icon: 'bg-gray-100 text-gray-700',   border: 'border-gray-200'  },
  default: { icon: 'bg-gray-100 text-gray-600',   border: 'border-gray-200'  },
}

const StatsCard = ({ title, value, icon: Icon, trend, color = 'white' }) => {
  const c = colorMap[color] || colorMap.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between shadow-sm"
      style={{ minHeight: 110 }}
    >
      {/* top row: label + icon */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 leading-none">
          {title}
        </p>

        {Icon && (
          <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${c.icon}`}>
            <Icon size={13} strokeWidth={2} />
          </div>
        )}
      </div>

      {/* value */}
      <div className="mt-3">
        <p className="text-2xl font-black tracking-tighter text-gray-900 leading-none tabular-nums">
          {value}
        </p>

        {trend !== undefined && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                trend > 0
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-500'
              }`}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(isNaN(trend) ? 0 : trend)}%
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              vs last
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatsCard

import { motion } from 'framer-motion'

const StatsCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const getColors = (c) => {
    switch (c) {
      case 'success':
      case 'green':
      case 'emerald': 
        return 'text-green-600 bg-green-50';
      case 'warning':
      case 'amber': 
        return 'text-amber-600 bg-amber-50';
      case 'danger':
      case 'rose': 
      case 'red':
        return 'text-red-600 bg-red-50';
      case 'primary':
      case 'blue': 
      case 'indigo': 
        return 'text-blue-600 bg-blue-50';
      default: 
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  const colorStyle = getColors(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="academic-card hover:border-gray-300 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            {value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {trend > 0 ? '↑' : '↓'} {isNaN(trend) ? '0' : Math.abs(trend)}%
              </span>
              <span className="text-xs text-gray-500 font-medium">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorStyle}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatsCard

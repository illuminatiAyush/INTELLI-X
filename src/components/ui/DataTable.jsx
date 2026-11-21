import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const DataTable = ({ columns, data, onRowClick, emptyMessage = 'No data found' }) => {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...(data || [])].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = a[sortKey] ?? ''
    const bVal = b[sortKey] ?? ''
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="overflow-x-auto rounded-xl border border-dashboard-border bg-dashboard-card backdrop-blur-sm -webkit-overflow-scrolling-touch">
      <table className="w-full min-w-[620px] text-sm">
        <thead>
          <tr className="border-b border-dashboard-border bg-dashboard-border-light/60">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={`text-left px-3.5 sm:px-5 py-3 sm:py-3.5 text-xs font-semibold text-dashboard-text-secondary uppercase tracking-wider transition-colors ${col.sortable !== false ? 'cursor-pointer hover:text-dashboard-text select-none' : ''}`}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  {sortKey === col.key && (
                    <div className="text-dashboard-text">
                      {sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-16 text-dashboard-text-secondary font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <motion.tr
                key={row.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-dashboard-border/60 ${onRowClick ? 'cursor-pointer hover:bg-dashboard-border-light/50' : ''} transition-colors last:border-0`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3.5 sm:px-5 py-3 sm:py-4 text-dashboard-text font-medium text-xs sm:text-sm">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable

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
    <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/30 backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/50">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={`text-left px-5 py-3.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider transition-colors ${col.sortable !== false ? 'cursor-pointer hover:text-[var(--text-primary)] select-none' : ''}`}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  {sortKey === col.key && (
                    <div className="text-[var(--color-purple)]">
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
              <td colSpan={columns.length} className="text-center py-16 text-[var(--text-secondary)] font-medium">
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
                className={`border-b border-[var(--border-subtle)]/50 ${onRowClick ? 'cursor-pointer hover:bg-[var(--color-purple)]/5' : ''} transition-colors last:border-0`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4 text-[var(--text-primary)] font-medium">
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

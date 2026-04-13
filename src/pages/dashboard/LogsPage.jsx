import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Users, ClipboardCheck, BookOpen, Layers } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { CardSkeleton } from '../../components/ui/Skeletons'

const LogsPage = () => {
  const { isDark } = useTheme()
  const { data: logsData, loading: logsLoading } = useAppQuery('activity-logs', async () => {
    // Fetch recent activities from multiple tables
    const [studentsRes, testsRes, attendanceRes, materialsRes, batchesRes] = await Promise.all([
      supabase.from('students').select('id, name, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('tests').select('id, title, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('attendance').select('id, date, status, created_at, students(name)').order('created_at', { ascending: false }).limit(10),
      supabase.from('materials').select('id, title, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('batches').select('id, name, created_at').order('created_at', { ascending: false }).limit(10),
    ])

    const combined = []
    ;(studentsRes.data || []).forEach(s => {
      combined.push({ id: `student-${s.id}`, type: 'student', icon: Users, color: 'neutral', description: `Student "${s.name}" was added`, timestamp: s.created_at })
    })
    ;(testsRes.data || []).forEach(t => {
      combined.push({ id: `test-${t.id}`, type: 'test', icon: FileText, color: 'neutral', description: `Test "${t.title}" was created`, timestamp: t.created_at })
    })
    ;(attendanceRes.data || []).forEach(a => {
      combined.push({ id: `attendance-${a.id}`, type: 'attendance', icon: ClipboardCheck, color: a.status === 'present' ? 'green' : 'red', description: `${a.students?.name || 'Student'} marked ${a.status} on ${new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`, timestamp: a.created_at })
    })
    ;(materialsRes.data || []).forEach(m => {
      combined.push({ id: `material-${m.id}`, type: 'material', icon: BookOpen, color: 'neutral', description: `Material "${m.title}" was uploaded`, timestamp: m.created_at })
    })
    ;(batchesRes.data || []).forEach(b => {
      combined.push({ id: `batch-${b.id}`, type: 'batch', icon: Layers, color: 'neutral', description: `Batch "${b.name}" was created`, timestamp: b.created_at })
    })

    combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    return combined.slice(0, 30)
  })

  const loading = logsLoading && !logsData
  const logs = logsData || []


  const colorMap = {
    neutral: 'bg-white/10 text-white',
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-red-500/10 text-red-500',
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          Activity Logs
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
          Recent system activity across all modules
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
      >
        {logs.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-sm py-8 text-center">No activity recorded yet</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => {
              const Icon = log.icon
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[var(--bg-app)] transition-colors group"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[log.color] || colorMap.neutral}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] font-medium truncate">{log.description}</p>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap flex-shrink-0">
                    {new Date(log.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default LogsPage

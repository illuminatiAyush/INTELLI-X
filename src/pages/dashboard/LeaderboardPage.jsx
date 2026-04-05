import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, RefreshCw } from 'lucide-react'
import { Select } from '../../components/ui/FormField'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const LeaderboardPage = () => {
  const { user, role } = useAuth()
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        let query = supabase.from('batches').select('*').order('name')
        if (role === 'teacher') query = query.eq('teacher_id', user.id)
        if (role === 'student') {
          const { data: batchStudents } = await supabase
            .from('batch_students')
            .select('batch_id')
            .eq('student_id', user.id) // Corrected to use profile_id
          
          const batchIds = (batchStudents || []).map(bs => bs.batch_id)
          if (batchIds.length > 0) {
            query = query.in('id', batchIds)
          }
        }
        const { data } = await query
        setBatches(data || [])
        if (data?.length > 0) setSelectedBatch(data[0].id)
      } catch (err) {
        console.error('Error fetching batches:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBatches()
  }, [])

  const fetchLeaderboard = async () => {
    if (!selectedBatch) return
    setRefreshing(true)
    try {
      // Fetch results for the selected batch
      // Note: We join with students on profile_id (handled by the updated foreign key)
      const { data, error } = await supabase
        .from('results')
        .select('student_id, marks, students(name), tests(total_marks, batch_id)')
        .eq('tests.batch_id', selectedBatch)
        .order('marks', { ascending: false })
      
      if (error) throw error

      // Aggregate by student (student_id is now the profile_id)
      const map = {}
      ;(data || []).forEach((r) => {
        const sid = r.student_id
        if (!map[sid]) {
          map[sid] = { 
            student_id: sid, 
            name: r.students?.name || 'Unknown', 
            totalMarks: 0, 
            totalPossible: 0, 
            testCount: 0 
          }
        }
        map[sid].totalMarks += r.marks
        map[sid].totalPossible += r.tests?.total_marks || 100
        map[sid].testCount += 1
      })

      const sorted = Object.values(map)
        .map((s) => ({ 
          ...s, 
          percentage: s.totalPossible ? ((s.totalMarks / s.totalPossible) * 100).toFixed(1) : 0 
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .map((s, i) => ({ ...s, rank: i + 1 }))

      setLeaderboard(sorted)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load leaderboard')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedBatch) return
    setLoading(true)
    fetchLeaderboard()
  }, [selectedBatch])

  // Realtime subscription for live updates
  useEffect(() => {
    if (!selectedBatch) return

    const channel = supabase
      .channel('leaderboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'results' },
        () => {
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedBatch])

  const getRankStyle = (rank) => {
    if (rank === 1) return 'from-amber-500/20 to-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/10'
    if (rank === 2) return 'from-slate-400/20 to-slate-400/5 border-slate-400/30 shadow-lg shadow-slate-400/10'
    if (rank === 3) return 'from-orange-600/20 to-orange-600/5 border-orange-600/30 shadow-lg shadow-orange-600/10'
    return 'bg-[var(--bg-card)] border-[var(--border-subtle)]'
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <span className="text-3xl">🥇</span>
    if (rank === 2) return <span className="text-3xl">🥈</span>
    if (rank === 3) return <span className="text-3xl">🥉</span>
    return <span className="text-sm font-bold opacity-40">#{rank}</span>
  }

  const batchOptions = batches.map((b) => ({ value: b.id, label: b.name }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
          >
            Leaderboard
          </motion.h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">Batch rankings and top performers • Updates in real-time</p>
        </div>
        <button
          onClick={fetchLeaderboard}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="max-w-sm bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <Select label="Batch Filter" options={batchOptions} value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[var(--color-purple)]/20 border-t-[var(--color-purple)] rounded-full animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-surface)]/50 rounded-3xl border border-dashed border-[var(--border-subtle)]">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-20" />
          <p className="text-[var(--text-secondary)] font-medium text-lg">No results yet for this batch</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {leaderboard.map((entry, i) => (
            <motion.div
              key={entry.student_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center justify-between px-6 py-5 rounded-2xl border transition-all hover:scale-[1.01] bg-gradient-to-r ${getRankStyle(entry.rank)}`}
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <p className="text-base font-bold text-[var(--text-primary)]">{entry.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                    {entry.testCount} test{entry.testCount !== 1 ? 's' : ''} • {entry.totalMarks}/{entry.totalPossible} marks earned
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[var(--text-primary)]">{entry.percentage}%</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)]">avg score</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LeaderboardPage

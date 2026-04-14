import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, RefreshCw } from 'lucide-react'
import { Select } from '../../components/ui/FormField'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { useAppQuery } from '../../hooks/useAppQuery'
import { CardSkeleton } from '../../components/ui/Skeletons'

const LeaderboardPage = ({ hideHeader = false }) => {
  const { user, role } = useAuth()
  const { data: initialData, loading: initialLoading } = useAppQuery(`leaderboard-init-${role}-${user?.id}`, async () => {
    if (!user) return { batches: [] }
    let query = supabase.from('batches').select('id, name').order('name')
    if (role === 'teacher') query = query.eq('teacher_id', user.id)
    if (role === 'student') {
      const { data: batchStudents } = await supabase.from('batch_students').select('batch_id').eq('student_id', user.id)
      const batchIds = (batchStudents || []).map(bs => bs.batch_id)
      if (batchIds.length > 0) query = query.in('id', batchIds)
      else return { batches: [] }
    }
    const { data } = await query
    return { batches: data || [] }
  }, { enabled: !!user })

  useEffect(() => {
    if (initialData?.batches?.length > 0 && !selectedBatch) {
      setSelectedBatch(initialData.batches[0].id)
    }
  }, [initialData])

  const batches = initialData?.batches || []
  const isInitialLoading = initialLoading && !initialData
  const [selectedBatch, setSelectedBatch] = useState('')
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)


  useEffect(() => {
    const fetchTests = async () => {
      if (!selectedBatch) return
      try {
        const { data } = await supabase
          .from('tests')
          .select('id, title')
          .eq('batch_id', selectedBatch)
          .eq('status', 'published')
          .order('date', { ascending: false })
        
        setTests(data || [])
        if (data?.length > 0) setSelectedTest(data[0].id)
        else setSelectedTest('')
      } catch (err) {
        console.error('Error fetching tests:', err)
      }
    }
    fetchTests()
  }, [selectedBatch])

  const fetchLeaderboard = async () => {
    if (!selectedTest) {
      setLeaderboard([])
      return
    }
    setRefreshing(true)
    try {
      // PART 1 & 2: CORRECT QUERY LOGIC - Fetch all results for selected_test_id
      const { data, error } = await supabase
        .from('results')
        .select(`
          student_id, 
          marks, 
          students!inner(name, full_name, email), 
          tests!inner(total_marks)
        `)
        .eq('test_id', selectedTest)
      
      if (error) throw error

      // PART 3: SORT LEADERBOARD by marks DESC
      const sorted = (data || [])
        .map((r, i) => {
          // DEBUG SAFETY
          if (i === 0) console.log('Leaderboard Result Sample:', r);

          const studentName = r.students?.full_name || r.students?.name || 'Unknown';

          return {
            student_id: r.student_id,
            name: studentName,
            email: r.students?.email,
            totalMarks: r.marks,
            totalPossible: r.tests?.total_marks || 100,
            percentage: r.tests?.total_marks ? ((r.marks / r.tests.total_marks) * 100).toFixed(1) : 0
          }
        })
        .sort((a, b) => b.totalMarks - a.totalMarks)
        // PART 4: RANK CALCULATION
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
    if (!selectedTest) {
      setLeaderboard([])
      setLoading(false)
      return
    }
    setLoading(true)
    fetchLeaderboard()
  }, [selectedTest])

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

  const getRankStyle = (rank, isCurrentUser) => {
    if (isCurrentUser) return 'bg-white/5 border-white/30 shadow-md'
    if (rank === 1) return 'bg-[#0a0a0a] border-amber-500/30'
    if (rank === 2) return 'bg-[#0a0a0a] border-slate-400/30'
    if (rank === 3) return 'bg-[#0a0a0a] border-orange-600/30'
    return 'bg-[#0a0a0a] border-[var(--border-subtle)]'
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <span className="text-3xl">🥇</span>
    if (rank === 2) return <span className="text-3xl">🥈</span>
    if (rank === 3) return <span className="text-3xl">🥉</span>
    return <span className="text-sm font-bold opacity-40">#{rank}</span>
  }

  const batchOptions = batches.map((b) => ({ value: b.id, label: b.name }))
  const testOptions = tests.map((t) => ({ value: t.id, label: t.title }))

  return (
    <div className="space-y-8">
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/20 shadow-sm shadow-gold-500/5">
              <Trophy className="w-6 h-6" />
            </div>
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
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={refreshing || !selectedTest}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <Select label="Select Batch" options={batchOptions} value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} />
        </div>
        <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
          <Select 
            label="Select Test" 
            options={testOptions} 
            value={selectedTest} 
            onChange={(e) => setSelectedTest(e.target.value)} 
            disabled={!selectedBatch || tests.length === 0}
          />
        </div>
      </div>

      {!selectedBatch ? (
        <div className="text-center py-20 bg-[var(--bg-surface)]/50 rounded-3xl border border-dashed border-[var(--border-subtle)]">
          <p className="text-[var(--text-secondary)] font-medium">Please select a batch to view leaderboard</p>
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-surface)]/50 rounded-3xl border border-dashed border-[var(--border-subtle)]">
          <p className="text-[var(--text-secondary)] font-medium">No published tests found for this batch</p>
        </div>
      ) : (isInitialLoading || loading) ? (
        <div className="space-y-4 max-w-4xl">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-surface)]/50 rounded-3xl border border-dashed border-[var(--border-subtle)]">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-20" />
          <p className="text-[var(--text-secondary)] font-medium text-lg">No attempts yet for this test</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {leaderboard.map((entry, i) => {
            const isCurrentUser = entry.student_id === user.id
            return (
              <motion.div
                key={entry.student_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between px-6 py-5 rounded-2xl border transition-all hover:scale-[1.01] ${getRankStyle(entry.rank, isCurrentUser)}`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-[var(--text-primary)]">{entry.name}</p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-bold text-black uppercase tracking-wider">You</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                      Scored {entry.totalMarks} out of {entry.totalPossible}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[var(--text-primary)]">{entry.percentage}%</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)]">score</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LeaderboardPage

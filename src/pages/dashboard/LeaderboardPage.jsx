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
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState('')
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
            .eq('student_id', user.id)
          
          const batchIds = (batchStudents || []).map(bs => bs.batch_id)
          if (batchIds.length > 0) {
            query = query.in('id', batchIds)
          } else {
            setLoading(false)
            return
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
          students!inner(name, email), 
          tests!inner(total_marks)
        `)
        .eq('test_id', selectedTest)
      
      if (error) throw error

      // PART 3: SORT LEADERBOARD by marks DESC
      const sorted = (data || [])
        .map((r) => ({
          student_id: r.student_id,
          name: r.students?.name || 'Unknown',
          email: r.students?.email,
          totalMarks: r.marks,
          totalPossible: r.tests?.total_marks || 100,
          percentage: r.tests?.total_marks ? ((r.marks / r.tests.total_marks) * 100).toFixed(1) : 0
        }))
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
    if (isCurrentUser) return 'from-purple-500/30 to-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/20'
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
  const testOptions = tests.map((t) => ({ value: t.id, label: t.title }))

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
          disabled={refreshing || !selectedTest}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

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
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[var(--color-purple)]/20 border-t-[var(--color-purple)] rounded-full animate-spin" />
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
                className={`flex items-center justify-between px-6 py-5 rounded-2xl border transition-all hover:scale-[1.01] bg-gradient-to-r ${getRankStyle(entry.rank, isCurrentUser)}`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-[var(--text-primary)]">{entry.name}</p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500 text-[10px] font-bold text-white uppercase tracking-wider">You</span>
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

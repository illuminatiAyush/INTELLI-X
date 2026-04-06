import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, ClipboardCheck, TrendingUp, Sparkles, Play, Clock, Activity, Plus, Bell, X, Lock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import StatsCard from '../../components/ui/StatsCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'

const StudentDashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [studentRecord, setStudentRecord] = useState(null)
  const [stats, setStats] = useState({ tests: 0, avgScore: 0, attendanceRate: 0, rank: '-' })
  const [recentResults, setRecentResults] = useState([])
  const [activeTests, setActiveTests] = useState([])
  const [hasBatches, setHasBatches] = useState(true)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  const [enrolledBatches, setEnrolledBatches] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date()
      try {
        // Get student record
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('profile_id', user.id)
        const student = students?.[0]
        setStudentRecord(student)

        if (!student) { setLoading(false); return }

        // Check batches using profile_id (User UUID)
        const { data: batches } = await supabase.from('batch_students').select('batch_id').eq('student_id', user.id)
        if (!batches || batches.length === 0) {
          setHasBatches(false)
          setLoading(false)
          return
        }

        const batchIds = batches.map(b => b.batch_id)

        // Fetch full batch details for My Subjects display
        const { data: batchDetails } = await supabase
          .from('batches')
          .select('id, name, subject')
          .in('id', batchIds)
          .order('name')
        setEnrolledBatches(batchDetails || [])
        // Get results using profile_id (User UUID)
        const { data: results } = await supabase
          .from('results')
          .select('*, tests(title, total_marks, date)')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })

        const resultList = results || []
        const totalMarks = resultList.reduce((s, r) => s + r.marks, 0)
        const totalPossible = resultList.reduce((s, r) => s + (r.tests?.total_marks || 100), 0)
        const avgScore = totalPossible ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0

        // Get attendance using profile_id (User UUID)
        const { data: attendance } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', user.id)
        const totalA = attendance?.length || 0
        const presentA = attendance?.filter((a) => a.status === 'present').length || 0
        const attendanceRate = totalA ? ((presentA / totalA) * 100).toFixed(1) : 0

        setStats({
          tests: resultList.length,
          avgScore,
          attendanceRate,
          rank: resultList[0]?.rank || '-',
        })
        setRecentResults(resultList.slice(0, 5))
        
        // Prepare data for Recharts (chronological)
        const cData = resultList.slice(0, 10).reverse().map(r => ({
          name: r.tests?.title?.substring(0, 15) || 'Test',
          score: Math.round((r.marks / (r.tests?.total_marks || 100)) * 100),
          date: new Date(r.tests?.date || r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }))
        setChartData(cData)

        // Get AI tests (active + upcoming)
        const { data: testData } = await supabase
          .from('tests')
          .select('*, batches(name), questions(count)')
          .in('batch_id', batchIds)
          .order('date', { ascending: false })

        const resultTestIds = new Set(resultList.map(r => r.test_id))
        const activeOrUpcoming = (testData || [])
          .filter(t => t.id && !resultTestIds.has(t.id))
          .filter(t => {
            const isEnded = (t.end_time && new Date(t.end_time) < now) || false
            return !isEnded
          })
          .slice(0, 4)

        setActiveTests(activeOrUpcoming)

        // Get notifications
        const { data: notifies } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        
        setNotifications(notifies || [])
        setUnreadCount(notifies?.filter(n => !n.read).length || 0)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchData()
  }, [user])

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
      
      if (error) throw error
      
      // Update local state
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!studentRecord) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No student profile found.</p>
        <p className="text-gray-600 text-sm mt-2">Please contact your admin to link your account.</p>
      </div>
    )
  }

  if (!hasBatches) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 border border-dashed border-[var(--border-strong)] rounded-3xl bg-[var(--bg-surface)] mt-8"
      >
        <div className="w-20 h-20 bg-[var(--color-purple)]/10 text-[var(--color-purple)] rounded-3xl flex items-center justify-center mb-6 border border-[var(--color-purple)]/20 shadow-2xl shadow-purple-500/20">
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-3">Welcome to IntelliX!</h2>
        <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto mb-8 leading-relaxed">
          You are successfully registered but haven't joined any classes yet. Get your class Invite Link or Join Code from your teacher to begin exploring materials and tests.
        </p>
        <button 
          onClick={() => navigate('/dashboard/join')}
          className="glow-button px-8 py-4 rounded-xl text-white font-bold tracking-wide transition-all active:scale-95 flex items-center gap-2"
        >
          <BookOpen className="w-5 h-5"/>
          Join Your First Subject
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
          >
            Welcome, {studentRecord.name}
          </motion.h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">Your academic performance and progress</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-surface)]" />
              )}
            </motion.button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-gradient-to-r from-purple-500/5 to-cyan-500/5">
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Notifications</span>
                  <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-[var(--text-secondary)]" /></button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-[var(--text-secondary)] text-sm">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.read && markAsRead(n.id)}
                        className={`px-4 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-app)] transition-colors cursor-pointer ${!n.read ? 'bg-purple-500/5' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-bold text-[var(--text-primary)]">{n.title}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/join')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-purple)] text-white text-sm font-semibold shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
          >
            <BookOpen className="w-5 h-5" /> Join Subject
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Tests Taken" value={stats.tests} icon={BookOpen} color="purple" />
        <StatsCard title="Avg Score" value={`${stats.avgScore}%`} icon={TrendingUp} color="blue" />
        <StatsCard title="Attendance" value={`${stats.attendanceRate}%`} icon={ClipboardCheck} color="green" />
        <StatsCard title="Last Rank" value={`#${stats.rank}`} icon={Trophy} color="amber" />
      </div>

      {/* My Enrolled Batches (Subjects) */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">My Subjects</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {enrolledBatches.map((batch, i) => (
            <motion.div
              key={batch.id}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-6 rounded-[2rem] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-500/30 transition-all cursor-pointer group"
              onClick={() => navigate('/dashboard/materials')}
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-1 truncate">{batch.name}</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">
                {batch.subject || 'Subject'}
              </p>
            </motion.div>
          ))}

          {/* Join More card */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-[2rem] bg-[var(--bg-app)] border border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center text-center group cursor-pointer hover:border-purple-500/50 transition-all"
            onClick={() => navigate('/dashboard/join')}
          >
            <div className="w-12 h-12 rounded-full bg-[var(--border-subtle)]/20 flex items-center justify-center mb-3 group-hover:bg-purple-500/10 transition-all">
              <Plus className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-purple-400" />
            </div>
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Join More</p>
          </motion.div>
        </div>
      </section>

      {/* Active AI Tests */}
      {activeTests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Active AI Tests</h2>
            </div>
            <button
              onClick={() => navigate('/dashboard/active-tests')}
              className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeTests.map((test) => {
              const isLocked = test.start_time && new Date(test.start_time) > new Date()
              return (
                <div
                  key={test.id}
                  className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all group cursor-pointer ${
                    isLocked 
                      ? 'border-[var(--border-subtle)]/50 bg-[var(--bg-app)] opacity-60' 
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-purple-500/30'
                  }`}
                  onClick={() => !isLocked && navigate(`/dashboard/test-attempt/${test.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${isLocked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] group-hover:text-purple-400'} transition-colors`}>{test.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {isLocked ? (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded">
                          <Clock className="w-2.5 h-2.5" /> Scheduled
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--text-secondary)]">Live Now</span>
                      )}
                      {test.duration_minutes && (
                        <span className="flex items-center gap-0.5 text-xs text-[var(--text-secondary)]">
                          <Clock className="w-3 h-3" /> {test.duration_minutes}m
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`ml-3 p-2 rounded-lg transition-all ${
                    isLocked 
                      ? 'bg-[var(--border-subtle)]/10 text-[var(--text-secondary)]' 
                      : 'bg-green-500/10 text-green-400 group-hover:bg-purple-500/10 group-hover:text-purple-400'
                  }`}>
                    {isLocked ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Performance & Recent Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm overflow-hidden flex flex-col h-[400px]"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Performance Timeline</h2>
          </div>
          
          {chartData.length < 2 ? (
            <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)] text-sm font-medium border border-dashed border-[var(--border-subtle)] rounded-xl m-2 bg-[var(--bg-app)]">
              More test data needed for trend tracking.
            </div>
          ) : (
            <div className="flex-1 w-full h-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} domain={[0, 100]} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.5} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)', borderRadius: '12px', color: 'var(--text-primary)' }}
                    itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Score %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Recent Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm flex flex-col h-[400px]"
        >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-[var(--color-blue)]/10 text-[var(--color-blue)]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Test Results</h2>
        </div>
        {recentResults.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No test results yet</p>
        ) : (
          <div className="space-y-3">
            {recentResults.map((r) => (
              <div 
                key={r.id} 
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] transition-all group"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-blue)] transition-colors">{r.tests?.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                    {r.tests?.date ? new Date(r.tests.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {r.marks} <span className="opacity-40 font-normal">/</span> {r.tests?.total_marks}
                  </p>
                  {r.rank && <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-0.5">Rank #{r.rank}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        </motion.div>
      </div>
    </div>
  )
}

export default StudentDashboard

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, ClipboardCheck, TrendingUp, Sparkles, Play, Clock, Activity, Plus, Bell, X, Lock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import StatsCard from '../../components/ui/StatsCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

const StudentDashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const { data: studentData, loading } = useAppQuery(`student-dashboard-${user?.id}`, async () => {
    if (!user) return null
    const now = new Date()
    
    // Get student record
    const { data: students } = await supabase
      .from('students')
      .select('id, name, profile_id')
      .eq('profile_id', user.id)
    const student = students?.[0]
    
    if (!student) return { studentRecord: null }

    // Check batches using profile_id (User UUID)
    const { data: batches } = await supabase.from('batch_students').select('batch_id').eq('student_id', user.id)
    if (!batches || batches.length === 0) {
      return { studentRecord: student, hasBatches: false }
    }

    const batchIds = batches.map(b => b.batch_id)

    // Fetch full batch details
    const { data: batchDetails } = await supabase
      .from('batches')
      .select('id, name, subject')
      .in('id', batchIds)
      .order('name')

    // Get results
    const { data: results } = await supabase
      .from('results')
      .select('id, marks, test_id, created_at, rank, tests(id, title, total_marks, date)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    const resultList = results || []
    const totalMarks = resultList.reduce((s, r) => s + r.marks, 0)
    const totalPossible = resultList.reduce((s, r) => s + (r.tests?.total_marks || 100), 0)
    const avgScore = totalPossible ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0

    // Get attendance
    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', user.id)
    const totalA = attendance?.length || 0
    const presentA = attendance?.filter((a) => a.status === 'present').length || 0
    const attendanceRate = totalA ? ((presentA / totalA) * 100).toFixed(1) : 0

    // Get AI tests
    const { data: testData } = await supabase
      .from('tests')
      .select('id, title, date, start_time, end_time, duration_minutes, batch_id, batches(name)')
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

    // Chart Data
    const chartData = resultList.slice(0, 10).reverse().map(r => ({
      name: r.tests?.title?.substring(0, 15) || 'Test',
      score: Math.round((r.marks / (r.tests?.total_marks || 100)) * 100),
      date: new Date(r.tests?.date || r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }))

    // Get notifications
    const { data: notifies } = await supabase
      .from('notifications')
      .select('id, title, message, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return {
      studentRecord: student,
      hasBatches: true,
      stats: {
        tests: resultList.length,
        avgScore,
        attendanceRate,
        rank: resultList[0]?.rank || '-',
      },
      recentResults: resultList.slice(0, 5),
      activeTests: activeOrUpcoming,
      chartData,
      enrolledBatches: batchDetails || [],
      notifications: notifies || [],
      unreadCount: notifies?.filter(n => !n.read).length || 0
    }
  }, { enabled: !!user })

  useEffect(() => {
    if (studentData?.notifications) {
      setNotifications(studentData.notifications)
      setUnreadCount(studentData.unreadCount)
    }
  }, [studentData])

  const markAsRead = async (id) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading && !studentData) return <DashboardSkeleton />

  const {
    studentRecord,
    stats,
    recentResults,
    activeTests,
    hasBatches,
    chartData,
    enrolledBatches,
  } = studentData || {
    studentRecord: null,
    stats: { tests: 0, avgScore: 0, attendanceRate: 0, rank: '-' },
    recentResults: [],
    activeTests: [],
    hasBatches: true,
    chartData: [],
    enrolledBatches: [],
  }

  if (!studentRecord) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mb-4 text-[var(--text-secondary)]">
          <Activity className="w-8 h-8" />
        </div>
        <p className="text-[var(--text-primary)] font-semibold text-lg">No student profile found</p>
        <p className="text-[var(--text-secondary)] text-sm mt-1">Please contact your admin to link your account</p>
      </div>
    )
  }

  if (!hasBatches) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center p-12 border border-[var(--border-subtle)] rounded-[2.5rem] bg-[var(--bg-card)] mt-8 relative overflow-hidden"
      >

        <div className={`w-20 h-20 ${isDark ? 'bg-white/5 text-white/50 border-white/10 shadow-xl' : 'bg-slate-100 text-slate-700 border-slate-200 shadow-sm'} rounded-3xl flex items-center justify-center mb-8 border relative z-10`}>
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4 relative z-10 tracking-tight">Welcome to IntelliX</h2>
        <p className="text-[var(--text-secondary)] text-lg max-w-lg mx-auto mb-10 leading-relaxed relative z-10">
          You are successfully registered but haven't joined any classes yet. Get your class Join Code from your teacher to begin exploring.
        </p>
        <button 
          onClick={() => navigate('/dashboard/join')}
          className="px-10 py-4 rounded-2xl bg-white text-black hover:bg-gray-200 font-bold tracking-tight transition-all active:scale-95 flex items-center gap-2 relative z-10"
        >
          <Plus className="w-5 h-5"/>
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
              className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 bg-white border-black" />
              )}
            </motion.button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-white/5">
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
                        className={`px-4 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-app)] transition-colors cursor-pointer ${!n.read ? 'bg-white/5' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-bold text-[var(--text-primary)]">{n.title}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-white" />}
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
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-white text-black hover:bg-gray-200 text-sm font-bold active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" /> Join Subject
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Tests Taken" value={stats.tests} icon={BookOpen} color="white" />
        <StatsCard title="Avg Score" value={`${stats.avgScore}%`} icon={TrendingUp} color="white" />
        <StatsCard title="Attendance" value={`${stats.attendanceRate}%`} icon={ClipboardCheck} color="green" />
        <StatsCard title="Last Rank" value={`#${stats.rank}`} icon={Trophy} color="white" />
      </div>

      {/* My Enrolled Batches (Subjects) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-white/5 text-white/50 border border-white/10 shadow-xl' : 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">My Subjects</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {batches.map((batch, i) => (
            <motion.div
              key={batch.id}
              whileHover={{ y: -5, scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-8 rounded-[2rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] text-white/50 border-[var(--border-subtle)] group-hover:bg-white group-hover:text-black flex items-center justify-center mb-6 transition-all shadow-xl relative z-10 border">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1 truncate relative z-10">{batch.name}</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] relative z-10">
                {batch.subject || 'Subject'}
              </p>
            </motion.div>
          ))}

          <motion.div
            whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            className="p-8 rounded-[2rem] bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center text-center group cursor-pointer hover:border-white transition-all gap-4"
            onClick={() => navigate('/dashboard/join')}
          >
            <div className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-[var(--bg-card)] group-hover:bg-white/10' : 'bg-slate-50 group-hover:bg-slate-100'} flex items-center justify-center transition-all border border-[var(--border-subtle)] shadow-inner`}>
              <Plus className={`w-6 h-6 ${isDark ? 'text-[var(--text-secondary)] group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
            </div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Join New Subject</p>
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
            className={`rounded-2xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'} p-6 shadow-sm`}
          >
            <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-white/5 text-white/50 border border-white/10 shadow-xl' : 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'}`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Active AI Tests</h2>
            </div>
            <button
              onClick={() => navigate('/dashboard/active-tests')}
              className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors border-b border-transparent hover:border-[var(--border-subtle)] pb-1"
            >
              View All History
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTests.map((test) => {
              const isLocked = test.start_time && new Date(test.start_time) > new Date()
              return (
                  <div
                    key={test.id}
                    className={`flex items-center justify-between px-6 py-5 rounded-[1.5rem] border transition-all group cursor-pointer relative overflow-hidden ${ isLocked ? (isDark ? 'border-white/5 bg-white/[0.01] opacity-60' : 'border-slate-100 bg-slate-50/50 opacity-60')
                      : (isDark ? 'border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06] shadow-lg shadow-black/20' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md')
                    }`}
                    onClick={() => !isLocked && navigate(`/dashboard/test-attempt/${test.id}`)}
                  >
                    <div className="min-w-0 flex-1 relative z-10">
                      <p className={`text-sm font-bold truncate ${isLocked ? (isDark ? 'text-gray-500' : 'text-slate-400') : (isDark ? 'text-white' : 'text-slate-900')} transition-colors`}>
                        {test.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        {isLocked ? (
                          <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border ${isDark ? 'text-amber-500/80 bg-amber-500/5 border-amber-500/10' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                            <Clock className="w-2.5 h-2.5" /> Scheduled
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Live Now</span>
                        )}
                        {test.duration_minutes && (
                          <span className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] font-medium">
                            <Activity className="w-3 h-3" /> {test.duration_minutes}m
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`ml-3 p-3 rounded-2xl transition-all relative z-10 ${ isLocked ? 'bg-white/5 text-gray-600'
                        : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white border border-white/5'
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
          className="rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[450px] relative"
        >

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-white/10 text-white border border-white/20 shadow-xl shadow-black/20' : 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'}`}>
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Performance Timeline</h2>
          </div>
          
          {chartData.length < 2 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] text-sm font-bold border border-dashed border-[var(--border-subtle)] rounded-[2rem] m-2 bg-[var(--bg-card)] relative z-10 gap-3">
              <div className="p-4 rounded-2xl bg-[var(--bg-card)]">
                <TrendingUp className="w-8 h-8 opacity-20" />
              </div>
              <p className="uppercase tracking-widest text-[10px]">Insufficient performance data</p>
            </div>
          ) : (
            <div className="flex-1 w-full h-full min-h-0 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDark ? "#ffffff" : "#4f46e5"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isDark ? "#ffffff" : "#4f46e5"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#64748b', fontWeight: 600 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#64748b', fontWeight: 600 }} domain={[0, 100]} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#111827' : '#ffffff', 
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                      borderRadius: '16px', 
                      color: isDark ? '#fff' : '#000', 
                      fontSize: '12px', 
                      fontWeight: 'bold', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
                    }}
                    itemStyle={{ color: isDark ? '#ffffff' : '#4f46e5' }}
                    cursor={{ stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 2 }}
                  />
                  <Area type="monotone" dataKey="score" stroke={isDark ? "#ffffff" : "#4f46e5"} strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Score %" />
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
          className="rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col h-[450px] relative"
        >

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className={`p-2.5 rounded-2xl shadow-xl ${isDark ? 'bg-white/10 text-white border border-white/20 shadow-black/20' : 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Recent Activity</h2>
          </div>
          {recentResults.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] text-sm font-bold border border-dashed border-[var(--border-subtle)] rounded-[2rem] m-2 bg-[var(--bg-card)] relative z-10 gap-3">
              <div className="p-4 rounded-2xl bg-[var(--bg-card)]">
                <ClipboardCheck className="w-8 h-8 opacity-20" />
              </div>
              <p className="uppercase tracking-widest text-[10px]">No recent results found</p>
            </div>
          ) : (
            <div className="space-y-4 relative z-10 overflow-y-auto custom-scrollbar pr-2">
              {recentResults.map((r) => (
                <div 
                  key={r.id} 
                  className="flex items-center justify-between px-6 py-5 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-white/[0.05] hover:border-white/10 transition-all group cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[var(--text-primary)] transition-colors truncate">{r.tests?.title}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
                      {r.tests?.date ? new Date(r.tests.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {r.marks} <span className="text-gray-600 font-medium">/</span> {r.tests?.total_marks}
                    </p>
                    {r.rank && <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Rank #{r.rank}</p>}
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

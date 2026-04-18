import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, Layers, FileText, ClipboardCheck, TrendingUp, Calendar, Activity, AlertTriangle, Brain } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import StatsCard from '../../components/ui/StatsCard'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

const AdminDashboard = () => {
  const { isDark } = useTheme()
  const { data: dashboardData, loading } = useAppQuery('admin-dashboard', async () => {
    const [studentsRes, batchesRes, testsRes, attendanceRes] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }),
      supabase.from('batches').select('id', { count: 'exact', head: true }),
      supabase.from('tests').select('id', { count: 'exact', head: true }),
      supabase.from('attendance').select('status'),
    ])

    const totalAttendance = attendanceRes.data?.length || 0
    const presentCount = attendanceRes.data?.filter((a) => a.status === 'present').length || 0
    const attendanceRate = totalAttendance ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0

    const { data: tests } = await supabase
      .from('tests')
      .select('id, title, date, total_marks, batch_id, batches(name)')
      .order('date', { ascending: false })
      .limit(5)

    const { data: allResults } = await supabase
      .from('results')
      .select('marks, tests(title, total_marks)')
    
    let performanceData = []
    let weakTopics = []
    
    if (allResults && allResults.length > 0) {
      const testMap = {}
      allResults.forEach(r => {
         const title = r.tests?.title?.substring(0, 15) || 'Test'
         if (!testMap[title]) testMap[title] = { name: title, totalScore: 0, count: 0, maxScore: r.tests?.total_marks || 100 }
         testMap[title].totalScore += r.marks
         testMap[title].count += 1
      })
      performanceData = Object.values(testMap).map(t => ({
         name: t.name,
         avg: Math.round(((t.totalScore / t.count) / t.maxScore) * 100)
      })).slice(0, 5)

      const topicMap = {}
      allResults.forEach(r => {
        if (r.ai_feedback?.weak_topics) {
          r.ai_feedback.weak_topics.forEach(topic => {
            topicMap[topic] = (topicMap[topic] || 0) + 1
          })
        }
      })
      weakTopics = Object.entries(topicMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([topic, freq]) => ({ topic, freq }))
    }

    return {
      stats: {
        students: studentsRes.count || 0,
        batches: batchesRes.count || 0,
        tests: testsRes.count || 0,
        attendance: attendanceRate,
      },
      recentTests: tests || [],
      performanceData,
      weakTopics
    }
  })

  if (loading && !dashboardData) return <DashboardSkeleton />

  const { stats, recentTests, performanceData, weakTopics } = dashboardData || {
    stats: { students: 0, batches: 0, tests: 0, attendance: 0 },
    recentTests: [],
    performanceData: [],
    weakTopics: []
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          Administrative Console
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1.5 font-medium">Institutional oversight and system-wide performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={stats.students} icon={Users} color="blue" />
        <StatsCard title="Total Subjects" value={stats.batches} icon={Layers} color="purple" />
        <StatsCard title="Tests Conducted" value={stats.tests} icon={FileText} color="emerald" />
        <StatsCard title="Attendance Rate" value={`${stats.attendance}%`} icon={ClipboardCheck} color="amber" />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="col-span-1 lg:col-span-2 rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col h-[450px]"
        >

          <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-100 text-slate-700 border border-slate-200'} shadow-lg`}>
            <Activity className="w-5 h-5" />
          </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Institutional Performance</h2>
          </div>
          {performanceData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] text-sm font-bold border border-dashed border-[var(--border-subtle)] rounded-[2rem] m-2 bg-[var(--bg-card)] relative z-10 gap-3">
               <div className="p-4 rounded-2xl bg-[var(--bg-card)]">
                <Activity className="w-8 h-8 opacity-20" />
              </div>
              <p className="uppercase tracking-widest text-[10px]">Insufficient performance data</p>
            </div>
          ) : (
            <div className="flex-1 w-full h-full min-h-0 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#64748b', fontWeight: 600 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#64748b', fontWeight: 600 }} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', radius: 8 }}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#111827' : '#ffffff', 
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                      borderRadius: '16px', 
                      color: isDark ? '#fff' : '#000', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="avg" name="Avg Score %" radius={[8, 8, 0, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? (isDark ? '#ffffff' : '#64748b') : (isDark ? '#4b5563' : '#cbd5e1')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Weakest Subjects */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2 }}
           className="col-span-1 rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col h-[450px]"
        >

          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Focus Areas</h2>
          </div>
          {weakTopics.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] text-sm font-bold border border-dashed border-[var(--border-subtle)] rounded-[2rem] m-2 bg-[var(--bg-card)] relative z-10 gap-3">
               <div className="p-4 rounded-2xl bg-[var(--bg-card)]">
                <Brain className="w-8 h-8 opacity-20" />
              </div>
              <p className="uppercase tracking-widest text-[10px]">AI diagnostics pending</p>
            </div>
          ) : (
            <div className="flex-1 space-y-4 relative z-10 overflow-y-auto custom-scrollbar pr-2">
              {weakTopics.map((item, idx) => (
                <div key={idx} className="p-5 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between group transition-all hover:bg-white/[0.03]">
                  <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-red-400 transition-colors truncate pr-2">{item.topic}</span>
                  <span className="text-[10px] font-black text-red-400 bg-red-500/10 border border-red-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">{item.freq} instances</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden"
      >

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-white/10 text-white border border-white/20 shadow-xl shadow-white/5' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
            <Calendar className="w-5 h-5" />
          </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Recent Sessions</h2>
          </div>
          <button className={`text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors border-b border-transparent hover:border-[var(--border-subtle)] pb-1`}>
            Global History
          </button>
        </div>
        {recentTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-[2rem] border border-dashed border-[var(--border-subtle)] gap-3">
             <div className="p-4 rounded-2xl bg-[var(--bg-card)]">
                <FileText className="w-8 h-8 opacity-20" />
              </div>
              <p className="uppercase tracking-widest text-[10px] font-bold">No recent test records</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {recentTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between px-6 py-5 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-white/[0.03] hover:border-white/10 transition-all group cursor-pointer"
              >
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)] transition-colors truncate">{test.title}</p>
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">{test.batches?.name || 'Institutional Batch'}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-[var(--text-primary)] tracking-tighter">{test.total_marks} Marks</p>
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-tight mt-1">{new Date(test.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="rounded-[2.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden"
      >

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-white/10 text-white border border-white/20 shadow-xl shadow-white/5' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Access Control</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
          {[
            { label: 'Register Student', path: '/dashboard/students', icon: Users },
            { label: 'Provision Batch', path: '/dashboard/batches', icon: Layers },
            { label: 'Audit Analytics', path: '/dashboard/results', icon: ClipboardCheck },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="flex items-center justify-between px-6 py-5 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20 group hover:bg-white hover:text-black"
            >
              <div className="flex items-center gap-3">
                <action.icon className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                {action.label}
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard

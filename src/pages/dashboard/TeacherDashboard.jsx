import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layers, FileText, Users, Activity, CheckCircle2, ClipboardList, Plus, Video } from 'lucide-react'
import StatsCard from '../../components/ui/StatsCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

const TeacherDashboard = () => {
  const { user, profile } = useAuth()
  const displayName = profile?.first_name || profile?.name || 'Faculty'

  const { data: dashboardData, loading } = useAppQuery(`teacher-dashboard-${user?.id}`, async () => {
    if (!user) return null
    
    const { data: myBatches } = await supabase
      .from('batches')
      .select('id, name, subject, students(id)')
      .eq('teacher_id', user.id)

    const batchList = myBatches || []
    const batchIds = batchList.map((b) => b.id).filter(Boolean)

    let testCount = 0
    let activeTests = []
    let liveResults = []

    if (batchIds.length > 0) {
      const { count } = await supabase.from('tests').select('id', { count: 'exact', head: true }).in('batch_id', batchIds)
      testCount = count || 0

      const { data: recentTests } = await supabase
        .from('tests')
        .select('id, title, end_time, total_marks, batch_id, batches(name)')
        .in('batch_id', batchIds)
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (recentTests && recentTests.length > 0) {
        activeTests = recentTests
        const testIds = recentTests.map(t => t.id)
        
        const { data: resData } = await supabase
          .from('results')
          .select('id, test_id, marks')
          .in('test_id', testIds)
        
        liveResults = resData || []
      }
    }

    const totalStudents = batchList.reduce((sum, b) => sum + (b.students?.length || 0), 0)

    const today = new Date().toISOString().split('T')[0]
    let pendingAttendance = 0
    if (batchIds.length > 0) {
      const { data: attendanceData } = await supabase.from('attendance').select('batch_id').eq('date', today).in('batch_id', batchIds)
      const takenBatches = new Set((attendanceData || []).map(a => a.batch_id))
      pendingAttendance = Math.max(0, batchIds.length - takenBatches.size)
    }

    return {
      stats: {
        batches: batchList.length,
        students: totalStudents,
        tests: testCount,
        pendingAttendance
      },
      batches: batchList,
      activeTests,
      initialLiveResults: liveResults
    }
  }, { enabled: !!user })

  if (loading && !dashboardData) return <DashboardSkeleton />

  const { stats, batches, activeTests, initialLiveResults } = dashboardData || {
    stats: { batches: 0, students: 0, tests: 0, pendingAttendance: 0 },
    batches: [],
    activeTests: [],
    initialLiveResults: []
  }

  // Generate a greeting based on time of day
  const hour = new Date().getHours()
  let greeting = 'Good Evening'
  if (hour < 12) greeting = 'Good Morning'
  else if (hour < 18) greeting = 'Good Afternoon'

  return (
    <div className="space-y-8">
      {/* SECTION 1: Welcome Back */}
      <div className="bg-white rounded-[16px] border border-gray-200 p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-4">
            {greeting}, {displayName}.
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <span className="font-medium text-gray-900">{stats.batches}</span> Active Batches
            </div>
            <div className="flex items-center gap-2 text-gray-600">
               <div className="w-2 h-2 rounded-full bg-amber-500"></div>
               <span className="font-medium text-gray-900">{stats.pendingAttendance}</span> Pending Attendance Today
            </div>
          </div>
        </div>
        <Link
          to="/dashboard/attendance"
          className="btn-primary shrink-0"
        >
          Mark Attendance
        </Link>
      </div>

      {/* SECTION 2: Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/dashboard/lectures" className="academic-card flex flex-col items-center justify-center py-6 text-center hover:border-blue-300 hover:bg-blue-50 group transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Start Live Class</span>
          </Link>
          <Link to="/dashboard/attendance" className="academic-card flex flex-col items-center justify-center py-6 text-center hover:border-blue-300 hover:bg-blue-50 group transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Take Attendance</span>
          </Link>
          <Link to="/dashboard/materials" className="academic-card flex flex-col items-center justify-center py-6 text-center hover:border-blue-300 hover:bg-blue-50 group transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Upload Material</span>
          </Link>
          <Link to="/dashboard/tests" className="academic-card flex flex-col items-center justify-center py-6 text-center hover:border-blue-300 hover:bg-blue-50 group transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Create Test</span>
          </Link>
        </div>
      </div>

      {/* SECTION 3: Performance Overview */}
      <div>
         <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Overview</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatsCard title="My Batches" value={stats.batches} icon={Layers} color="primary" />
           <StatsCard title="Total Students" value={stats.students} icon={Users} color="success" />
           <StatsCard title="Tests Created" value={stats.tests} icon={FileText} color="warning" />
         </div>
      </div>

      {/* SECTION 4: Today's Classes & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Classes / Batches */}
        <div className="academic-card flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">My Batches</h2>
            <Link to="/dashboard/batches" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          
          {batches.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <Users className="w-6 h-6 text-gray-400 mb-2" />
               <p className="text-sm text-gray-500">No active batches assigned.</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3">
              {batches.slice(0, 4).map((batch) => (
                <Link
                  key={batch.id}
                  to={`/dashboard/batches/${batch.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{batch.name}</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">{batch.subject || 'Core Subject'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-gray-200 text-xs text-gray-600 font-medium">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{batch.students?.length || 0} Students</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="academic-card flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tests</h2>
            <Link to="/dashboard/tests" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          
          {activeTests.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <FileText className="w-6 h-6 text-gray-400 mb-2" />
               <p className="text-sm text-gray-500">No recent tests found.</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3">
              {activeTests.slice(0, 4).map((t) => {
                const testResults = (initialLiveResults || []).filter(r => r.test_id === t.id)
                const attemptCount = testResults.length
                const avgScore = attemptCount > 0 
                  ? (testResults.reduce((sum, r) => sum + (r.marks || 0), 0) / attemptCount).toFixed(1) 
                  : 0

                return (
                  <Link
                    key={t.id}
                    to="/dashboard/results"
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate max-w-[180px]">{t.title}</p>
                      </div>
                      <p className="text-xs font-medium text-gray-500">{t.batches?.name}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{avgScore} <span className="text-xs font-medium text-gray-500">/ {t.total_marks || '?'} avg</span></p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">{attemptCount} submissions</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard

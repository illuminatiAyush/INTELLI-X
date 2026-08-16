import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Trophy, ClipboardCheck, TrendingUp, Sparkles, Play, Clock, Activity, Plus, Bell, X, Lock, FileText } from 'lucide-react'
import StatsCard from '../../components/ui/StatsCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

const StudentDashboard = () => {
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

    // Get attendance
    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', user.id)
    const totalA = attendance?.length || 0
    const presentA = attendance?.filter((a) => a.status === 'present').length || 0
    const attendanceRate = totalA ? ((presentA / totalA) * 100).toFixed(1) : 0

    // Get active tests
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
        attendanceRate,
        rank: resultList[0]?.rank || '-',
      },
      recentResults: resultList.slice(0, 5),
      activeTests: activeOrUpcoming,
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
    enrolledBatches,
  } = studentData || {
    studentRecord: null,
    stats: { tests: 0, attendanceRate: 0, rank: '-' },
    recentResults: [],
    activeTests: [],
    hasBatches: true,
    enrolledBatches: [],
  }

  if (!studentRecord) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-gray-500 border border-gray-200 shadow-sm">
          <Activity className="w-8 h-8" />
        </div>
        <p className="text-gray-900 font-semibold text-lg">No student profile found</p>
        <p className="text-gray-500 text-sm mt-1">Please contact your admin to link your account</p>
      </div>
    )
  }

  if (!hasBatches) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-12 bg-white border border-gray-200 rounded-[16px] shadow-sm mt-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
           <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">Welcome to IntelliX</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          You are successfully registered but haven't joined any classes yet. Get your class Join Code from your teacher to begin.
        </p>
        <button 
          onClick={() => navigate('/dashboard/join')}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2"/>
          Join Your First Subject
        </button>
      </div>
    )
  }

  const hour = new Date().getHours()
  let greeting = 'Good Evening'
  if (hour < 12) greeting = 'Good Morning'
  else if (hour < 18) greeting = 'Good Afternoon'

  return (
    <div className="space-y-8">
      {/* SECTION 1: Welcome Back */}
      <div className="bg-white rounded-[16px] border border-gray-200 p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">
            {greeting}, {studentRecord.name}.
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm mt-4">
            <div className="flex items-center gap-2 text-gray-600">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <span className="font-medium text-gray-900">{enrolledBatches.length}</span> Subjects
            </div>
            <div className="flex items-center gap-2 text-gray-600">
               <div className="w-2 h-2 rounded-full bg-amber-500"></div>
               <span className="font-medium text-gray-900">{activeTests.length}</span> Upcoming Tests
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 bg-blue-500 border-gray-50" />
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Notifications</span>
                  <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.read && markAsRead(n.id)}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-blue-500" />}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <Link to="/dashboard/join" className="btn-secondary">
             <Plus className="w-4 h-4 mr-2" /> Join Subject
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Attendance" value={`${stats.attendanceRate}%`} icon={ClipboardCheck} color="success" />
        <StatsCard title="Enrolled Subjects" value={enrolledBatches.length} icon={BookOpen} color="warning" />
        <StatsCard title="Tests Taken" value={stats.tests} icon={FileText} color="primary" />
        <StatsCard title="Last Rank" value={`#${stats.rank}`} icon={Trophy} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Classes & Enrolled Subjects */}
        <div className="academic-card lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Today's Classes & Subjects</h2>
            <Link to="/dashboard/batches" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrolledBatches.map((batch) => (
              <div
                key={batch.id}
                className="p-5 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="font-semibold text-gray-900 truncate">{batch.name}</h3>
                     <p className="text-xs text-gray-500 font-medium">{batch.subject || 'Subject'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Materials Shortcut */}
        <div className="academic-card flex flex-col justify-center text-center">
           <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6" />
           </div>
           <h3 className="font-semibold text-gray-900 mb-2">Study Materials</h3>
           <p className="text-sm text-gray-500 mb-6">Access your latest notes and assignments.</p>
           <Link to="/dashboard/materials" className="btn-secondary w-full">Open Drive</Link>
        </div>

      </div>

      {/* Recent Results */}
      <div className="academic-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Results</h2>
          <Link to="/dashboard/results" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
        </div>
        {recentResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <ClipboardCheck className="w-6 h-6 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No recent results found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentResults.map((r) => (
              <div 
                key={r.id} 
                className="p-5 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">{r.tests?.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {r.tests?.date ? new Date(r.tests.date).toLocaleDateString() : ''}
                    </p>
                  </div>
                  {r.rank && (
                    <span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-md">
                      #{r.rank}
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-1">
                   <span className="text-2xl font-bold text-gray-900 leading-none">{r.marks}</span>
                   <span className="text-sm font-medium text-gray-500 mb-0.5">/ {r.tests?.total_marks}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default StudentDashboard

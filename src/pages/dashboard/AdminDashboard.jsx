import { Link } from 'react-router-dom'
import { Users, Layers, FileText, ClipboardCheck, Plus, CheckCircle, Activity, UserPlus } from 'lucide-react'
import StatsCard from '../../components/ui/StatsCard'
import { supabase } from '../../lib/supabase'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'
import { useAuth } from '../../context/AuthContext'

const AdminDashboard = () => {
  const { profile } = useAuth()
  const displayName = profile?.first_name || profile?.name || 'Admin'

  const { data: dashboardData, loading } = useAppQuery('admin-dashboard', async () => {
    const today = new Date().toISOString().split('T')[0]

    const [studentsRes, attendanceRes, testsRes, batchesRes] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }),
      supabase.from('attendance').select('status'),
      supabase.from('tests').select('id', { count: 'exact', head: true }),
      supabase.from('batches').select('id', { count: 'exact', head: true })
    ])

    // Activity could be recently created users or tests
    const { data: recentActivity } = await supabase
      .from('profiles')
      .select('name, created_at, role')
      .order('created_at', { ascending: false })
      .limit(5)

    const totalAttendance = attendanceRes.data?.length || 0
    const presentCount = attendanceRes.data?.filter((a) => a.status === 'present').length || 0
    const attendanceRate = totalAttendance ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0

    return {
      stats: {
        students: studentsRes.count || 0,
        attendance: attendanceRate,
        batches: batchesRes.count || 0
      },
      today: {
        classes: 0,
        fees: 0,
        tests: testsRes.count || 0
      },
      recentActivity: recentActivity || []
    }
  })

  if (loading && !dashboardData) return <DashboardSkeleton />

  const { stats, today, recentActivity } = dashboardData || {
    stats: { students: 0, attendance: 0, batches: 0 },
    today: { classes: 0, fees: 0, tests: 0 },
    recentActivity: []
  }

  // Generate a greeting based on time of day
  const hour = new Date().getHours()
  let greeting = 'Good Evening'
  if (hour < 12) greeting = 'Good Morning'
  else if (hour < 18) greeting = 'Good Afternoon'

  return (
    <div className="space-y-8">
      {/* SECTION 1: Welcome Back */}
      <div className="bg-white rounded-[16px] border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-4">
          {greeting}, {displayName}.
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
             <span className="font-medium text-gray-900">{stats.students}</span> Total Students
          </div>
          <div className="flex items-center gap-2 text-gray-600">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             <span className="font-medium text-gray-900">{stats.batches}</span> Total Batches
          </div>
          <div className="flex items-center gap-2 text-gray-600">
             <div className="w-2 h-2 rounded-full bg-amber-500"></div>
             <span className="font-medium text-gray-900">{today.tests}</span> Upcoming Tests
          </div>
        </div>
      </div>

      {/* SECTION 2: Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/dashboard/students" className="academic-card flex flex-col items-center justify-center py-6 text-center hover:border-blue-300 hover:bg-blue-50 group transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Add Student</span>
          </Link>
          <Link to="/dashboard/batches" className="academic-card flex flex-col items-center justify-center py-6 text-center hover:border-blue-300 hover:bg-blue-50 group transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Create Batch</span>
          </Link>
          <Link to="/dashboard/results" className="academic-card flex flex-col items-center justify-center py-6 text-center hover:border-blue-300 hover:bg-blue-50 group transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Record Test</span>
          </Link>
          <Link to="/dashboard/teachers" className="academic-card flex flex-col items-center justify-center py-6 text-center hover:border-blue-300 hover:bg-blue-50 group transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900">Manage Teachers</span>
          </Link>
        </div>
      </div>

      {/* SECTION 3: Performance Overview */}
      <div>
         <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Performance Overview</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatsCard title="Student Growth" value={stats.students} icon={Users} color="primary" />
           <StatsCard title="Attendance Rate" value={`${stats.attendance}%`} icon={ClipboardCheck} color="success" />
           <StatsCard title="Active Batches" value={stats.batches} icon={Layers} color="warning" />
         </div>
      </div>

      {/* SECTION 4: Recent Activity Timeline */}
      <div className="academic-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-6">
          {recentActivity.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No recent activity.</p>
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-4">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New {activity.role} registered.</p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.name} • {new Date(activity.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}

export default AdminDashboard

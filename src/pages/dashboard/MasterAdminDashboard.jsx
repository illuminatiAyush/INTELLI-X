import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Layers, ShieldAlert, TrendingUp, Activity } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import StatsCard from '../../components/ui/StatsCard'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

const MasterAdminDashboard = () => {
  const { data: stats, loading } = useAppQuery('master-admin-dashboard', async () => {
    // Fetch counts
    const [instRes, usersRes, adminRes, teacherRes, studentRes] = await Promise.all([
      supabase.from('institutes').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    ])

    const { data: recentInstitutes } = await supabase
      .from('institutes')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      institutes: instRes.count || 0,
      totalUsers: usersRes.count || 0,
      activeAdmins: adminRes.count || 0,
      activeTeachers: teacherRes.count || 0,
      activeStudents: studentRes.count || 0,
      recentActivity: recentInstitutes || []
    }
  })

  if (loading && !stats) return <DashboardSkeleton />

  const { institutes, totalUsers, activeAdmins, activeTeachers, activeStudents, recentActivity } = stats || { 
    institutes: 0, totalUsers: 0, activeAdmins: 0, activeTeachers: 0, activeStudents: 0, recentActivity: [] 
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Master Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">Global statistics and system health for IntelliX.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Institutes"
          value={institutes}
          icon={Layers}
          color="primary"
        />
        <StatsCard
          title="Platform Users"
          value={totalUsers}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Active Admins"
          value={activeAdmins}
          icon={ShieldAlert}
          color="warning"
        />
        <StatsCard
          title="Total Teachers"
          value={activeTeachers}
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          title="Total Students"
          value={activeStudents}
          icon={Users}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="academic-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Activity className="w-5 h-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h2>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                No recent activity found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New Institute Registered</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.name} • {new Date(activity.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MasterAdminDashboard

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { useTheme } from '../../context/ThemeContext'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

// ── Student profile imports ──────────────────────────────────────────
// (Basic profile only, analytics moved to AnalyticsPage)

// ── Teacher profile imports ──────────────────────────────────────────
import {
  fetchTeacherRecord,
  fetchTeacherBatches,
} from '../../services/teacherProfileService'
import ProfileCard from '../../components/teacher/profile/ProfileCard'
import EditProfileModal from '../../components/teacher/profile/EditProfileModal'
import BatchesList from '../../components/teacher/profile/BatchesList'

// ── Shared ───────────────────────────────────────────────────────────
import ChangePassword from '../../components/profile/ChangePassword'

// ═══════════════════════════════════════════════════════════════════════
// Student Profile View
// ═══════════════════════════════════════════════════════════════════════
const StudentProfileView = ({ user, profile, role }) => {
  const { isDark } = useTheme()

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'Student'

  return (
    <>
      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-xl ${isDark ? 'bg-white/10 text-white shadow-black/20' : 'bg-slate-800 text-white shadow-slate-300'}`}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{displayName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full capitalize ${isDark ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                {role || 'Student'}
              </span>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Active
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-600">First Name</span>
            <p className="text-sm font-semibold text-gray-900">{profile?.first_name || 'Not set'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-600">Last Name</span>
            <p className="text-sm font-semibold text-gray-900">{profile?.last_name || 'Not set'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-600">Email</span>
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.email || 'Not set'}</p>
          </div>
        </div>
      </motion.div>

      {/* Password Change Section */}
      <div className="dashboard-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>
        <ChangePassword />
      </div>

      {/* Quick Stats Note */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-900">Performance Analytics</h3>
            <p className="text-xs text-blue-700 mt-1">
              View detailed performance analytics, test scores, and progress tracking in the 
              <span className="font-semibold"> Analytics</span> section.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Teacher Profile View
// ═══════════════════════════════════════════════════════════════════════
const TeacherProfileView = ({ user, profile, role }) => {
  const { data: teacherData, loading: tLoading, refetch } = useAppQuery(`teacher-profile-data-${user?.id}`, async () => {
    if (!user) return null
    const [teacher, batches] = await Promise.all([
      fetchTeacherRecord(user.id),
      fetchTeacherBatches(user.id),
    ])
    return { teacher, batches }
  }, { enabled: !!user })

  const loading = tLoading && !teacherData
  const teacher = teacherData?.teacher || null
  const batches = teacherData?.batches || []
  const [editOpen, setEditOpen] = useState(false)

  const handleSaved = () => {
    refetch()
  }


  return (
    <>
      <ProfileCard
        profile={profile}
        user={user}
        teacher={teacher}
        role={role}
        loading={loading}
        onEdit={() => setEditOpen(true)}
      />

      <BatchesList batches={batches} loading={loading} />

      <ChangePassword />

      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        teacher={teacher}
        profile={profile}
        onSaved={handleSaved}
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Profile Page (Role-Aware Router)
// ═══════════════════════════════════════════════════════════════════════
const ProfilePage = () => {
  const { user, profile, role } = useAuth()

  const isTeacher = role === 'teacher'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900 tracking-tight"
        >
          My Profile
        </motion.h1>
        <p className="text-gray-600 mt-1 font-medium">
          {isTeacher
            ? 'View your basic profile information and assigned batches'
            : 'View your profile information. Manage account settings in Settings, view performance data in Analytics.'}
        </p>
      </div>

      {isTeacher ? (
        <TeacherProfileView user={user} profile={profile} role={role} />
      ) : (
        <StudentProfileView user={user} profile={profile} role={role} />
      )}
    </div>
  )
}

export default ProfilePage

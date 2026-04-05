import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

// ── Student profile imports ──────────────────────────────────────────
import {
  fetchStudentStats,
  fetchTestScores,
  fetchSubjectPerformance,
  fetchStudentBatches,
} from '../../services/profileService'
import AcademicStats from '../../components/profile/AcademicStats'
import PerformanceChart from '../../components/profile/PerformanceChart'
import StrengthWeak from '../../components/profile/StrengthWeak'
import Achievements from '../../components/profile/Achievements'
import Notifications from '../../components/profile/Notifications'
import Goals from '../../components/profile/Goals'

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
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [testScores, setTestScores] = useState(null)
  const [subjects, setSubjects] = useState(null)
  const [batches, setBatches] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, scoresData, subjectsData, batchData] = await Promise.all([
          fetchStudentStats(user?.id),
          fetchTestScores(user?.id),
          fetchSubjectPerformance(user?.id),
          fetchStudentBatches(user?.id),
        ])
        setStats(statsData)
        setTestScores(scoresData)
        setSubjects(subjectsData)
        setBatches(batchData)
      } catch (err) {
        console.error('Student profile fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) loadData()
    else setLoading(false)
  }, [user])

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'Student'

  // Build current stats for Goals component
  const currentGoalStats = stats
    ? { score: stats.avgScore || 0, rank: stats.rank || '-' }
    : undefined

  return (
    <>
      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg shadow-purple-500/20">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[var(--text-primary)] truncate">{displayName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-[var(--color-purple)]/10 text-[var(--color-purple)] border border-[var(--color-purple)]/20 capitalize">
                {role || 'Student'}
              </span>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Active
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border-subtle)]">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)]">First Name</span>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{profile?.first_name || 'Not set'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)]">Last Name</span>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{profile?.last_name || 'Not set'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)]">Email</span>
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.email || 'Not set'}</p>
          </div>
        </div>
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-purple-500 opacity-[0.03] blur-3xl pointer-events-none" />
      </motion.div>

      <AcademicStats stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart testScores={testScores} loading={loading} />
        <div className="space-y-4">
          <StrengthWeak subjects={subjects} loading={loading} />
        </div>
      </div>

      {/* Student Batches */}
      <BatchesList batches={batches} loading={loading} />

      <Achievements />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Goals currentStats={currentGoalStats} />
        <Notifications />
      </div>

      <ChangePassword />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Teacher Profile View
// ═══════════════════════════════════════════════════════════════════════
const TeacherProfileView = ({ user, profile, role }) => {
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  const [batches, setBatches] = useState([])
  const [editOpen, setEditOpen] = useState(false)

  const fetchData = async () => {
    try {
      const teacherData = await fetchTeacherRecord(user.id)
      setTeacher(teacherData)

      const batchData = await fetchTeacherBatches(user.id)
      setBatches(batchData)
    } catch (err) {
      console.error('Teacher profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchData()
    else setLoading(false)
  }, [user])

  const handleSaved = () => {
    setLoading(true)
    fetchData()
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
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          My Profile
        </motion.h1>
        <p className="text-[var(--text-secondary)] mt-1 font-medium">
          {isTeacher
            ? 'Manage your profile, view assigned batches, and update account security'
            : 'Manage your personal information and track your academic progress'}
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

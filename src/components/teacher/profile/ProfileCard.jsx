import { motion } from 'framer-motion'
import { User, BookOpen, Briefcase, Phone, Mail, Pencil } from 'lucide-react'

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)]">
    <div className="p-2 rounded-lg bg-[var(--border-subtle)] text-[var(--text-secondary)] flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{value || 'Not set'}</p>
    </div>
  </div>
)

const Skeleton = () => (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 animate-pulse space-y-4">
    <div className="flex items-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-[var(--border-subtle)]" />
      <div className="space-y-2 flex-1">
        <div className="h-5 w-40 rounded bg-[var(--border-subtle)]" />
        <div className="h-4 w-24 rounded bg-[var(--border-subtle)]" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[var(--border-subtle)]">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-[var(--border-subtle)]" />
      ))}
    </div>
  </div>
)

const ProfileCard = ({ profile, user, teacher, role, loading, onEdit }) => {
  if (loading) return <Skeleton />

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : teacher?.name || user?.email?.split('@')[0] || 'Teacher'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-black text-2xl font-bold flex-shrink-0 shadow-lg shadow-white/10">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[var(--text-primary)] truncate">{displayName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-white/10 text-white border border-white/20 capitalize">
                {role || 'Teacher'}
              </span>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Active
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 text-sm font-bold transition-all active:scale-[0.97]"
        >
          <Pencil className="w-4 h-4" />
          <span className="hidden sm:inline">Edit Profile</span>
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-[var(--border-subtle)]">
        <InfoItem icon={BookOpen} label="Subject" value={teacher?.subject} />
        <InfoItem icon={Briefcase} label="Experience" value={teacher?.experience ? `${teacher.experience} years` : null} />
        <InfoItem icon={Phone} label="Phone" value={teacher?.phone} />
        <InfoItem icon={Mail} label="Email" value={user?.email} />
      </div>

      {/* Decorative */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
    </motion.div>
  )
}

export default ProfileCard

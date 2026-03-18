import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const ProfilePage = () => {
  const { profile } = useAuth()
  
  return (
    <div className="space-y-8">
      <div>
        <motion.h1 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          My Profile
        </motion.h1>
        <p className="text-[var(--text-secondary)] mt-1 font-medium">Manage your personal information and account security</p>
      </div>

      <div className="max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-sm p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none select-none">
          <svg className="w-32 h-32 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest font-black text-[var(--text-secondary)]">First Name</span>
              <div className="px-5 py-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl text-[var(--text-primary)] font-bold shadow-inner">
                {profile?.first_name || 'Not set'}
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest font-black text-[var(--text-secondary)]">Last Name</span>
              <div className="px-5 py-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl text-[var(--text-primary)] font-bold shadow-inner">
                {profile?.last_name || 'Not set'}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest font-black text-[var(--text-secondary)]">Official Full Name</span>
            <div className="px-5 py-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl text-[var(--text-primary)] font-bold shadow-inner">
              {profile?.full_name || `${profile?.first_name} ${profile?.last_name || ''}`.trim()}
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-[var(--color-purple)]/5 border border-[var(--color-purple)]/20 rounded-3xl">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-purple)] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-purple-500/20">
                  {profile?.role?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                   <p className="text-[10px] uppercase tracking-widest font-black text-[var(--color-purple)]">Current Role</p>
                   <p className="text-xl font-black text-[var(--text-primary)] capitalize">{profile?.role || 'User'}</p>
                </div>
             </div>
             <div className="px-4 py-1.5 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                Active Account
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

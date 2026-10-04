import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function PendingApproval() {
  const { logOut, profile } = useAuth()

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-8 z-10 shadow-2xl shadow-black/50"
      >
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Approval Pending</h1>
        <p className="text-[var(--text-secondary)] mb-8 font-medium leading-relaxed">
          Hello {profile?.first_name || 'Teacher'},<br/>
          Your account is currently pending administrator approval. You will gain access to the dashboard once your profile is validated.
        </p>

        <button 
          onClick={logOut}
          className="w-full bg-[var(--bg-app)] hover:border-[var(--border-strong)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5 text-[var(--text-secondary)]" />
          Sign Out
        </button>
      </motion.div>
    </div>
  )
}

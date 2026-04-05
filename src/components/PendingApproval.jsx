import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function PendingApproval() {
  const { logOut, profile } = useAuth()

  return (
    <div className="min-h-screen bg-[#0d0d16] flex flex-col items-center justify-center p-6 text-center shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 z-10"
      >
        <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-yellow-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">Pending Approval</h1>
        <p className="text-gray-400 mb-8 font-medium leading-relaxed">
          Hello {profile?.first_name || 'Teacher'},<br/>
          Your account has been successfully created but is currently pending administrator approval. You will gain access to the dashboard once an admin validates your profile.
        </p>

        <button 
          onClick={logOut}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </motion.div>
    </div>
  )
}

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, role, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <div className="relative z-10 w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center border border-[var(--border-subtle)] shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <div className="w-8 h-8 border-[3px] border-[var(--border-subtle)] border-t-white rounded-full animate-spin" />
                </div>
                <p className="text-[10px] font-black text-[var(--text-secondary)] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] tracking-[0.3em] uppercase relative z-10">
                    Establishing Secure Link
                </p>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default ProtectedRoute

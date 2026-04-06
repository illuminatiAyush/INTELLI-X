import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, role, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F]">
                <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
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

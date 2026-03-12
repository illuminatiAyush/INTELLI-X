import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
    const { user, role, logOut } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logOut()
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-[#0B0B0F] text-white p-8">
            <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>

                <div className="mb-8 space-y-4">
                    <p className="text-gray-300">
                        <span className="font-semibold text-purple-400">User ID:</span> {user?.id}
                    </p>
                    <p className="text-gray-300">
                        <span className="font-semibold text-purple-400">Email:</span> {user?.email}
                    </p>
                    <p className="text-gray-300">
                        <span className="font-semibold text-purple-400">Assigned Role:</span> {role || 'No role assigned'}
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </div>
    )
}

export default Dashboard

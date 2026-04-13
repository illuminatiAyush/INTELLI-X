import { useAuth } from '../../context/AuthContext'
import MasterAdminDashboard from './MasterAdminDashboard'
import AdminDashboard from './AdminDashboard'
import TeacherDashboard from './TeacherDashboard'
import StudentDashboard from './StudentDashboard'

const DashboardHome = () => {
  const { role } = useAuth()

  switch (role) {
    case 'master_admin':
      return <MasterAdminDashboard />
    case 'admin':
      return <AdminDashboard />
    case 'teacher':
      return <TeacherDashboard />
    case 'student':
      return <StudentDashboard />
    default:
      return (
        <div className="text-center py-20">
          <p className="text-[var(--text-secondary)] text-lg">Unknown role. Please contact support.</p>
        </div>
      )
  }
}

export default DashboardHome

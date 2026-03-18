import {
  LayoutDashboard,
  Users,
  Layers,
  ClipboardCheck,
  FileText,
  Trophy,
  BookOpen,
  BarChart3,
  Settings,
  CreditCard,
  PieChart,
  User,
  Activity
} from 'lucide-react'

const navConfig = {
  master_admin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Institutes', path: '/dashboard/institutes', icon: Layers },
    { label: 'System Analytics', path: '/dashboard/analytics', icon: Activity },
    { label: 'Subscriptions', path: '/dashboard/subscriptions', icon: CreditCard },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
    { label: 'System Logs', path: '/dashboard/logs', icon: FileText },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Teachers', path: '/dashboard/teachers', icon: Users },
    { label: 'Students', path: '/dashboard/students', icon: Users },
    { label: 'Batches', path: '/dashboard/batches', icon: Layers },
    { label: 'Attendance', path: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Tests', path: '/dashboard/tests', icon: FileText },
    { label: 'Results', path: '/dashboard/results', icon: BarChart3 },
    { label: 'Materials', path: '/dashboard/materials', icon: BookOpen },
    { label: 'Leaderboard', path: '/dashboard/leaderboard', icon: Trophy },
    { label: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ],
  teacher: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Attendance', path: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Tests', path: '/dashboard/tests', icon: FileText },
    { label: 'Results', path: '/dashboard/results', icon: BarChart3 },
    { label: 'Materials', path: '/dashboard/materials', icon: BookOpen },
    { label: 'Leaderboard', path: '/dashboard/leaderboard', icon: Trophy },
  ],
  student: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Results', path: '/dashboard/results', icon: BarChart3 },
    { label: 'Leaderboard', path: '/dashboard/leaderboard', icon: Trophy },
    { label: 'Materials', path: '/dashboard/materials', icon: BookOpen },
    { label: 'Profile', path: '/dashboard/profile', icon: User },
  ],
}

export default navConfig

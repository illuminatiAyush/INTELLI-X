import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  PieChart,
  Settings,
  Layers,
  Video,
  CreditCard,
  ScrollText,
  UserCircle
} from 'lucide-react'

const navConfig = {
  master_admin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Institutes', path: '/dashboard/institutes', icon: Layers },
    { label: 'Subscriptions', path: '/dashboard/subscriptions', icon: CreditCard },
    { label: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { label: 'System Logs', path: '/dashboard/logs', icon: ScrollText },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/dashboard/students', icon: Users },
    { label: 'Teachers', path: '/dashboard/teachers', icon: Users },
    { label: 'Batches', path: '/dashboard/batches', icon: Layers },
    { label: 'Attendance', path: '/dashboard/attendance', icon: ScrollText },
    { label: 'Results', path: '/dashboard/results', icon: FileText },
    { label: 'Materials', path: '/dashboard/materials', icon: BookOpen },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ],
  teacher: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Batches', path: '/dashboard/batches', icon: Layers },
    { label: 'Live Classes', path: '/dashboard/lectures', icon: Video },
    { label: 'Attendance', path: '/dashboard/attendance', icon: ScrollText },
    { label: 'Results', path: '/dashboard/results', icon: FileText },
    { label: 'Materials', path: '/dashboard/materials', icon: BookOpen },
    { label: 'Profile', path: '/dashboard/profile', icon: UserCircle },
  ],
  student: [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Batch', path: '/dashboard/batches', icon: Layers },
    { label: 'Attendance', path: '/dashboard/attendance', icon: ScrollText },
    { label: 'Results', path: '/dashboard/results', icon: FileText },
    { label: 'Study Materials', path: '/dashboard/materials', icon: BookOpen },
    { label: 'Profile', path: '/dashboard/profile', icon: UserCircle },
  ],
}

export default navConfig

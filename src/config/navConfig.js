import {
  LayoutDashboard,
  Layers,
  Calendar,
  ClipboardCheck,
  Megaphone,
  BookOpen,
  PieChart,
  Activity,
  Settings,
  Video,
  FileText,
  Users,
} from 'lucide-react'

const navConfig = {
  master_admin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Batches', path: '/dashboard/batches', icon: Layers },
    { label: 'Schedule', path: '/dashboard/schedule', icon: Calendar },
    { label: 'Attendance', path: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Notices', path: '/dashboard/notices', icon: Megaphone },
    { label: 'Resources', path: '/dashboard/resources', icon: BookOpen },
    { label: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { label: 'Activity Log', path: '/dashboard/logs', icon: Activity },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Batches', path: '/dashboard/batches', icon: Layers },
    { label: 'Schedule', path: '/dashboard/schedule', icon: Calendar },
    { label: 'Attendance', path: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Notices', path: '/dashboard/notices', icon: Megaphone },
    { label: 'Resources', path: '/dashboard/resources', icon: BookOpen },
    { label: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { label: 'Activity Log', path: '/dashboard/logs', icon: Activity },
  ],
  teacher: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Batches', path: '/dashboard/batches', icon: Layers },
    { label: 'Schedule', path: '/dashboard/schedule', icon: Calendar },
    { label: 'Attendance', path: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Notices', path: '/dashboard/notices', icon: Megaphone },
    { label: 'Resources', path: '/dashboard/resources', icon: BookOpen },
    { label: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { label: 'Tests', path: '/dashboard/tests', icon: FileText },
  ],
  student: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Batches', path: '/dashboard/batches', icon: Layers },
    { label: 'Schedule', path: '/dashboard/schedule', icon: Calendar },
    { label: 'Attendance', path: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Notices', path: '/dashboard/notices', icon: Megaphone },
    { label: 'Resources', path: '/dashboard/resources', icon: BookOpen },
    { label: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { label: 'Tests', path: '/dashboard/tests', icon: FileText },
  ],
}

export default navConfig
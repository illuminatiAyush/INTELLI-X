import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  PieChart,
  Settings,
  Layers,
  HelpCircle,
  Video,
  ClipboardCheck
} from 'lucide-react'

const navConfig = {
  master_admin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Batches', path: '/dashboard/batches', icon: Layers }, // Includes Institutes, Teachers, Students
    { label: 'Attendance', path: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Lectures', path: '/dashboard/lectures', icon: Video },
    { label: 'Tests', path: '/dashboard/tests', icon: FileText },
    { label: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { label: 'Materials', path: '/dashboard/materials', icon: BookOpen },

    { label: 'Settings', path: '/dashboard/settings', icon: Settings }, // Includes Logs, Subscriptions
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Batches', path: '/dashboard/batches', icon: Layers }, // Hub for Students, Teachers
    { label: 'Attendance', path: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Lectures', path: '/dashboard/lectures', icon: Video },
    { label: 'Tests', path: '/dashboard/tests', icon: FileText }, // Hub for Results, Leaderboard
    { label: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { label: 'Materials', path: '/dashboard/materials', icon: BookOpen },

    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  ],
  teacher: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Batches', path: '/dashboard/batches', icon: Layers },
    { label: 'Attendance', path: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Lectures', path: '/dashboard/lectures', icon: Video },
    { label: 'Tests', path: '/dashboard/tests', icon: FileText },
    { label: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { label: 'Materials', path: '/dashboard/materials', icon: BookOpen },

    { label: 'Settings', path: '/dashboard/profile', icon: Settings },
  ],
  student: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Batches', path: '/dashboard/batches', icon: Layers }, // Hub for "Join Batch" & My Batches
    { label: 'Attendance', path: '/dashboard/attendance', icon: ClipboardCheck },
    { label: 'Lectures', path: '/dashboard/lectures', icon: Video },
    { label: 'Tests', path: '/dashboard/tests', icon: FileText }, // Hub for "Active Tests", Results, Leaderboard
    { label: 'Analytics', path: '/dashboard/analytics', icon: PieChart },
    { label: 'Materials', path: '/dashboard/materials', icon: BookOpen },

    { label: 'Settings', path: '/dashboard/profile', icon: Settings },
  ],
}

export default navConfig

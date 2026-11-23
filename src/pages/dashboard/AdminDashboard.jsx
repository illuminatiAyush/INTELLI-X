import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import {
  Users,
  Layers,
  Calendar,
  ClipboardCheck,
  Megaphone,
  BookOpen,
  Activity,
  UserPlus,
  FolderPlus,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Download,
  ArrowRight,
  Plus,
  ExternalLink,
  ChevronRight,
  Radio,
  FileSpreadsheet,
} from 'lucide-react'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay },
})

// Sample fallback data if DB is cold
const FALLBACK_TODAYS_LECTURES = [
  {
    id: 'lec-1',
    batchName: 'Alpha JEE 2026',
    subject: 'Physics — Wave Optics & Interference',
    time: '09:00 AM – 10:30 AM',
    teacher: 'Prof. Verma',
    room: 'Hall A',
    status: 'Finished',
  },
  {
    id: 'lec-2',
    batchName: 'NEET Morning 2026',
    subject: 'Chemistry — Reaction Mechanisms',
    time: '11:00 AM – 12:30 PM',
    teacher: 'Dr. Ananya Ray',
    room: 'Room 204',
    status: 'In Progress',
  },
  {
    id: 'lec-3',
    batchName: 'Foundation Grade 10',
    subject: 'Mathematics — Quadratic Equations',
    time: '02:00 PM – 03:30 PM',
    teacher: 'Er. R. K. Gupta',
    room: 'Lab 1',
    status: 'Scheduled',
  },
  {
    id: 'lec-4',
    batchName: 'Alpha JEE 2026',
    subject: 'Mathematics — Definite Integration',
    time: '04:00 PM – 05:30 PM',
    teacher: 'Prof. S. Sen',
    room: 'Hall A',
    status: 'Scheduled',
  },
]

const FALLBACK_LOW_ATTENDANCE_STUDENTS = [
  {
    id: 'stu-1',
    name: 'Aarav Mehta',
    batch: 'Alpha JEE 2026',
    attendance: 68,
    parentName: 'Sanjay Mehta',
    parentPhone: '+91 98201 44521',
    missedCount: 7,
  },
  {
    id: 'stu-2',
    name: 'Riya Sen',
    batch: 'NEET Morning 2026',
    attendance: 71,
    parentName: 'Sunita Sen',
    parentPhone: '+91 97112 88910',
    missedCount: 6,
  },
  {
    id: 'stu-3',
    name: 'Kabir Joshi',
    batch: 'Foundation Grade 10',
    attendance: 64,
    parentName: 'Manoj Joshi',
    parentPhone: '+91 98334 11200',
    missedCount: 9,
  },
]

const FALLBACK_RECENT_ACTIVITY = [
  {
    id: 'act-1',
    type: 'attendance',
    title: 'Attendance Marked',
    description: 'Prof. Verma marked attendance for Alpha JEE 2026 (38 present, 4 absent).',
    time: '15m ago',
    icon: ClipboardCheck,
    color: 'emerald',
  },
  {
    id: 'act-2',
    type: 'schedule',
    title: 'Lecture Scheduled',
    description: 'Admin scheduled Advanced Mechanics in Lecture Hall A for tomorrow.',
    time: '1h ago',
    icon: Calendar,
    color: 'sky',
  },
  {
    id: 'act-3',
    type: 'resource',
    title: 'Resource Uploaded',
    description: 'Dr. Ananya Ray uploaded "Wave Optics Comprehensive Formula Sheet.pdf".',
    time: '3h ago',
    icon: BookOpen,
    color: 'amber',
  },
  {
    id: 'act-4',
    type: 'call',
    title: 'Parent Call Logged',
    description: 'Counselor logged parent intervention call for Aarav Mehta (68% attendance).',
    time: '4h ago',
    icon: Phone,
    color: 'fuchsia',
  },
]

const FALLBACK_NOTICES = [
  {
    id: 'not-1',
    title: 'Mid-Term Examination Datesheet & Guidelines',
    batchName: 'All Batches',
    content: 'The mid-term examination series begins next Monday. Seating matrix will be posted Friday.',
    urgent: true,
    time: '2h ago',
  },
  {
    id: 'not-2',
    title: 'Special Weekend Doubt Clearing Session: Organic Chemistry',
    batchName: 'Alpha JEE 2026',
    content: 'Dr. Ray will conduct an intensive doubt removal session on reaction mechanisms this Saturday.',
    urgent: false,
    time: 'Yesterday',
  },
  {
    id: 'not-3',
    title: 'National Science Olympiad Registration Deadline',
    batchName: 'Foundation Grade 10',
    content: 'Students eligible for Stage-1 examination must submit forms before Friday 5:00 PM.',
    urgent: false,
    time: '2 days ago',
  },
]

const AdminDashboard = () => {
  const { isDark } = useTheme()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [parentModal, setParentModal] = useState(null)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const displayName =
    profile?.name ||
    (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : null) ||
    'Admin'

  /* ── Query live statistics from Supabase ── */
  const { data: dashboardData, loading } = useAppQuery('admin-master-dashboard', async () => {
    const [studentsRes, batchesRes, lecturesRes, attendanceRes] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }),
      supabase.from('batches').select('id, name').limit(10),
      supabase.from('lectures').select('id, title, batch_id, scheduled_date, scheduled_hour, scheduled_min, status, batches(name, subject)').order('scheduled_date', { ascending: false }).limit(6),
      supabase.from('attendance').select('status, date'),
    ])

    const totalA = attendanceRes.data?.length || 0
    const presentA = attendanceRes.data?.filter((a) => a.status === 'present').length || 0
    const attendanceRate = totalA ? Math.round((presentA / totalA) * 100) : 88

    return {
      stats: {
        students: studentsRes.count || 248,
        batches: batchesRes.data?.length || 12,
        attendanceRate,
      },
      liveLectures: lecturesRes.data || [],
    }
  })

  const todaysLectures = FALLBACK_TODAYS_LECTURES
  const lowAttendanceStudents = FALLBACK_LOW_ATTENDANCE_STUDENTS
  const activityLogs = FALLBACK_RECENT_ACTIVITY
  const recentNotices = FALLBACK_NOTICES

  const handleCallParent = (student) => {
    setParentModal(student)
  }

  const handleDownloadReport = (student) => {
    toast.success(`Generating official attendance transcript for ${student.name}…`)
    setTimeout(() => {
      // Simulate file download
      const element = document.createElement('a')
      const file = new Blob([
        `INTELLI-X ACADEMIC PORTAL — ATTENDANCE SUMMARY\nStudent: ${student.name}\nBatch: ${student.batch}\nAttendance Rate: ${student.attendance}%\nMissed Sessions: ${student.missedCount}\nParent Contact: ${student.parentPhone} (${student.parentName})\nStatus: Sub-75% Academic Warning\nGenerated on: ${new Date().toLocaleString()}`
      ], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `${student.name.replace(/\s+/g, '_')}_Attendance_Report.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      toast.success('Transcript downloaded successfully!')
    }, 600)
  }

  return (
    <div className="space-y-8 pb-10">

      {/* ── Page Header & Greeting ── */}
      <motion.div {...fadeUp()} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dashboard-text tracking-tight font-heading">
            {getGreeting()}, {displayName.toLowerCase()}.
          </h1>
        </div>

        {/* Header Quick Links */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/dashboard/batches')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dashboard-card hover:bg-dashboard-card-hover border border-dashboard-border text-xs font-semibold text-dashboard-text transition-all shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-lime-600 dark:text-lime-400" />
            <span>New Batch</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/attendance')}
            className="dashboard-btn-primary text-xs"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: TODAY'S LECTURES (Horizontal Cards)
          ══════════════════════════════════════════════════════════════ */}
      <motion.section {...fadeUp(0.05)} className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-lime-400/15 text-lime-400">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-dashboard-text">
              Today's Lectures
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-dashboard-border-light text-dashboard-text-secondary font-medium">
              {todaysLectures.length} Scheduled
            </span>
          </div>

          <Link
            to="/dashboard/schedule"
            className="text-xs font-semibold text-lime-600 dark:text-lime-400 hover:underline inline-flex items-center gap-1 group"
          >
            <span>View Full Schedule</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Horizontal Lecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {todaysLectures.map((lec) => (
            <div
              key={lec.id}
              onClick={() => navigate('/dashboard/schedule')}
              className="dashboard-card hover:border-dashboard-border-light transition-all p-4 flex flex-col justify-between space-y-3 cursor-pointer group"
            >
              <div className="space-y-2">
                {/* Top Badge: Batch Name & Live Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-dashboard-border-light text-dashboard-text truncate max-w-[130px]">
                    {lec.batchName}
                  </span>

                  {/* Status Badges */}
                  {lec.status === 'Finished' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300/60 dark:border-zinc-700/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Finished
                    </span>
                  )}
                  {lec.status === 'In Progress' && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      In Progress
                    </span>
                  )}
                  {lec.status === 'Scheduled' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/25">
                      <Clock className="w-3 h-3" /> Scheduled
                    </span>
                  )}
                </div>

                {/* Subject & Topic */}
                <h3 className="text-sm font-semibold text-dashboard-text tracking-tight group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors line-clamp-2">
                  {lec.subject}
                </h3>
              </div>

              {/* Time & Room Footer */}
              <div className="pt-2 border-t border-dashboard-border flex items-center justify-between text-xs text-dashboard-text-secondary">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-dashboard-text-muted" />
                  {lec.time}
                </span>
                <span className="text-[11px] font-medium text-dashboard-text-muted">
                  {lec.room}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: ATTENDANCE OVERVIEW (Metrics, Pending & Watchlist)
          ══════════════════════════════════════════════════════════════ */}
      <motion.section {...fadeUp(0.1)} className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-lime-400/15 text-lime-400">
              <ClipboardCheck className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-dashboard-text">
              Attendance Overview
            </h2>
          </div>

          <Link
            to="/dashboard/attendance"
            className="text-xs font-semibold text-lime-600 dark:text-lime-400 hover:underline inline-flex items-center gap-1 group"
          >
            <span>Attendance Terminal</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid: 2 Metric Cards on Left + Sub-75% Risk Watchlist on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* Left Column (5 Cols): Daily Stats + Pending Sessions */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Today's Key Metrics */}
            <div className="grid grid-cols-2 gap-3.5 flex-1">
              {/* Metric 1: Average Attendance Today */}
              <div className="dashboard-card p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-dashboard-text-secondary uppercase tracking-wider">
                    Today's Attendance
                  </span>
                  <div className="text-3xl font-extrabold text-dashboard-text tracking-tight mt-1 flex items-baseline gap-1.5 font-heading">
                    88.4%
                    <span className="text-[11px] font-mono text-emerald-500 font-normal">
                      +2.1%
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full h-1.5 rounded-full bg-dashboard-border-light overflow-hidden">
                    <div className="h-full bg-lime-500 dark:bg-lime-400 rounded-full" style={{ width: '88.4%' }} />
                  </div>
                </div>
              </div>

              {/* Metric 2: Completed Sessions */}
              <div className="dashboard-card p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-dashboard-text-secondary uppercase tracking-wider">
                    Completed Sessions
                  </span>
                  <div className="text-3xl font-extrabold text-dashboard-text tracking-tight mt-1 font-heading">
                    2 <span className="text-lg font-normal text-dashboard-text-muted">/ 4</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full h-1.5 rounded-full bg-dashboard-border-light overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Attendance Box */}
            <div className="dashboard-card p-4 border-amber-500/30 bg-amber-500/[0.03]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-dashboard-text">
                    Pending Attendance Marking
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-semibold">
                  1 Session Waiting
                </span>
              </div>

              <div className="p-3 rounded-xl bg-dashboard-card border border-dashboard-border flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-dashboard-text truncate">
                    NEET Morning 2026 — Chemistry
                  </p>
                  <p className="text-[11px] text-dashboard-text-secondary mt-0.5">
                    11:00 AM – 12:30 PM • 42 Candidates enrolled
                  </p>
                </div>

                <button
                  onClick={() => navigate('/dashboard/attendance')}
                  className="px-3 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs shrink-0 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Mark Attendance</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column (7 Cols): Low Attendance Watchlist (Sub-75%) */}
          <div className="lg:col-span-7 dashboard-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-dashboard-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-dashboard-text tracking-tight">
                    Low Attendance Watchlist (Sub-75%)
                  </h3>
                </div>

                <span className="text-xs font-mono font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                  {lowAttendanceStudents.length} Flagged
                </span>
              </div>

              {/* Watchlist Table */}
              <div className="space-y-2.5">
                {lowAttendanceStudents.map((student) => (
                  <div
                    key={student.id}
                    className="p-3 rounded-xl bg-dashboard-border-light/40 border border-dashboard-border hover:border-dashboard-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 text-dashboard-text font-bold text-xs flex items-center justify-center shrink-0">
                        {student.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-dashboard-text">
                            {student.name}
                          </p>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-rose-500/15 text-rose-500">
                            {student.attendance}% Rate
                          </span>
                        </div>
                        <p className="text-[11px] text-dashboard-text-secondary mt-0.5">
                          {student.batch} • {student.missedCount} Missed Classes
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleCallParent(student)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dashboard-card hover:bg-dashboard-card-hover border border-dashboard-border text-xs font-medium text-dashboard-text transition-all hover:text-emerald-500 hover:border-emerald-500/40"
                        title="Call Parent"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Call Parent</span>
                      </button>

                      <button
                        onClick={() => handleDownloadReport(student)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dashboard-card hover:bg-dashboard-card-hover border border-dashboard-border text-xs font-medium text-dashboard-text transition-all hover:text-sky-500 hover:border-sky-500/40"
                        title="Download Attendance Report"
                      >
                        <Download className="w-3.5 h-3.5 text-sky-500" />
                        <span>Report</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-dashboard-border flex items-center justify-end text-xs">
              <Link to="/dashboard/attendance" className="text-lime-600 dark:text-lime-400 font-medium hover:underline">
                View All Roster →
              </Link>
            </div>
          </div>

        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 & 4: RECENT ACTIVITY LOG & RECENT NOTICES
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── SECTION 3: RECENT ACTIVITY LOG (7 COLS) ── */}
        <motion.section {...fadeUp(0.15)} className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-lime-400/15 text-lime-400">
                <Activity className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-dashboard-text">
                Recent Activity Log
              </h2>
            </div>

            <Link
              to="/dashboard/logs"
              className="text-xs font-semibold text-lime-600 dark:text-lime-400 hover:underline inline-flex items-center gap-1 group"
            >
              <span>Full Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="dashboard-card p-5">
            <div className="space-y-4">
              {activityLogs.map((act, index) => {
                const IconComponent = act.icon
                return (
                  <div key={act.id} className="relative flex items-start gap-3.5">
                    {/* Connecting Timeline Line */}
                    {index < activityLogs.length - 1 && (
                      <div className="absolute left-[17px] top-[34px] bottom-[-16px] w-[2px] bg-dashboard-border" />
                    )}

                    {/* Timeline Node Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 z-10 ${
                        act.color === 'emerald'
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/25'
                          : act.color === 'sky'
                          ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-500/25'
                          : act.color === 'amber'
                          ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/25'
                          : 'bg-fuchsia-50 dark:bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200/80 dark:border-fuchsia-500/25'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" strokeWidth={2.2} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-dashboard-text tracking-tight">
                          {act.title}
                        </p>
                        <span className="text-[11px] font-mono text-dashboard-text-muted shrink-0">
                          {act.time}
                        </span>
                      </div>
                      <p className="text-xs text-dashboard-text-secondary mt-1 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-4 mt-4 border-t border-dashboard-border flex items-center justify-end text-xs">
              <Link to="/dashboard/logs" className="text-lime-600 dark:text-lime-400 font-medium hover:underline">
                View 30-day activity →
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ── SECTION 4: RECENT NOTICES (5 COLS) ── */}
        <motion.section {...fadeUp(0.2)} className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-lime-400/15 text-lime-400">
                <Megaphone className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-dashboard-text">
                Recent Notices
              </h2>
            </div>

            <Link
              to="/dashboard/notices"
              className="text-xs font-semibold text-lime-600 dark:text-lime-400 hover:underline inline-flex items-center gap-1 group"
            >
              <span>All Bulletins</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="dashboard-card p-5 space-y-3.5">
            {recentNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => navigate('/dashboard/notices')}
                className={`p-3.5 rounded-xl border bg-dashboard-border-light/30 hover:border-dashboard-border-light transition-all cursor-pointer ${
                  notice.urgent
                    ? 'border-amber-500/35 bg-amber-500/[0.04]'
                    : 'border-dashboard-border'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-dashboard-card text-dashboard-text-secondary border border-dashboard-border">
                    {notice.batchName}
                  </span>
                  {notice.urgent && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-dashboard-text-muted ml-auto">
                    {notice.time}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-dashboard-text leading-snug tracking-tight">
                  {notice.title}
                </h4>

                <p className="text-[11px] text-dashboard-text-secondary line-clamp-2 mt-1 leading-relaxed">
                  {notice.content}
                </p>
              </div>
            ))}

            <button
              onClick={() => navigate('/dashboard/notices')}
              className="w-full py-2.5 rounded-xl border border-dashed border-dashboard-border hover:border-lime-500/50 hover:bg-lime-500/[0.04] text-xs font-semibold text-dashboard-text-secondary hover:text-lime-600 dark:hover:text-lime-400 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Broadcast New Circular</span>
            </button>
          </div>
        </motion.section>

      </div>

      {/* ── Parent Call Modal ── */}
      <AnimatePresence>
        {parentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setParentModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-dashboard-card border border-dashboard-border rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dashboard-text">
                    Parent Contact Dial
                  </h3>
                  <p className="text-xs text-dashboard-text-secondary">
                    {parentModal.name} • {parentModal.batch}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-dashboard-border-light/60 border border-dashboard-border space-y-1">
                <div className="text-[11px] font-mono uppercase text-dashboard-text-muted">
                  Guardian: {parentModal.parentName}
                </div>
                <div className="text-lg font-mono font-bold text-dashboard-text">
                  {parentModal.parentPhone}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setParentModal(null)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-dashboard-border text-dashboard-text hover:bg-dashboard-card-hover transition-colors"
                >
                  Close
                </button>
                <a
                  href={`tel:${parentModal.parentPhone}`}
                  onClick={() => {
                    toast.success(`Initiating dialer to ${parentModal.parentName}…`)
                    setParentModal(null)
                  }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default AdminDashboard
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone,
  Plus,
  Send,
  X,
  AlertCircle,
  Calendar,
  Users,
  Filter,
  CheckCircle2,
  Clock,
  Pin,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

const INITIAL_NOTICES = [
  {
    id: 'n-1',
    title: 'Mid-Term Examination Datesheet & Guidelines',
    batchName: 'All Batches',
    batchId: 'all',
    content: 'The mid-term examination series begins next Monday. Hall tickets and seating allocations will be released on Thursday. Please ensure all syllabus revisions are completed.',
    urgent: true,
    pinned: true,
    author: 'Academic Directorate',
    createdAt: 'Today, 10:30 AM',
  },
  {
    id: 'n-2',
    title: 'Special Weekend Doubt Clearing Session: Organic Chemistry',
    batchName: 'Alpha JEE 2026',
    batchId: 'batch-1',
    content: 'Dr. Verma will conduct a 3-hour intensive session covering Reaction Mechanisms and Stereochemistry this Saturday from 02:00 PM to 05:00 PM in Lecture Hall A.',
    urgent: false,
    pinned: false,
    author: 'Faculty of Chemistry',
    createdAt: 'Yesterday, 04:15 PM',
  },
  {
    id: 'n-3',
    title: 'National Science Olympiad Registration Deadline',
    batchName: 'Foundation Grade 10',
    batchId: 'batch-2',
    content: 'Candidates aiming to appear for the Stage-1 exam must submit their nomination forms and authorization slip by 5:00 PM this Friday.',
    urgent: false,
    pinned: false,
    author: 'Student Affairs',
    createdAt: '2 days ago',
  },
  {
    id: 'n-4',
    title: 'Library Extended Hours During Assessment Week',
    batchName: 'All Batches',
    batchId: 'all',
    content: 'The digital study lab and quiet reading room will remain open until 09:30 PM on weekdays throughout the examination block.',
    urgent: false,
    pinned: false,
    author: 'Administration',
    createdAt: '3 days ago',
  },
]

const NoticesPage = () => {
  const { role } = useAuth()
  const { isDark } = useTheme()

  const [notices, setNotices] = useState(INITIAL_NOTICES)
  const [filterBatch, setFilterBatch] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)

  const [form, setForm] = useState({
    title: '',
    batchName: 'All Batches',
    content: '',
    urgent: false,
  })

  const canPublish = role === 'admin' || role === 'master_admin' || role === 'teacher'

  const filteredNotices =
    filterBatch === 'all'
      ? notices
      : notices.filter((n) => n.batchId === 'all' || n.batchId === filterBatch)

  const handlePublish = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Please enter a title and notice announcement body.')
      return
    }

    const newNotice = {
      id: `n-${Date.now()}`,
      title: form.title.trim(),
      batchName: form.batchName,
      batchId: form.batchName === 'All Batches' ? 'all' : 'batch-custom',
      content: form.content.trim(),
      urgent: form.urgent,
      pinned: false,
      author: role === 'teacher' ? 'Faculty' : 'Administration',
      createdAt: 'Just now',
    }

    setNotices([newNotice, ...notices])
    setForm({ title: '', batchName: 'All Batches', content: '', urgent: false })
    setModalOpen(false)
    toast.success('Notice published to student broadcast feed!')
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dashboard-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-lime-400/15 text-lime-400">
              <Megaphone className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-dashboard-text">
              Notices & Bulletins
            </h1>
          </div>
          <p className="text-xs text-dashboard-text-secondary">
            Official announcements, examination schedules, and cohort broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="text-xs px-3 py-2 bg-dashboard-card border border-dashboard-border rounded-lg text-dashboard-text focus:outline-none focus:border-dashboard-primary transition-colors"
          >
            <option value="all">All Cohorts & Batches</option>
            <option value="batch-1">Alpha JEE 2026</option>
            <option value="batch-2">Foundation Grade 10</option>
          </select>

          {canPublish && (
            <button
              onClick={() => setModalOpen(true)}
              className="dashboard-btn-primary text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Notice</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Notices Feed ── */}
      <div className="space-y-4 max-w-4xl">
        {filteredNotices.map((n) => (
          <div
            key={n.id}
            className={`p-5 rounded-xl border bg-dashboard-card transition-all ${
              n.urgent
                ? 'border-amber-500/40 shadow-sm shadow-amber-500/5'
                : 'border-dashboard-border hover:border-dashboard-border-light'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-dashboard-border-light text-dashboard-text-secondary font-medium">
                    {n.batchName}
                  </span>
                  {n.urgent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-semibold">
                      <AlertCircle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                  {n.pinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-lime-400/15 text-lime-400 font-semibold">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-dashboard-text tracking-tight">
                  {n.title}
                </h3>

                <p className="text-sm text-dashboard-text-secondary leading-relaxed">
                  {n.content}
                </p>

                <div className="pt-2 flex items-center gap-4 text-xs text-dashboard-text-muted">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {n.createdAt}
                  </span>
                  <span>•</span>
                  <span>Issued by {n.author}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Publish Notice Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-dashboard-card border border-dashboard-border rounded-2xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-dashboard-border pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-lime-400" />
                  <h3 className="text-lg font-bold text-dashboard-text">
                    Broadcast Announcement
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-dashboard-text-muted hover:text-dashboard-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePublish} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dashboard-text">
                    Notice Title
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Schedule Revision for Chemistry Lab"
                    className="dashboard-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dashboard-text">
                    Target Cohort
                  </label>
                  <select
                    value={form.batchName}
                    onChange={(e) => setForm({ ...form, batchName: e.target.value })}
                    className="dashboard-input"
                  >
                    <option value="All Batches">All Batches (General Broadcast)</option>
                    <option value="Alpha JEE 2026">Alpha JEE 2026</option>
                    <option value="Foundation Grade 10">Foundation Grade 10</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dashboard-text">
                    Announcement Body
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Type the full announcement details here…"
                    className="dashboard-input"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="urgentNotice"
                    checked={form.urgent}
                    onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                    className="rounded border-dashboard-border accent-lime-400 w-4 h-4"
                  />
                  <label
                    htmlFor="urgentNotice"
                    className="text-xs font-medium text-dashboard-text cursor-pointer"
                  >
                    Mark as Urgent (Flags red notification to student portal)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-dashboard-border">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-dashboard-text-secondary hover:text-dashboard-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="dashboard-btn-primary text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Announcement</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NoticesPage
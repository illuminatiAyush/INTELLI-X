import { motion } from 'framer-motion'
import { Video, Clock, CheckCircle2, Play, AlertTriangle, Users, Calendar, Loader2 } from 'lucide-react'

const LectureCard = ({ lecture, role, onStatusChange, onOpenAttendance, onJoin, isJoining = false }) => {
  const isLive = lecture.status === 'live'
  const isScheduled = lecture.status === 'scheduled'
  const isCompleted = lecture.status === 'completed'
  const isCancelled = lecture.status === 'cancelled'
  const canManage = role === 'admin' || role === 'teacher'

  const statusBadge = () => {
    if (isLive) return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 text-[11px] font-bold rounded-full border border-red-500/20 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> LIVE
      </span>
    )
    if (isScheduled) return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[11px] font-bold rounded-full border border-amber-500/20">
        <Clock className="w-3 h-3" /> Upcoming
      </span>
    )
    if (isCompleted) return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 text-[11px] font-bold rounded-full border border-green-500/20">
        <CheckCircle2 className="w-3 h-3" /> Done
      </span>
    )
    if (isCancelled) return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--border-subtle)] text-gray-400 text-[11px] font-bold rounded-full border border-gray-200">
        <AlertTriangle className="w-3 h-3" /> Cancelled
      </span>
    )
  }

  const timeDisplay = () => {
    if (isScheduled && lecture.scheduled_at)
      return new Date(lecture.scheduled_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    if (isLive) return 'Live right now'
    if (isCompleted && lecture.end_time)
      return `Ended ${new Date(lecture.end_time).toLocaleDateString()}`
    if (isCancelled) return 'Cancelled'
    return '—'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col rounded-2xl border transition-all overflow-hidden ${
        isLive
          ? 'bg-red-500/5 border-red-500/20'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Card header */}
      <div className="p-5 flex-1">
        {/* Top row: icon + status badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isLive ? 'bg-red-500 text-white' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <Video className="w-5 h-5" />
          </div>
          {statusBadge()}
        </div>

        {/* Title — truncated to 2 lines */}
        <h3
          className="text-sm font-bold text-gray-900 leading-snug mb-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {lecture.title}
        </h3>

        {/* Batch */}
        <p className="text-xs text-gray-600 mb-3">
          {lecture.batches?.name || 'Unknown Batch'}
        </p>

        {/* Time */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{timeDisplay()}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Actions */}
      <div className="p-3 flex gap-2">
        {isScheduled && canManage && (
          <>
            <button
              onClick={() => onStatusChange(lecture.id, 'live')}
              className="flex-1 py-2 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{ background: '#6366f1', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}
            >
              <Play className="w-3.5 h-3.5" /> Start
            </button>
            <button
              onClick={() => onStatusChange(lecture.id, 'cancelled')}
              className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-all"
            >
              Cancel
            </button>
          </>
        )}

        {isLive && canManage && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2">
              <button
                onClick={() => onOpenAttendance()}
                className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Users className="w-3.5 h-3.5" /> Attendance
              </button>
              <button
                onClick={() => onStatusChange(lecture.id, 'completed')}
                className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-all active:scale-95"
              >
                End
              </button>
            </div>
            <button
              className="w-full py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onJoin && onJoin(lecture)}
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Join Live Class
                </>
              )}
            </button>
          </div>
        )}

        {isLive && role === 'student' && (
          <button
            className="w-full py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onJoin && onJoin(lecture)}
            disabled={isJoining}
          >
            {isJoining ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Join Live Class
              </>
            )}
          </button>
        )}

        {isScheduled && role === 'student' && (
          <div className="w-full py-2 bg-white border border-gray-200 text-gray-400 text-xs font-semibold rounded-lg flex items-center justify-center">
            Waiting to start…
          </div>
        )}

        {(isCompleted || isCancelled) && canManage && (
          <button
            onClick={() => onOpenAttendance()}
            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all"
          >
            View Attendance
          </button>
        )}

        {(isCompleted || isCancelled) && role === 'student' && (
          <div className="w-full py-2 bg-white border border-gray-200 text-gray-400 text-xs font-semibold rounded-lg flex items-center justify-center">
            {isCompleted ? 'Class ended' : 'Cancelled'}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default LectureCard

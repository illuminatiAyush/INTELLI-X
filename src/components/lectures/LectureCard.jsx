import { motion } from 'framer-motion'
import { Video, Clock, CheckCircle2, Play, AlertTriangle, Users } from 'lucide-react'

const LectureCard = ({ lecture, role, onStatusChange, onOpenAttendance }) => {
  const isLive = lecture.status === 'live'
  const isScheduled = lecture.status === 'scheduled'
  const isCompleted = lecture.status === 'completed'
  const isCancelled = lecture.status === 'cancelled'

  const canManage = role === 'admin' || role === 'teacher'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 rounded-[2rem] border transition-all ${
        isLive 
          ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
      }`}
    >
      {/* Status Badge */}
      <div className="absolute top-6 right-6">
        {isLive && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full border border-red-500/20 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" /> LIVE
          </span>
        )}
        {isScheduled && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Scheduled
          </span>
        )}
        {isCompleted && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        )}
        {isCancelled && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] text-xs font-bold rounded-full border border-[var(--border-subtle)]">
            <AlertTriangle className="w-3.5 h-3.5" /> Cancelled
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          isLive ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-[var(--text-primary)]/5 text-[var(--text-primary)]'
        }`}>
          <Video className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{lecture.title}</h3>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">{lecture.batches?.name || 'Unknown Batch'}</p>
        </div>
      </div>

      <div className="space-y-2 mb-6 text-sm text-[var(--text-secondary)] font-medium">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>
            {isScheduled && lecture.scheduled_at ? new Date(lecture.scheduled_at).toLocaleString() : ''}
            {isLive && lecture.start_time ? `Started: ${new Date(lecture.start_time).toLocaleTimeString()}` : ''}
            {isCompleted && lecture.end_time ? `Ended: ${new Date(lecture.end_time).toLocaleString()}` : ''}
            {!lecture.scheduled_at && !lecture.start_time && !lecture.end_time && 'Instant Lecture'}
          </span>
        </div>
        {canManage && lecture.profiles?.name && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Teacher: {lecture.profiles.name}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isScheduled && canManage && (
          <>
            <button 
              onClick={() => onStatusChange(lecture.id, 'live')}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Play className="w-4 h-4" /> Start
            </button>
            <button 
              onClick={() => onStatusChange(lecture.id, 'cancelled')}
              className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
          </>
        )}

        {isLive && canManage && (
          <>
            <button 
              onClick={() => onOpenAttendance()}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Users className="w-4 h-4" /> Mark Attendance
            </button>
            <button 
              onClick={() => onStatusChange(lecture.id, 'completed')}
              className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-all active:scale-95"
            >
              End Lecture
            </button>
          </>
        )}

        {isLive && role === 'student' && (
          <button className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all active:scale-95">
            <Play className="w-4 h-4 fill-current" /> Join Live Class
          </button>
        )}
        
        {isScheduled && role === 'student' && (
          <div className="w-full py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold rounded-xl flex items-center justify-center gap-2">
            Waiting to Start...
          </div>
        )}
        
        {(isCompleted || isCancelled) && canManage && (
          <button 
            onClick={() => onOpenAttendance()}
            className="w-full py-2.5 bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 text-[var(--text-primary)] border border-[var(--border-subtle)] font-bold rounded-xl transition-all"
          >
            View Attendance
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default LectureCard

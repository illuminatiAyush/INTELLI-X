import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { changePassword } from '../../services/profileService'

const ChangePassword = () => {
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' })
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false })
  const [status, setStatus] = useState({ type: '', message: '' }) // 'success' | 'error'
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setStatus({ type: '', message: '' })
  }

  const toggleShow = (field) => {
    setShowPwd((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const validate = () => {
    if (!form.current || !form.newPwd || !form.confirm) {
      return 'All fields are required.'
    }
    if (form.newPwd.length < 6) {
      return 'New password must be at least 6 characters.'
    }
    if (form.newPwd === form.current) {
      return 'New password must differ from current password.'
    }
    if (form.newPwd !== form.confirm) {
      return 'Passwords do not match.'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setStatus({ type: 'error', message: err })
      return
    }

    setSubmitting(true)
    try {
      await changePassword(form.newPwd)
      setStatus({ type: 'success', message: 'Password updated successfully!' })
      setForm({ current: '', newPwd: '', confirm: '' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update password.' })
    } finally {
      setSubmitting(false)
    }
  }

  const fields = [
    { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
    { key: 'newPwd', label: 'New Password', placeholder: 'Min 6 characters' },
    { key: 'confirm', label: 'Confirm Password', placeholder: 'Re-enter new password' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Change Password</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              {f.label}
            </label>
            <div className="relative">
              <input
                type={showPwd[f.key] ? 'text' : 'password'}
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-medium placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => toggleShow(f.key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showPwd[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}

        {/* Status message */}
        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${ status.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {status.message}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-white hover:bg-gray-200 text-black text-sm font-bold shadow-[0_8px_30px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating…
            </span>
          ) : (
            'Update Password'
          )}
        </button>
      </form>
    </motion.div>
  )
}

export default ChangePassword

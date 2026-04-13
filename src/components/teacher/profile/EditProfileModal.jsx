import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import Modal from '../../ui/Modal'
import { updateTeacherProfile } from '../../../services/teacherProfileService'

const EditProfileModal = ({ isOpen, onClose, teacher, profile, onSaved }) => {
  const [form, setForm] = useState({ name: '', subject: '', experience: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  // Pre-fill form when modal opens
  useEffect(() => {
    if (isOpen && teacher) {
      const fullName = profile?.first_name
        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
        : teacher?.name || ''
      setForm({
        name: fullName,
        subject: teacher.subject || '',
        experience: teacher.experience ?? '',
        phone: teacher.phone || '',
      })
      setStatus({ type: '', message: '' })
    }
  }, [isOpen, teacher, profile])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setStatus({ type: '', message: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      setStatus({ type: 'error', message: 'Name is required.' })
      return
    }

    setSubmitting(true)
    try {
      await updateTeacherProfile(teacher.id, teacher.profile_id, {
        name: form.name.trim(),
        subject: form.subject.trim(),
        experience: form.experience !== '' ? Number(form.experience) : null,
        phone: form.phone.trim(),
      })
      setStatus({ type: 'success', message: 'Profile updated successfully!' })
      // Notify parent to refresh data
      if (onSaved) setTimeout(() => { onSaved(); onClose() }, 800)
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to update profile.' })
    } finally {
      setSubmitting(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. Dr. Sharma' },
    { key: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g. Physics' },
    { key: 'experience', label: 'Experience (years)', type: 'number', placeholder: 'e.g. 5' },
    { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'e.g. +91 9876543210' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              {f.label}
            </label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-medium placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--text-primary)] focus:ring-1 focus:ring-white/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        ))}

        {/* Status */}
        {status.message && (
          <div
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
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-gray-200 text-black text-sm font-bold shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditProfileModal

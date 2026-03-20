import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, Building2, Mail, Phone, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const SettingsPage = () => {
  const { isDark } = useTheme()
  const { role, profile } = useAuth()
  const [institute, setInstitute] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', owner_name: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchInstitute()
  }, [profile])

  const fetchInstitute = async () => {
    try {
      if (!profile?.institute_id) { setLoading(false); return }
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .eq('id', profile.institute_id)
        .single()
      if (error) throw error
      if (data) {
        setInstitute(data)
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          owner_name: data.owner_name || '',
        })
      }
    } catch (err) {
      console.error('Error fetching institute:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!institute) return
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase
        .from('institutes')
        .update(form)
        .eq('id', institute.id)
      if (error) throw error
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error saving: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--color-purple)]/30 border-t-[var(--color-purple)] rounded-full animate-spin" />
      </div>
    )
  }

  const isMaster = role === 'master_admin'

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          {isMaster ? 'Platform Settings' : 'Institute Settings'}
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
          {isMaster ? 'Manage global platform configurations' : 'Manage your institute details'}
        </p>
      </div>

      {!institute && !isMaster ? (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
          <p className="text-[var(--text-secondary)]">No institute linked to your profile.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[var(--color-purple)]/10 text-[var(--color-purple)]">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Institute Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                <Building2 className="w-4 h-4" /> Institute Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={isMaster}
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white focus:border-purple-500/40'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-purple-400'
                } ${isMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                <User className="w-4 h-4" /> Owner Name
              </label>
              <input
                type="text"
                value={form.owner_name}
                onChange={e => setForm({ ...form, owner_name: e.target.value })}
                disabled={isMaster}
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white focus:border-purple-500/40'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-purple-400'
                } ${isMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                disabled={isMaster}
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white focus:border-purple-500/40'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-purple-400'
                } ${isMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
                <Phone className="w-4 h-4" /> Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                disabled={isMaster}
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white focus:border-purple-500/40'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-purple-400'
                } ${isMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {!isMaster && (
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {message && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-sm font-medium ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}
                >
                  {message}
                </motion.p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default SettingsPage

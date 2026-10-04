import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, Building2, Mail, Phone, User, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'
import ChangePassword from '../../components/profile/ChangePassword'

const SettingsPage = () => {
  const { isDark } = useTheme()
  const { role, profile, user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', owner_name: '' })
  const [studentForm, setStudentForm] = useState({ first_name: '', last_name: '', email: '' })

  const { data: institute, loading: instituteLoading } = useAppQuery(`institute-settings-${profile?.institute_id}`, async () => {
    if (!profile?.institute_id || role === 'student') return null
    const { data, error } = await supabase.from('institutes').select('*').eq('id', profile.institute_id).single()
    if (error) throw error
    return data
  }, { enabled: !!profile?.institute_id && role !== 'student' })

  useEffect(() => {
    if (institute) {
      setForm({
        name: institute.name || '',
        email: institute.email || '',
        phone: institute.phone || '',
        owner_name: institute.owner_name || '',
      })
    }
  }, [institute])

  useEffect(() => {
    if (role === 'student' && profile && user) {
      setStudentForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: user.email || '',
      })
    }
  }, [profile, user, role])

  const loading = instituteLoading && !institute

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

  const handleStudentSave = async () => {
    if (!profile) return
    setSaving(true)
    setMessage('')
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: studentForm.first_name,
          last_name: studentForm.last_name,
        })
        .eq('id', profile.id)

      if (profileError) throw profileError

      // Update email if changed
      if (studentForm.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ 
          email: studentForm.email 
        })
        if (emailError) throw emailError
      }

      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error saving: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  const isMaster = role === 'master_admin'
  const isStudent = role === 'student'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {isMaster ? 'Platform Settings' : isStudent ? 'Account Settings' : 'Settings'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {isMaster ? 'Manage global platform configurations' : 
           isStudent ? 'Manage your personal account information' :
           'Manage your institute details'}
        </p>
      </div>

      {/* Student Settings */}
      {isStudent && (
        <>
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <User className="w-4 h-4" /> First Name
                </label>
                <input
                  type="text"
                  value={studentForm.first_name}
                  onChange={e => setStudentForm({ ...studentForm, first_name: e.target.value })}
                  className="dashboard-input"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <User className="w-4 h-4" /> Last Name
                </label>
                <input
                  type="text"
                  value={studentForm.last_name}
                  onChange={e => setStudentForm({ ...studentForm, last_name: e.target.value })}
                  className="dashboard-input"
                  placeholder="Enter your last name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="dashboard-input"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 pt-6 border-t border-gray-100">
              <button
                onClick={handleStudentSave}
                disabled={saving}
                className="dashboard-btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {message && (
                <p className={`text-sm font-medium ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* Password Section for Students */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            </div>
            <ChangePassword />
          </div>
        </>
      )}

      {/* Institute Settings for Admin/Teacher */}
      {!isStudent && (
        <>
          {!institute && !isMaster ? (
            <div className="dashboard-card text-center py-12">
              <p className="text-gray-600">No institute linked to your profile.</p>
            </div>
          ) : (
            <div className="dashboard-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                  <Settings className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Institute Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <Building2 className="w-4 h-4" /> Institute Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    disabled={isMaster}
                    className={`dashboard-input ${isMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <User className="w-4 h-4" /> Owner Name
                  </label>
                  <input
                    type="text"
                    value={form.owner_name}
                    onChange={e => setForm({ ...form, owner_name: e.target.value })}
                    disabled={isMaster}
                    className={`dashboard-input ${isMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <Mail className="w-4 h-4" /> Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    disabled={isMaster}
                    className={`dashboard-input ${isMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <Phone className="w-4 h-4" /> Phone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    disabled={isMaster}
                    className={`dashboard-input ${isMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              {!isMaster && (
                <div className="mt-6 flex items-center gap-4 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="dashboard-btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {message && (
                    <p className={`text-sm font-medium ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                      {message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Password Section for Admin/Teacher */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Account Security</h2>
            </div>
            <ChangePassword />
          </div>
        </>
      )}
    </div>
  )
}

export default SettingsPage

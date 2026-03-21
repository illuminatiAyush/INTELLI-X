import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Search, Edit2, Trash2, Building2, UserPlus, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { createPortal } from 'react-dom'

const InstitutesPage = () => {
  const { isDark } = useTheme()
  const [institutes, setInstitutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    owner_name: '',
    admin_email: '',
    admin_password: '',
  })

  useEffect(() => {
    fetchInstitutes()
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchInstitutes = async () => {
    try {
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInstitutes(data || [])
    } catch (error) {
      console.error('Error fetching institutes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Edge Function handles the entire atomic operation:
      // 1. Create auth user → 2. Create institute → 3. Create/update profile → 4. Set owner_id
      const { data, error: invokeError } = await supabase.functions.invoke('create-institute-admin', {
        body: {
          admin_email: formData.admin_email,
          admin_password: formData.admin_password,
          institute_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          owner_name: formData.owner_name,
        }
      })

      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to create institute')
      }
      if (data?.error) {
        throw new Error(data.error)
      }

      setToast({ type: 'success', message: `"${formData.name}" created with admin account!` })
      setShowModal(false)
      setFormData({ name: '', email: '', phone: '', owner_name: '', admin_email: '', admin_password: '' })
      fetchInstitutes()
    } catch (error) {
      console.error('Error creating institute:', error)
      setToast({ type: 'error', message: error.message || 'Error creating institute' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this institute?')) return
    try {
      const { error } = await supabase.from('institutes').delete().eq('id', id)
      if (error) throw error
      setToast({ type: 'success', message: 'Institute deleted' })
      fetchInstitutes()
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Delete failed' })
    }
  }

  const filteredInstitutes = institutes.filter(inst =>
    inst.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className={`${isDark ? 'text-white' : 'text-gray-900'} text-center py-10`}>Loading institutes...</div>

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium ${toast.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : toast.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
          >
            Registered Institutes
          </motion.h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Manage coaching centers across the platform</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-5 py-2.5 bg-[var(--color-purple)] text-white rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-purple-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Institute
        </button>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-app)]/50">
          <div className="relative w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search institutes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] rounded-xl focus:outline-none focus:border-[var(--color-purple)] transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-app)]/50 text-[var(--text-secondary)] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5 font-bold">Institute Name</th>
                <th className="px-6 py-5 font-bold">Owner</th>
                <th className="px-6 py-5 font-bold">Email</th>
                <th className="px-6 py-5 font-bold">Join Code</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredInstitutes.map((inst) => (
                <tr key={inst.id} className="hover:bg-[var(--bg-app)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="p-2.5 bg-[var(--color-purple)]/10 rounded-xl mr-3 group-hover:scale-110 transition-transform">
                        <Building2 className="w-5 h-5 text-[var(--color-purple)]" />
                      </div>
                      <span className="font-semibold text-[var(--text-primary)]">{inst.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">{inst.owner_name || '-'}</td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">{inst.email || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="bg-[var(--color-purple)]/10 text-[var(--color-purple)] border border-[var(--color-purple)]/20 px-3 py-1 rounded-lg text-sm font-bold tracking-widest inline-block uppercase">
                      {inst.join_code || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-gray-400 hover:text-[var(--color-purple)] transition"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(inst.id)} className="text-red-400 hover:text-red-300 transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filteredInstitutes.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No institutes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Institute Modal */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} border p-6 rounded-2xl w-full max-w-lg shadow-2xl relative z-50`}
          >
            <h2 className="text-xl font-bold mb-1">Add New Institute</h2>
            <p className={`text-sm mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Create an institute and its admin account</p>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto pr-2">
              {/* Institute Details Section */}
              <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'} flex items-center gap-2`}>
                <Building2 className="w-3.5 h-3.5" /> Institute Details
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Institute Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sunrise Coaching Center"
                    className={`w-full px-4 py-2.5 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-400'} border rounded-xl focus:outline-none transition-all text-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Owner Name</label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    className={`w-full px-4 py-2.5 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-400'} border rounded-xl focus:outline-none transition-all text-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Contact Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2.5 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-400'} border rounded-xl focus:outline-none transition-all text-sm`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-400'} border rounded-xl focus:outline-none transition-all text-sm`}
                />
              </div>

              {/* Admin Account Section */}
              <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'} flex items-center gap-2 pt-2 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <UserPlus className="w-3.5 h-3.5" /> Admin Login Credentials
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Admin Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                    placeholder="admin@institute.com"
                    className={`w-full px-4 py-2.5 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-400'} border rounded-xl focus:outline-none transition-all text-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Admin Password *</label>
                  <input
                    required
                    type="password"
                    value={formData.admin_password}
                    onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                    placeholder="Min 6 characters"
                    minLength={6}
                    className={`w-full px-4 py-2.5 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-400'} border rounded-xl focus:outline-none transition-all text-sm`}
                  />
                </div>
              </div>

              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                This admin will be able to log in and manage the institute independently.
              </p>

              <div className={`flex justify-end space-x-3 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormData({ name: '', email: '', phone: '', owner_name: '', admin_email: '', admin_password: '' }) }}
                  disabled={submitting}
                  className={`px-4 py-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'} font-medium transition`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:opacity-90 transition-all font-semibold disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Institute
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default InstitutesPage

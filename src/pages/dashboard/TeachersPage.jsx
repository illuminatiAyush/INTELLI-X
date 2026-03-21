import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, Edit2, Trash2, Mail, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { createPortal } from 'react-dom'

const TeachersPage = () => {
  const { isDark } = useTheme()
  const { user, profile } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', subject: '' })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      // RLS will automatically restrict this to the admin's institute_id
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTeachers(data || [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (!formData.email || !formData.password) {
        throw new Error("Email and password are required for login access.")
      }

      // Call Edge Function to create auth user and profile
      const { data, error: invokeError } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          role: 'teacher',
          name: formData.name,
          subject: formData.subject,
          institute_id: profile?.institute_id
        }
      })

      if (invokeError) throw new Error(invokeError.message)
      if (data?.error) throw new Error(data.error)
      
      setShowModal(false)
      setFormData({ name: '', email: '', password: '', subject: '' })
      fetchTeachers()
      alert(`Teacher "${formData.name}" created successfully!`)
    } catch (error) {
      console.error('Error adding teacher:', error)
      alert('Error adding teacher: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this teacher?')) return
    
    try {
      const { error } = await supabase.from('teachers').delete().eq('id', id)
      if (error) throw error
      fetchTeachers()
    } catch (error) {
      console.error('Error deleting teacher:', error)
      alert('Error deleting teacher')
    }
  }

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase.from('teachers').update({ status: 'active' }).eq('id', id)
      if (error) throw error
      fetchTeachers()
    } catch(e) {
      alert("Error approving teacher: " + e.message)
    }
  }

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className={`${isDark ? 'text-white' : 'text-gray-900'} text-center py-10`}>Loading teachers...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
          >
            Teachers
          </motion.h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Manage teaching staff for your institute</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-5 py-2.5 bg-[var(--color-purple)] text-white rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-purple-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Teacher
        </button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-app)]/50">
          <div className="relative w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search teachers..."
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
                <th className="px-6 py-5 font-bold">Name</th>
                <th className="px-6 py-5 font-bold">Subject</th>
                <th className="px-6 py-5 font-bold">Contact</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className={`hover:bg-[var(--bg-app)] transition-colors group ${teacher.status === 'pending' ? 'bg-yellow-500/5' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {teacher.status === 'pending' ? (
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">Pending</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-[10px] font-bold uppercase tracking-wider border border-green-500/20">Active</span>
                      )}
                      <div className="font-semibold text-[var(--text-primary)]">{teacher.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-[var(--text-primary)] font-medium">
                      <div className="p-1.5 rounded-lg bg-[var(--color-purple)]/10 text-[var(--color-purple)] mr-2.5">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      {teacher.subject || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">{teacher.email || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                    {teacher.status === 'pending' && (
                      <button 
                        onClick={() => handleApprove(teacher.id)}
                        className="text-green-500 hover:text-green-400 transition text-xs font-bold uppercase tracking-wider bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20"
                      >
                        Approve
                      </button>
                    )}
                    <button className="text-gray-400 hover:text-white transition"><Edit2 className="w-4 h-4 inline" /></button>
                    <button 
                      onClick={() => handleDelete(teacher.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No teachers found. Click 'Add Teacher' to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} border p-6 rounded-xl w-full max-w-md shadow-2xl relative z-50`}>
            <h2 className="text-xl font-bold mb-4">Add New Teacher</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto pr-2">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-[var(--color-purple)]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[var(--color-purple)]/50'} border rounded-lg focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Email Address *</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-[var(--color-purple)]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[var(--color-purple)]/50'} border rounded-lg focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Password *</label>
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className={`w-full px-4 py-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-[var(--color-purple)]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[var(--color-purple)]/50'} border rounded-lg focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Subject Expertise</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Advanced Mathematics"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full px-4 py-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-[var(--color-purple)]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[var(--color-purple)]/50'} border rounded-lg focus:outline-none transition-all`}
                />
              </div>
              
              <div className={`flex justify-end space-x-3 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className={`px-4 py-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800 font-medium'} transition`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[var(--color-purple)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {submitting ? 'Saving...' : 'Save Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default TeachersPage

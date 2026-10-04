import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, Pencil, Trash2, Mail, BookOpen, Phone, Users, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { createPortal } from 'react-dom'
import { useAppQuery } from '../../hooks/useAppQuery'
import { TableSkeleton } from '../../components/ui/Skeletons'

const TeachersPage = ({ hideHeader = false }) => {
  const { isDark } = useTheme()
  const { user, profile } = useAuth()
  const { data: teachersData, loading: teachersLoading, refetch: refetchTeachers } = useAppQuery('teachers-list', async () => {
    // RLS will automatically restrict this to the admin's institute_id
    const { data, error } = await supabase
      .from('teachers')
      .select('id, name, subject, phone, email, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  })

  const teachers = teachersData || []
  const loading = teachersLoading && !teachersData

  const [submitting, setSubmitting] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', subject: '', phone: '' })
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchTeachers = () => refetchTeachers()


  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingTeacher) {
        // Edit mode: update only name and subject directly on teachers table
        const { error } = await supabase
          .from('teachers')
          .update({ name: formData.name, subject: formData.subject, phone: formData.phone || null, email: formData.email || null })
          .eq('id', editingTeacher.id)
        if (error) throw error
        setShowModal(false)
        setEditingTeacher(null)
        fetchTeachers()
        alert(`Teacher "${formData.name}" updated successfully!`)
      } else {
        // Add mode: create via Edge Function (handles auth + profile)
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required for login access.')
        }
        // 1. Explicitly check for valid session before invocation
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error("Your session has expired. Please log out and back in to add teachers.")
        }

        const { data, error: invokeError } = await supabase.functions.invoke('create-user', {
          body: {
            email: formData.email,
            password: formData.password,
            role: 'teacher',
            name: formData.name,
            subject: formData.subject,
            phone: formData.phone || null,
            institute_id: profile?.institute_id
          }
        })
        
        if (invokeError) {
          if (invokeError.message?.includes('Invalid JWT') || invokeError.message?.includes('Unauthorized')) {
            throw new Error("Authentication failed: Your session is invalid. Please refresh the page or re-login.")
          }
          throw new Error(invokeError.message)
        }
        if (data?.error) throw new Error(data.error)
        setShowModal(false)
        setFormData({ name: '', email: '', password: '', subject: '', phone: '' })
        fetchTeachers()
        alert(`Teacher "${formData.name}" created successfully!`)
      }
    } catch (error) {
      console.error('Error saving teacher:', error)
      alert('Error: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEdit = (teacher) => {
    setEditingTeacher(teacher)
    setFormData({ name: teacher.name || '', email: teacher.email || '', password: '', subject: teacher.subject || '', phone: teacher.phone || '' })
    setShowModal(true)
  }

  const handleOpenAdd = () => {
    setEditingTeacher(null)
    setFormData({ name: '', email: '', password: '', subject: '', phone: '' })
    setShowModal(true)
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



  const filteredTeachers = teachers.filter(teacher => 
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper function to get consistent avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-indigo-500',
      'bg-red-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-white rounded-xl border border-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-600 mt-1">Manage teaching staff and their details</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="dashboard-btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Teacher
        </button>
      </div>

      {/* Search Bar */}
      <div className="dashboard-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search teachers by name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-input pl-10 w-full"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <div className="dashboard-card p-12 text-center">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No teachers found</p>
          <p className="text-sm text-gray-400 mt-1">Click 'Add Teacher' to create one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="user-card group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-full ${getAvatarColor(teacher.name)} flex items-center justify-center text-white font-semibold text-lg`}>
                  {teacher.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit teacher"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete teacher"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{teacher.name}</h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <BookOpen className="w-4 h-4" />
                <span>{teacher.subject || 'No subject'}</span>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100">
                {teacher.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                )}
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="dashboard-card w-full max-w-md shadow-2xl relative z-50">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[85vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="dashboard-input"
                />
              </div>
              
              {editingTeacher && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email / Gmail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@gmail.com"
                    className="dashboard-input"
                  />
                </div>
              )}
              
              {!editingTeacher && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="dashboard-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password *
                    </label>
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="dashboard-input"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject Expertise
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Advanced Mathematics"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="dashboard-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="dashboard-input"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="dashboard-btn-primary flex items-center gap-2"
                >
                  {submitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {submitting ? 'Saving...' : editingTeacher ? 'Update' : 'Save'}
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

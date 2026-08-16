import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, Pencil, Trash2, Mail, BookOpen, Phone, Users, UserCheck } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'

const TeachersPage = ({ hideHeader = false }) => {
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const teachersPerPage = 12

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
      } else {
        // Add mode: create via Edge Function
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required for login access.')
        }
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error("Your session has expired. Please log out and back in.")
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
        
        if (invokeError) throw new Error(invokeError.message)
        if (data?.error) throw new Error(data.error)
        
        setShowModal(false)
        setFormData({ name: '', email: '', password: '', subject: '', phone: '' })
        fetchTeachers()
      }
    } catch (error) {
      console.error('Error saving teacher:', error)
      alert('Error: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEdit = (teacher, e) => {
    e.stopPropagation()
    setEditingTeacher(teacher)
    setFormData({ name: teacher.name || '', email: teacher.email || '', password: '', subject: teacher.subject || '', phone: teacher.phone || '' })
    setShowModal(true)
  }

  const handleOpenAdd = () => {
    setEditingTeacher(null)
    setFormData({ name: '', email: '', password: '', subject: '', phone: '' })
    setShowModal(true)
  }
  
  const handleDelete = async (id, e) => {
    e.stopPropagation()
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

  // Pagination Logic
  const indexOfLastTeacher = currentPage * teachersPerPage
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage
  const currentTeachers = filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher)
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage)

  if (loading) return <DashboardSkeleton />

  return (
    <div className={hideHeader ? "space-y-6" : "space-y-8"}>
      {!hideHeader && (
        <div className="bg-white p-8 rounded-[16px] border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Teachers</h1>
              <p className="text-gray-500 text-sm mt-1">Manage and organize teaching staff</p>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="btn-primary shrink-0"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Teacher
          </button>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-[16px] border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Grid Layout */}
      {filteredTeachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-[16px]">
           <UserCheck className="w-10 h-10 text-gray-300 mb-3" />
           <p className="text-gray-500 font-medium">No teachers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentTeachers.map((teacher) => (
            <div 
              key={teacher.id} 
              className="academic-card hover:border-gray-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate max-w-[150px]">{teacher.name}</h3>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">{teacher.subject || 'No subject'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{teacher.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{teacher.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-gray-100 gap-1">
                <button onClick={(e) => handleOpenEdit(teacher, e)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={(e) => handleDelete(teacher.id, e)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-[16px] border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 font-medium">
            Showing <span className="font-semibold text-gray-900">{indexOfFirstTeacher + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastTeacher, filteredTeachers.length)}</span> of <span className="font-semibold text-gray-900">{filteredTeachers.length}</span> teachers
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 text-gray-900 p-6 rounded-xl w-full max-w-md shadow-2xl relative z-50 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              
              {editingTeacher ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email / Gmail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Expertise</label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : editingTeacher ? 'Update Teacher' : 'Save Teacher'}
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

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Users, Phone, Mail, GraduationCap, FileText, Calendar, Filter, Layers } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import { Input } from '../../components/ui/FormField'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../services/studentService'
import { useAuth } from '../../context/AuthContext'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton } from '../../components/ui/Skeletons'
import { supabase } from '../../lib/supabase'

const StudentsPage = ({ hideHeader = false }) => {
  const { role } = useAuth()
  const { data: studentsData, loading: studentsLoading, refetch: refetchStudents } = useAppQuery('students-list', async () => {
    const { data } = await supabase
      .from('students')
      .select('id, name, email, phone, created_at, batch_students(batches(id, name))')
      .order('created_at', { ascending: false })
    return data || []
  })

  const students = studentsData || []
  const loading = studentsLoading && !studentsData

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterBatch, setFilterBatch] = useState('All')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const studentsPerPage = 12

  const fetchData = () => refetchStudents()

  useEffect(() => { fetchData() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', email: '', password: '', phone: '' })
    setModalOpen(true)
  }

  const openEdit = (student) => {
    setEditing(student)
    setForm({
      name: student.name,
      email: student.email || '',
      password: '',
      phone: student.phone || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await updateStudent(editing.id, form)
      } else {
        await createStudent(form)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to save student. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this student?')) return
    try {
      await deleteStudent(id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  // Derive all unique batches for the filter dropdown
  const allBatches = Array.from(new Set(students.flatMap(s => 
    (s.batch_students || []).map(bs => bs.batches?.name).filter(Boolean)
  )))

  // Filtering
  const filtered = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || (s.email || '').toLowerCase().includes(search.toLowerCase())
    const batchNames = (s.batch_students || []).map(bs => bs.batches?.name).filter(Boolean)
    const matchesBatch = filterBatch === 'All' || batchNames.includes(filterBatch)
    return matchesSearch && matchesBatch
  })

  // Pagination Logic
  const indexOfLastStudent = currentPage * studentsPerPage
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
  const currentStudents = filtered.slice(indexOfFirstStudent, indexOfLastStudent)
  const totalPages = Math.ceil(filtered.length / studentsPerPage)

  if (loading) return <DashboardSkeleton />

  return (
    <div className={hideHeader ? "space-y-6" : "space-y-8"}>
      {!hideHeader && (
        <div className="bg-white p-8 rounded-[16px] border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Students</h1>
              <p className="text-gray-500 text-sm mt-1">Manage enrolled students for your institute</p>
            </div>
          </div>
          {role === 'admin' && (
            <button
              onClick={openAdd}
              className="btn-primary shrink-0"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Student
            </button>
          )}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[16px] border border-gray-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
           <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl min-w-max">
             <Filter className="w-4 h-4 text-gray-500" />
             <select 
               value={filterBatch}
               onChange={(e) => setFilterBatch(e.target.value)}
               className="bg-transparent text-sm text-gray-900 font-medium focus:outline-none cursor-pointer"
             >
               <option value="All">All Batches</option>
               {allBatches.map(b => (
                 <option key={b} value={b}>{b}</option>
               ))}
             </select>
           </div>
           {/* Future Filters: Fee Status, Attendance */}
           <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed min-w-max">
             Fee Status
           </div>
        </div>
      </div>

      {/* Grid Layout */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-[16px]">
           <Users className="w-10 h-10 text-gray-300 mb-3" />
           <p className="text-gray-500 font-medium">No students found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentStudents.map((student) => {
            const batchNames = (student.batch_students || []).map(bs => bs.batches?.name).filter(Boolean)
            
            return (
              <div 
                key={student.id} 
                className="academic-card hover:border-gray-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate max-w-[150px]">{student.name}</h3>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{student.email || 'No email'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{student.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Layers className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {batchNames.length > 0 ? batchNames.map(b => (
                          <span key={b} className="px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-700">{b}</span>
                        )) : <span className="text-gray-400 text-xs">No batches</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(student.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </div>
                  {role === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(student); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => handleDelete(student.id, e)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-[16px] border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 font-medium">
            Showing <span className="font-semibold text-gray-900">{indexOfFirstStudent + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(indexOfLastStudent, filtered.length)}</span> of <span className="font-semibold text-gray-900">{filtered.length}</span> students
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

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Student' : 'Add Student'}>
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter student name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="student@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {!editing && (
            <Input
              label="Password *"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}
          <Input
            label="Phone"
            placeholder="+91 9876543210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="btn-primary"
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Add Student'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StudentsPage

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Users, Phone, Mail, BookOpen, ChevronDown } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import { Input } from '../../components/ui/FormField'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../services/studentService'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const StudentsPage = () => {
  const { isDark } = useTheme()
  const { role } = useAuth()
  const [students, setStudents] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [expandedBatches, setExpandedBatches] = useState(new Set())

  const toggleBatchExpand = (id) => setExpandedBatches(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const fetchData = async () => {
    try {
      const s = await getStudents()
      setStudents(s)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

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
      password: '', // Edit mode generally doesn't require password, but state needs it
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
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    try {
      await deleteStudent(id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'batch',
      label: 'Batch',
      render: (row) => row.batch_students?.[0]?.batches?.name || '-',
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ]

  if (role === 'admin') {
    columns.push({
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(row) }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-purple-400 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id) }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    })
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="flex justify-between items-center bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
          >
            Students
          </motion.h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Manage enrolled students for your institute</p>
        </div>
        {role === 'admin' && (
          <button
            onClick={openAdd}
            className="flex items-center px-5 py-2.5 bg-[var(--color-purple)] text-white rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-purple-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Student
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        {/* Search bar */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-app)]/50">
          <div className="relative w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] rounded-xl focus:outline-none focus:border-[var(--color-purple)] transition-all text-sm font-medium"
            />
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-medium">{students.length} total enrolled</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-app)]/50 text-[var(--text-secondary)] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5 font-bold">Name</th>
                <th className="px-6 py-5 font-bold">Phone</th>
                <th className="px-6 py-5 font-bold">Email</th>
                <th className="px-6 py-5 font-bold">Batch</th>
                <th className="px-6 py-5 font-bold">Joined</th>
                {role === 'admin' && <th className="px-6 py-5 font-bold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-[var(--bg-app)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[var(--text-primary)]">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[var(--color-purple)]" />
                      {student.phone || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      {student.email || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                    {(() => {
                      const batchNames = (student.batch_students || [])
                        .map(bs => bs.batches?.name)
                        .filter(Boolean)
                      if (batchNames.length === 0) return '-'
                      if (batchNames.length === 1) return (
                        <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-medium">{batchNames[0]}</span>
                      )
                      const isOpen = expandedBatches.has(student.id)
                      return (
                        <div className="space-y-1">
                          <button
                            onClick={() => toggleBatchExpand(student.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-purple-200 transition-colors"
                          >
                            <span className="px-2 py-0.5 rounded-lg bg-purple-500/10">{batchNames[0]}</span>
                            <span className="text-[var(--text-secondary)]">+{batchNames.length - 1}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isOpen && (
                            <div className="flex flex-col gap-1 pl-1 pt-1">
                              {batchNames.slice(1).map((name, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-medium w-fit">{name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                    {new Date(student.created_at).toLocaleDateString()}
                  </td>
                  {role === 'admin' && (
                    <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(student)}
                        className="text-gray-400 hover:text-white transition"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={role === 'admin' ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                    No students found. Click 'Add Student' to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
            label="Email / Gmail"
            type="email"
            placeholder="student@gmail.com"
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
          {!editing && (
            <div className="p-4 rounded-xl bg-[var(--color-purple)]/5 border border-[var(--color-purple)]/20 flex flex-col items-center justify-center text-center mt-2">
              <Users className="w-6 h-6 text-[var(--color-purple)] mb-2" />
              <p className="text-sm font-medium text-[var(--text-primary)]">Batch Enrollment</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Students will join batches themselves using a Join Code after their account is created.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-4 py-2 bg-[var(--color-purple)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Saving...' : editing ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StudentsPage

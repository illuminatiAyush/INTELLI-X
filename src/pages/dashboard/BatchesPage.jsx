import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/FormField'
import { getBatches, createBatch, updateBatch, deleteBatch } from '../../services/batchService'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const BatchesPage = () => {
  const { role } = useAuth()
  const [batches, setBatches] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', subject: '', teacher_id: '' })
  const [saving, setSaving] = useState(false)
  const [expandedBatch, setExpandedBatch] = useState(null)
  const [batchStudents, setBatchStudents] = useState([])

  const fetchData = async () => {
    try {
      const [b, { data: t }] = await Promise.all([
        getBatches(),
        supabase.from('teachers').select('*'),
      ])
      setBatches(b)
      setTeachers(t || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', subject: '', teacher_id: '' })
    setModalOpen(true)
  }

  const openEdit = (batch) => {
    setEditing(batch)
    setForm({
      name: batch.name,
      subject: batch.subject || '',
      teacher_id: batch.teacher_id || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.teacher_id) delete payload.teacher_id
      if (editing) {
        await updateBatch(editing.id, payload)
      } else {
        await createBatch(payload)
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
    if (!confirm('Delete this batch? Students in this batch will be unassigned.')) return
    try {
      await deleteBatch(id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRowClick = async (batch) => {
    if (expandedBatch === batch.id) {
      setExpandedBatch(null)
      return
    }
    setExpandedBatch(batch.id)
    const { data } = await supabase
      .from('students')
      .select('id, name, email')
      .eq('batch_id', batch.id)
      .order('name')
    setBatchStudents(data || [])
  }

  const filtered = batches.filter(
    (b) => b.name.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'name', label: 'Batch Name' },
    { key: 'subject', label: 'Subject', render: (r) => r.subject || '-' },
    {
      key: 'teacher_id',
      label: 'Teacher',
      render: (r) => r.teachers?.name || '-',
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (r) => new Date(r.created_at).toLocaleDateString(),
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

  const teacherOptions = teachers.map((t) => ({ value: t.profile_id || t.id, label: t.name }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
          >
            Batches
          </motion.h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">{batches.length} active batches managed</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] outline-none focus:border-[var(--color-purple)]/50 w-64 transition-all"
            />
          </div>
          {role === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-purple)] text-white text-sm font-semibold shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" /> Create Batch
            </motion.button>
          )}
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <DataTable columns={columns} data={filtered} onRowClick={handleRowClick} emptyMessage="No batches found" />
      </div>

      {/* Expanded batch students */}
      {expandedBatch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Students in this batch</h3>
          </div>
          {batchStudents.length === 0 ? (
            <p className="text-gray-500 text-sm">No students in this batch</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {batchStudents.map((s) => (
                <div key={s.id} className="px-3 py-2 rounded-lg bg-white/5 text-sm text-gray-300">
                  {s.name} <span className="text-gray-600 text-xs ml-1">{s.email}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Batch' : 'Create Batch'}>
        <div className="space-y-4">
          <Input
            label="Batch Name"
            placeholder="e.g. Physics - Morning Batch"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Subject"
            placeholder="e.g. Physics, Mathematics"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <Select
            label="Assign Teacher"
            placeholder="Select a teacher"
            options={teacherOptions}
            value={form.teacher_id}
            onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
          />
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Create Batch'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default BatchesPage

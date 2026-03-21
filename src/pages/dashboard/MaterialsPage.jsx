import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Trash2, Download, Search } from 'lucide-react'
import { Select } from '../../components/ui/FormField'
import { getMaterials, uploadMaterial, deleteMaterial } from '../../services/materialService'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const MaterialsPage = () => {
  const { user, role } = useAuth()
  const [materials, setMaterials] = useState([])
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [uploadBatch, setUploadBatch] = useState('')
  const [search, setSearch] = useState('')
  const fileRef = useRef(null)

  const canUpload = role === 'admin' || role === 'teacher'

  const fetchData = async () => {
    try {
      let query = supabase.from('batches').select('*').order('name')
      if (role === 'teacher') query = query.eq('teacher_id', user.id)
      const { data: batchData } = await query
      setBatches(batchData || [])

      const mats = await getMaterials(selectedBatch || undefined)
      setMaterials(mats)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [selectedBatch])

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file || !title.trim() || !uploadBatch) return
    setUploading(true)
    try {
      await uploadMaterial(file, uploadBatch, title, user.id)
      setTitle('')
      setUploadBatch('')
      if (fileRef.current) fileRef.current.value = ''
      fetchData()
    } catch (err) {
      console.error(err)
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (mat) => {
    if (!confirm(`Delete "${mat.title}"?`)) return
    try {
      await deleteMaterial(mat.id, mat.file_url)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = materials.filter(
    (m) => m.title.toLowerCase().includes(search.toLowerCase())
  )

  const batchOptions = batches.map((b) => ({ value: b.id, label: b.name }))

  return (
    <div className="space-y-8">
      <div>
        <motion.h1 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          Study Materials
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
          {canUpload ? 'Upload and manage study materials for your batches' : 'Access your shared study materials and resources'}
        </p>
      </div>

      {/* Upload Section */}
      {canUpload && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[var(--color-purple)]/10">
              <Upload className="w-5 h-5 text-[var(--color-purple)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Upload Material</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Title</label>
              <input
                type="text"
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 outline-none focus:border-[var(--color-purple)] focus:bg-[var(--bg-app)] transition-all"
              />
            </div>
            <Select
              label="Select Batch"
              placeholder={batchOptions.length > 0 ? "Target batch" : "No batches available"}
              options={batchOptions}
              value={uploadBatch}
              onChange={(e) => setUploadBatch(e.target.value)}
              disabled={batchOptions.length === 0}
            />
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">File (PDF/DOC)</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx"
                className="w-full text-xs text-[var(--text-secondary)] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[var(--color-purple)]/10 file:text-[var(--color-purple)] hover:file:bg-[var(--color-purple)]/20 file:cursor-pointer transition-all"
              />
            </div>
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={uploading || !title.trim() || !uploadBatch}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-purple)] text-white text-sm font-bold disabled:opacity-50 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                {uploading ? 'Uploading...' : 'Publish Material'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div className="flex-1">
          <Select
            label="Filter by Batch"
            placeholder="View All"
            options={[{ value: '', label: 'All Batches' }, ...batchOptions]}
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Quick Search</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Find materials by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 outline-none focus:border-[var(--color-purple)] focus:bg-[var(--bg-app)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[var(--color-purple)]/20 border-t-[var(--color-purple)] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-surface)]/50 rounded-3xl border border-dashed border-[var(--border-subtle)]">
          <FileText className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)] opacity-20" />
          <p className="text-[var(--text-secondary)] font-medium text-lg">No materials found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((mat, i) => (
            <motion.div
              key={mat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col hover:border-[var(--color-purple)]/30 hover:shadow-xl hover:shadow-purple-500/5 transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 rounded-xl bg-[var(--color-purple)]/10 text-[var(--color-purple)] group-hover:bg-[var(--color-purple)] group-hover:text-white transition-all">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] truncate transition-colors group-hover:text-[var(--color-purple)]">{mat.title}</h3>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-1">{mat.batches?.name || 'PUBLIC'}</p>
                </div>
              </div>
              <div className="mb-6 flex-1">
                <p className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                   <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
                   Published {new Date(mat.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={mat.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--color-purple)] hover:text-white hover:border-transparent transition-all text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" /> Get File
                </a>
                {canUpload && (
                  <button
                    onClick={() => handleDelete(mat)}
                    className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MaterialsPage

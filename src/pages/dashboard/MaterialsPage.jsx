import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Trash2, Download, Search } from 'lucide-react'
import { Select } from '../../components/ui/FormField'
import { getMaterials, uploadMaterial, deleteMaterial } from '../../services/materialService'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import { useAppQuery } from '../../hooks/useAppQuery'
import { CardSkeleton } from '../../components/ui/Skeletons'

const MaterialsPage = () => {
  const { user, role } = useAuth()
  const { isDark } = useTheme()
  const { data: initialData, loading: initialLoading, refetch: refetchInitial } = useAppQuery(`materials-init-${role}-${user?.id}`, async () => {
    if (!user) return { batches: [], materials: [] }
    
    let batchData = []
    if (role === 'student') {
      const { data: enrolledBatches } = await supabase.from('batch_students').select('batch_id').eq('student_id', user.id)
      if (enrolledBatches && enrolledBatches.length > 0) {
        const batchIds = enrolledBatches.map(eb => eb.batch_id)
        const { data } = await supabase.from('batches').select('id, name').in('id', batchIds).order('name')
        batchData = data || []
      }
    } else {
      let query = supabase.from('batches').select('id, name').order('name')
      if (role === 'teacher') query = query.eq('teacher_id', user.id)
      const { data } = await query
      batchData = data || []
    }

    let mats = []
    if (role === 'student') {
      if (batchData.length > 0) {
        const batchIds = batchData.map(b => b.id)
        mats = await getMaterials(batchIds)
      }
    } else {
      mats = await getMaterials(undefined)
    }

    return { batches: batchData, materials: mats }
  }, { enabled: !!user })

  useEffect(() => {
    if (initialData?.materials) {
      setMaterials(initialData.materials)
    }
    if (initialData?.batches) {
      setBatches(initialData.batches)
    }
  }, [initialData])

  const [batches, setBatches] = useState(initialData?.batches || [])
  const [materials, setMaterials] = useState(initialData?.materials || [])
  const [loading, setLoading] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState('')
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('')
  const [uploadBatch, setUploadBatch] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const canUpload = role !== 'student'
  
  const isInitialLoading = initialLoading && !initialData

  const fetchData = async () => {
    setLoading(true)
    try {
      const mats = await getMaterials(selectedBatch || undefined)
      setMaterials(mats)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    if (selectedBatch) fetchData() 
    else if (initialData?.materials) setMaterials(initialData.materials)
  }, [selectedBatch])

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
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm tint-card-0"
        >
          <div className={`flex items-center gap-3 mb-6`}>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
              <Upload className="w-5 h-5" />
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
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 outline-none focus:border-indigo-400 focus:bg-[var(--bg-app)] transition-all"
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
                className={`w-full text-xs text-[var(--text-secondary)] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:cursor-pointer transition-all ${isDark ? 'file:bg-white/10 file:text-white hover:file:bg-white/20' : 'file:bg-indigo-500/10 file:text-indigo-600 hover:file:bg-indigo-500/20'}`}
              />
            </div>
            <div className="flex items-end">
              <motion.button
                onClick={handleUpload}
                disabled={uploading || !title || !uploadBatch || !fileRef.current?.files[0]}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--text-primary)] text-[var(--bg-app)] text-sm font-bold disabled:opacity-50 shadow-xl active:scale-95 transition-all"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
            placeholder="All Batches"
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 outline-none focus:border-indigo-400 focus:bg-[var(--bg-app)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {isInitialLoading || loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
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
              className={`group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col hover:border-black/20 dark:hover:border-white/20 hover:shadow-xl transition-all tint-card-${i % 6}`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-3 rounded-xl transition-all ${isDark ? 'bg-white/10 text-white group-hover:bg-white group-hover:text-black' : 'bg-black/10 text-black group-hover:bg-indigo-600 group-hover:text-white'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] truncate transition-colors">{mat.title}</h3>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-1">{mat.batches?.name || 'PUBLIC'}</p>
                </div>
              </div>
              <div className="mb-6 flex-1">
                 <p className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5 flex-wrap leading-relaxed">
                   <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
                   Published {mat.profiles?.first_name ? `by ${mat.profiles.first_name} ${mat.profiles.last_name || ''} ` : ''}on {new Date(mat.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={mat.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-bold transition-all hover:bg-white hover:text-black hover:border-transparent"

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

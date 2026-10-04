import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Trash2, Download, Search } from 'lucide-react'
import toast from 'react-hot-toast'
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
  const [selectedFile, setSelectedFile] = useState(null)
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
    const file = selectedFile || fileRef.current?.files?.[0]
    if (!file || !title.trim() || !uploadBatch) {
      alert('Please fill in title, select a batch, and choose a file.')
      return
    }
    setUploading(true)
    try {
      await uploadMaterial(file, uploadBatch, title, user.id)
      toast.success(`📚 "${title}" published successfully!`)
      setTitle('')
      setUploadBatch('')
      setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ''
      refetchInitial()
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
      toast.success('Material deleted.')
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = materials
    .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const batchOptions = batches.map((b) => ({ value: b.id, label: b.name }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Materials</h1>
        <p className="text-sm text-gray-600 mt-1">
          {canUpload ? 'Upload and manage study materials for your batches' : 'Access your shared study materials and resources'}
        </p>
      </div>

      {/* Upload Section */}
      {canUpload && (
        <div className="dashboard-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Upload Material</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input
                type="text"
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="dashboard-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Batch</label>
              <select
                className="dashboard-input"
                value={uploadBatch}
                onChange={(e) => setUploadBatch(e.target.value)}
                disabled={batchOptions.length === 0}
              >
                <option value="">
                  {batchOptions.length > 0 ? "Target batch" : "No batches available"}
                </option>
                {batchOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">File (PDF/DOC)</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:cursor-pointer transition-all"
              />
              {selectedFile && (
                <p className="text-xs mt-1 text-green-600">✓ {selectedFile.name}</p>
              )}
            </div>
            <div className="flex items-end">
              <button
                onClick={handleUpload}
                disabled={uploading || !title.trim() || !uploadBatch || !selectedFile}
                className="dashboard-btn-primary w-full flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                {uploading ? 'Uploading...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 dashboard-card">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Filter by Batch</label>
          <select
            className="dashboard-input"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="">All Batches</option>
            {batchOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Quick Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Find materials by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dashboard-input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {isInitialLoading || loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-medium">No materials found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="dashboard-card group hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{mat.title}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">
                    {mat.batches?.name || 'PUBLIC'}
                  </p>
                </div>
              </div>
              <div className="mb-4 flex-1">
                <p className="text-xs text-gray-500">
                  Published {mat.profiles?.first_name ? `by ${mat.profiles.first_name} ${mat.profiles.last_name || ''} ` : ''}
                  on {new Date(mat.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <a
                  href={mat.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                {canUpload && (
                  <button
                    onClick={() => handleDelete(mat)}
                    className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MaterialsPage

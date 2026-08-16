import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Trash2, Download, Search } from 'lucide-react'
import { Select } from '../../components/ui/FormField'
import { getMaterials, uploadMaterial, deleteMaterial } from '../../services/materialService'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useAppQuery } from '../../hooks/useAppQuery'
import { CardSkeleton } from '../../components/ui/Skeletons'

const MaterialsPage = () => {
  const { user, role } = useAuth()
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
      <div className="flex items-center gap-4 bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Study Materials</h1>
          <p className="text-gray-500 text-sm mt-1">
            {canUpload ? 'Upload and manage study materials for your batches' : 'Access your shared study materials and resources'}
          </p>
        </div>
      </div>

      {/* Upload Section */}
      {canUpload && (
        <div className="rounded-[16px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Upload Material</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Title</label>
              <input
                type="text"
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
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
              <label className="block text-sm font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">File (PDF/DOC)</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx"
                className="w-full text-xs text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:cursor-pointer transition-all file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleUpload}
                disabled={uploading || !title || !uploadBatch || !fileRef.current?.files[0]}
                className="btn-primary w-full h-[42px] justify-center"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading ? 'Uploading...' : 'Publish Material'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm">
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
          <label className="block text-sm font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Quick Search</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Find materials by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder-gray-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
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
        <div className="text-center py-20 bg-white rounded-[16px] border border-dashed border-gray-300">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">No materials found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((mat) => (
            <div
              key={mat.id}
              className="academic-card flex flex-col hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{mat.title}</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{mat.batches?.name || 'PUBLIC'}</p>
                </div>
              </div>
              
              <div className="mb-6 flex-1">
                 <p className="text-xs text-gray-500 font-medium">
                   Published {mat.profiles?.first_name ? `by ${mat.profiles.first_name} ${mat.profiles.last_name || ''} ` : ''}on {new Date(mat.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                <a
                  href={mat.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold transition-all hover:bg-white hover:border-gray-300 group-hover:bg-white group-hover:border-blue-200"
                >
                  <Download className="w-3.5 h-3.5" /> Get File
                </a>
                {canUpload && (
                  <button
                    onClick={() => handleDelete(mat)}
                    className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
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

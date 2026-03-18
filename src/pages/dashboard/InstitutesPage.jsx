import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Search, Edit2, Trash2, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

const InstitutesPage = () => {
  const { isDark } = useTheme()
  const [institutes, setInstitutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', owner_name: '' })

  useEffect(() => {
    fetchInstitutes()
  }, [])

  const fetchInstitutes = async () => {
    try {
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInstitutes(data || [])
    } catch (error) {
      console.error('Error fetching institutes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('institutes').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          owner_name: formData.owner_name,
        },
      ])

      if (error) throw error
      
      setShowModal(false)
      setFormData({ name: '', email: '', phone: '', owner_name: '' })
      fetchInstitutes()
    } catch (error) {
      console.error('Error creating institute:', error)
      alert('Error creating institute')
    }
  }

  const filteredInstitutes = institutes.filter(inst => 
    inst.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inst.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className={`${isDark ? 'text-white' : 'text-gray-900'} text-center py-10`}>Loading institutes...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
          >
            Registered Institutes
          </motion.h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium">Manage coaching centers across the platform</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-5 py-2.5 bg-[var(--color-purple)] text-white rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-purple-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Institute
        </button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-app)]/50">
          <div className="relative w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
            <input
              type="text"
              placeholder="Search institutes..."
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
                <th className="px-6 py-5 font-bold">Institute Name</th>
                <th className="px-6 py-5 font-bold">Owner</th>
                <th className="px-6 py-5 font-bold">Email</th>
                <th className="px-6 py-5 font-bold">Phone</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredInstitutes.map((inst) => (
                <tr key={inst.id} className="hover:bg-[var(--bg-app)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                    <div className="p-2.5 bg-[var(--color-purple)]/10 rounded-xl mr-3 group-hover:scale-110 transition-transform">
                        <Building2 className="w-5 h-5 text-[var(--color-purple)]" />
                      </div>
                      <span className="font-semibold text-[var(--text-primary)]">{inst.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{inst.owner_name || '-'}</td>
                  <td className="px-6 py-4">{inst.email || '-'}</td>
                  <td className="px-6 py-4">{inst.phone || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-gray-400 hover:text-white transition"><Edit2 className="w-4 h-4" /></button>
                    <button className="text-red-400 hover:text-red-300 transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filteredInstitutes.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No institutes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} border p-6 rounded-xl w-full max-w-md shadow-2xl`}>
            <h2 className="text-xl font-bold mb-4">Add New Institute</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Institute Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-400'} border rounded-lg focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Owner Name</label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  className={`w-full px-4 py-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-400'} border rounded-lg focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Contact Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-400'} border rounded-lg focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-400'} border rounded-lg focus:outline-none transition-all`}
                />
              </div>
              <div className={`flex justify-end space-x-3 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800 font-medium'} transition`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-purple)] text-white rounded-lg hover:opacity-90 transition"
                >
                  Create Institute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InstitutesPage

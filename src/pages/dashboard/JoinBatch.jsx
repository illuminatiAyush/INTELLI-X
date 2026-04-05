import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, ArrowRight, BookOpen } from 'lucide-react'
import { joinBatch } from '../../services/batchService'
import { useAuth } from '../../context/AuthContext'

const JoinBatch = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const { profile, role } = useAuth()
  
  const [joinCode, setJoinCode] = useState(code || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [batchName, setBatchName] = useState('')

  useEffect(() => {
    // Only students can join batches this way
    if (role !== 'student') {
      navigate('/dashboard')
    }
  }, [role, navigate])

  const handleJoin = async (e) => {
    e?.preventDefault()
    if (!joinCode.trim()) {
      setError('Please enter a valid join code')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const batch = await joinBatch(joinCode.trim().toUpperCase(), profile.id, profile.institute_id)
      setBatchName(batch.name)
      setSuccess(true)
      
      // Auto redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to join batch. Please check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  // If there's a code in the URL, optionally auto-submit
  useEffect(() => {
    if (code && profile) {
      handleJoin()
    }
    // eslint-disable-next-line
  }, [code, profile])

  if (role !== 'student') return null

  return (
    <div className="max-w-md mx-auto mt-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-8 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Join a Subject</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">
            Enter the code provided by your teacher to access your materials and tests.
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 bg-green-500/10 text-green-500 flex items-center justify-center rounded-full mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Successfully Joined!</h3>
              <p className="text-[var(--text-secondary)] text-sm mt-1">
                You are now enrolled in <span className="font-semibold text-[var(--color-purple)]">{batchName}</span>
              </p>
            </div>
            <p className="text-xs text-[var(--text-secondary)] animate-pulse">
              Redirecting to dashboard...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                Join Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value)
                  if (error) setError('')
                }}
                placeholder="e.g. ABC123"
                className="w-full text-center text-3xl tracking-[0.2em] font-mono px-4 py-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--color-purple)] text-[var(--text-primary)] uppercase outline-none transition-colors"
                maxLength={8}
                autoFocus
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-1.5 text-red-500 text-sm mt-3 font-medium"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading || !joinCode}
              whileHover={!loading && joinCode ? { scale: 1.02 } : {}}
              whileTap={!loading && joinCode ? { scale: 0.98 } : {}}
              className="w-full h-12 flex items-center justify-center gap-2 bg-[var(--color-purple)] text-white rounded-xl font-bold border border-white/10 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Join Subject
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default JoinBatch

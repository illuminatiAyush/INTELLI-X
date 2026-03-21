import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Eye, EyeOff, ArrowRight, Mail, Lock, Sun, Moon, User, Building2, GraduationCap, Briefcase } from 'lucide-react'
import ParticleBackground from '../animations/ParticleBackground'
import { supabase } from '../lib/supabase'

const RegisterPage = () => {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'student', instituteCode: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!form.instituteCode.trim()) e.instituteCode = 'Institute Code is required'
    return e
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleRoleSelect = (role) => {
    setForm(prev => ({ ...prev, role }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)

    try {
      // 1. Verify Institute Code via RPC
      const { data: institute, error: instError } = await supabase
        .rpc('get_institute_by_code', { code: form.instituteCode.toUpperCase() })
        .single()
        
      if (instError || !institute) {
        setErrors({ instituteCode: 'Invalid Institute Code.' })
        setLoading(false)
        return
      }

      // 2. Sign up via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            role: form.role,
            first_name: form.fullName,
            institute_id: institute.id
          }
        }
      })

      if (authError) {
        setErrors({ email: authError.message }) 
        setLoading(false)
        return
      }

      setSubmitted(true)
      
      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2500)

    } catch (err) {
      console.error('Registration error:', err)
      setErrors({ email: 'An unexpected error occurred' })
      setLoading(false)
    }
  }

  const bg = 'bg-[var(--bg-app)]'
  const cardBg = 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
  const inputBg = 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--color-purple)]'
  const labelColor = 'text-[var(--text-secondary)]'
  const headingColor = 'text-[var(--text-primary)]'

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${bg}`}>
      {/* Background */}
      {isDark && <ParticleBackground />}
      {isDark && (
        <>
          <div className="hero-blob-1 top-[-150px] left-[-150px]" style={{ zIndex: 1 }} />
          <div className="hero-blob-2 bottom-[-150px] right-[-100px]" style={{ zIndex: 1 }} />
        </>
      )}

      {/* Theme Toggle */}
      <div className="fixed top-8 right-8 z-50">
        <button
          onClick={toggleTheme}
          className="relative flex items-center justify-between gap-3 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 group overflow-hidden"
          aria-label="Toggle theme"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all bg-[var(--color-purple)]/10 text-[var(--color-purple)]">
            {isDark ? <Moon className="w-4 h-4 fill-current" /> : <Sun className="w-4 h-4" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{isDark ? 'Dark' : 'Light'}</span>
          </div>
          <div className="pr-3 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-purple)]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <img src="/intellix-icon.svg" alt="IntelliX Logo" className="w-10 h-10" />
            <span className={`text-2xl font-bold ${headingColor}`}>
              Intelli<span className="text-gradient">X</span>
            </span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`rounded-3xl border p-8 ${cardBg}`}
        >
          {submitted ? (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 flex flex-col items-center"
            >
              <div className="w-16 h-16 glow-button rounded-2xl flex items-center justify-center mx-auto mb-5 text-[var(--text-primary)]">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className={`text-2xl font-black mb-2 ${headingColor}`}>Account Created!</h2>
              <p className={`text-sm ${labelColor}`}>
                You are officially enrolled. Redirecting to login...
              </p>
              <div className="mt-5 flex justify-center">
                <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse" />
              </div>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className={`text-2xl font-black mb-1.5 ${headingColor}`}>Create an Account</h1>
                <p className={`text-sm ${labelColor}`}>
                  Join your institute seamlessly.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                
                {/* Role Switcher (Matched styling) */}
                <div className={`p-1 border rounded-xl flex gap-1 relative ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('student')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${form.role === 'student' ? 'text-white' : labelColor + ' hover:' + headingColor}`}
                  >
                    <GraduationCap className="w-4 h-4" /> Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('teacher')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg z-10 transition-colors ${form.role === 'teacher' ? 'text-white' : labelColor + ' hover:' + headingColor}`}
                  >
                    <Briefcase className="w-4 h-4" /> Teacher
                  </button>
                  
                  {/* Highlight background */}
                  <motion.div
                    className="absolute top-1 bottom-1 w-[calc(50%-6px)] bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg -z-0"
                    initial={false}
                    animate={{ left: form.role === 'student' ? '4px' : 'calc(50% + 2px)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>

                {/* Institute Code field */}
                <div className="pt-2">
                  <div className="relative">
                    <Building2 className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-500'} z-10`} />
                    <input
                      name="instituteCode"
                      type="text"
                      value={form.instituteCode}
                      onChange={handleChange}
                      placeholder="Institute Join Code (e.g. A9B2X)"
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 uppercase tracking-widest font-bold ${
                        isDark 
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 placeholder-indigo-400/50 focus:border-indigo-400' 
                          : 'bg-indigo-50 border-indigo-200 text-indigo-700 placeholder-indigo-300 focus:border-indigo-400'
                      } ${errors.instituteCode ? 'border-red-500/60 focus:border-red-500' : ''}`}
                    />
                  </div>
                  {errors.instituteCode && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-400">
                      {errors.instituteCode}
                    </motion.p>
                  )}
                </div>

                {/* Full Name field */}
                <div>
                  <div className="relative">
                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      name="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${inputBg} ${errors.fullName ? 'border-red-500/60 focus:border-red-500' : ''}`}
                    />
                  </div>
                  {errors.fullName && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-400">{errors.fullName}</motion.p>
                  )}
                </div>

                {/* Email field */}
                <div>
                  <div className="relative">
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${inputBg} ${errors.email ? 'border-red-500/60 focus:border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-400">{errors.email}</motion.p>
                  )}
                </div>

                {/* Password field */}
                <div>
                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password (min 6 characters)"
                      className={`w-full pl-10 pr-11 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${inputBg} ${errors.password ? 'border-red-500/60 focus:border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-400">{errors.password}</motion.p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 50px rgba(191,95,255,0.4)' } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className={`w-full glow-button text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      Registering...
                    </>
                  ) : (
                    <>Register Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>

              {/* Login link */}
              <p className={`text-center text-sm mt-6 ${labelColor}`}>
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className={`text-sm transition-colors ${isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ← Back to IntelliX home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage

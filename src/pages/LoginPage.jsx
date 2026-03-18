import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, ArrowRight, Mail, Lock, Sun, Moon } from 'lucide-react'
import ParticleBackground from '../animations/ParticleBackground'
import { supabase } from '../lib/supabase'

const LoginPage = () => {
  const { isDark, toggleTheme } = useTheme()
  const { role, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Navigate only when both login is submitted and role is loaded
  useEffect(() => {
    if (submitted && role && user) {
      console.log('LoginPage: Login successful and role loaded, navigating to dashboard...')
      navigate('/dashboard')
    }
  }, [submitted, role, user, navigate])

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (error) {
        setErrors({ email: error.message }) 
        setLoading(false)
        return
      }

      setSubmitted(true)
      
      // Safety: If navigation doesn't happen in 10s (e.g. role hang), reset loading
      setTimeout(() => {
        if (loading) {
          console.warn('Login: Redirection timeout hit.')
          setLoading(false)
        }
      }, 10000)

    } catch (err) {
      console.error('Login error:', err)
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
          className="text-center mb-10"
        >
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
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
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                className="w-16 h-16 glow-button rounded-2xl flex items-center justify-center mx-auto mb-5"
              >
                <span className="text-2xl">✅</span>
              </motion.div>
              <h2 className={`text-2xl font-black mb-2 ${headingColor}`}>Welcome back!</h2>
              <p className={`text-sm ${labelColor}`}>Logging you into IntelliX OS...</p>
              <div className="mt-5 flex justify-center">
                <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse" />
              </div>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className={`text-2xl font-black mb-1.5 ${headingColor}`}>Sign in to IntelliX</h1>
                <p className={`text-sm ${labelColor}`}>
                  Enter your credentials to access your institute dashboard.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Email field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className={`block text-xs font-semibold mb-2 ${labelColor}`}
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@institute.com"
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${inputBg} ${errors.email
                          ? 'border-red-500/60 focus:border-red-500'
                          : ''
                        }`}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 text-xs text-red-400"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="login-password"
                      className={`text-xs font-semibold ${labelColor}`}
                    >
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-11 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${inputBg} ${errors.password ? 'border-red-500/60 focus:border-red-500' : ''
                        }`}
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
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 text-xs text-red-400"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2.5">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-600 accent-purple-500 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className={`text-sm cursor-pointer ${labelColor}`}>
                    Keep me signed in
                  </label>
                </div>

                {/* Submit */}
                <motion.button
                  id="login-submit-btn"
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 50px rgba(191,95,255,0.4)' } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className={`w-full glow-button text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      Signing in...
                    </>
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className={`flex-1 h-px ${isDark ? 'bg-white/8' : 'bg-gray-200'}`} />
                <span className={`text-xs ${labelColor}`}>OR</span>
                <div className={`flex-1 h-px ${isDark ? 'bg-white/8' : 'bg-gray-200'}`} />
              </div>

              {/* SSO/Google hint */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border text-sm font-medium transition-all ${isDark
                    ? 'border-white/10 text-gray-300 hover:bg-white/5'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </motion.button>

              {/* Sign up link */}
              <p className={`text-center text-sm mt-6 ${labelColor}`}>
                Don't have an account?{' '}
                <Link to="/#cta" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                  Start free trial
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

export default LoginPage

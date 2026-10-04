import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Eye, EyeOff, ArrowRight, Mail, Lock, Sun, Moon } from 'lucide-react'
import { supabase } from '../lib/supabase'

const LoginPage = () => {
  const { role, user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted && role && user) {
      const pendingCode = sessionStorage.getItem('pendingJoinCode')
      if (pendingCode) {
        sessionStorage.removeItem('pendingJoinCode')
        navigate(`/dashboard/join/${pendingCode}`)
      } else {
        navigate('/dashboard')
      }
    }
  }, [submitted, role, user, navigate])

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Min 6 characters'
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
      if (error) { setErrors({ email: error.message }); setLoading(false); return }
      setSubmitted(true)
      setTimeout(() => { if (loading) setLoading(false) }, 10000)
    } catch {
      setErrors({ email: 'An unexpected error occurred' })
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#EBEBEB' }}>

      {/* ── Light/Dark toggle top right ── */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 bg-white shadow-sm text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {isDark ? (
            <><Sun size={13} /> Light</>
          ) : (
            <><Moon size={13} /> Dark</>
          )}
        </button>
      </div>

      {/* ── Left panel — branding ── */}
      <div
        className="hidden lg:flex w-[42%] flex-col items-center justify-center gap-6 relative flex-shrink-0"
        style={{ background: '#E8E8E8' }}
      >
        {/* Big iX logo block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-5"
        >
          <div
            className="w-40 h-40 rounded-[28px] flex items-center justify-center shadow-2xl"
            style={{ background: '#111111' }}
          >
            <span className="text-white font-black text-5xl tracking-tighter">iX</span>
          </div>

          {/* INTELLIX wordmark */}
          <div className="text-center">
            <h1 className="text-5xl font-black tracking-tight leading-none" style={{ color: '#111111' }}>
              INTELLI<span style={{ color: '#AAAAAA' }}>X</span>
            </h1>
            <div className="w-10 h-0.5 bg-gray-400 mx-auto my-4 rounded-full" />
            <p className="text-sm text-gray-600 leading-relaxed max-w-[220px] text-center">
              The <strong className="text-gray-900">Intelligent</strong> Operating System<br />
              for Modern Institutes.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Right panel — form ── */}
      <div
        className="flex-1 flex items-center justify-center px-8 py-12 relative"
        style={{
          background: 'white',
          clipPath: 'polygon(4% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      >
        {/* Mobile logo */}
        <div className="absolute top-6 left-8 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
            <span className="text-white font-black text-sm">iX</span>
          </div>
          <span className="text-gray-900 font-bold text-sm">IntelliX</span>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-[380px]"
        >
          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">

            {/* Heading with left blue accent bar */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-1 h-14 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                  Access Terminal
                </h2>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 mt-1">
                  Security Level: <span className="font-black">Authorized Only</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
                  Digital Identity (Email)
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@institute.com"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm bg-white text-gray-900 placeholder-gray-400 outline-none transition-all ${
                      errors.email
                        ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50'
                    }`}
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</motion.p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                    Access Key (Password)
                  </label>
                  <button type="button" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-colors">
                    Recover Key?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-3 rounded-xl border text-sm bg-white text-gray-900 placeholder-gray-400 outline-none transition-all ${
                      errors.password
                        ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50'
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</motion.p>
                )}
              </div>

              {/* Submit — black ESTABLISH LINK button */}
              <div className="pt-1">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 transition-colors tracking-wider uppercase"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
                      Authenticating…
                    </>
                  ) : (
                    <>
                      Establish Link <ArrowRight size={15} strokeWidth={2.5} />
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                Authentication Protocol
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google button */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full h-12 border border-gray-200 rounded-xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              {/* Google G icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Cross-Verify via Google
            </button>

            {/* Footer */}
            <p className="mt-5 text-center text-xs text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                Initialize Sync
              </Link>
            </p>

            <p className="mt-3 text-center">
              <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 hover:text-gray-600 transition-colors">
                ← Back to Home
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage

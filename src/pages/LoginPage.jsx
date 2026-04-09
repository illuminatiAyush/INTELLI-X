import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, ArrowRight, Mail, Lock, Sun, Moon, Check, Zap } from 'lucide-react'
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

  const bg = isDark ? 'bg-[var(--bg-app)]' : 'bg-[#f8fafc]'
  const brandingBg = isDark ? 'bg-[#0a0a0b]' : 'bg-[#f1f5f9]'
  const cardBg = isDark ? 'glass-card' : 'bg-white border-2 border-slate-200 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.1)] rounded-3xl'
  const inputBg = isDark 
    ? 'bg-transparent border-[var(--border-strong)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--color-purple)]'
    : 'bg-slate-100/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-900'
  const labelColor = 'text-[var(--text-secondary)]'
  const headingColor = 'text-[var(--text-primary)]'

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row overflow-hidden ${bg}`}>
      {/* Theme Toggle - Positioned in the Login Side */}
      <div className="fixed top-8 right-8 z-50">
        <button
          onClick={toggleTheme}
          className={`relative flex items-center justify-between gap-3 p-1.5 border rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 group overflow-hidden ${
            isDark ? 'glass-card border-[var(--border-strong)]' : 'bg-white border-slate-200'
          }`}
          aria-label="Toggle theme"
        >
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
            isDark ? 'bg-[var(--text-primary)]/10 text-[var(--text-primary)]' : 'bg-slate-100 text-slate-900'
          }`}>
            {isDark ? <Moon className="w-4 h-4 fill-current" /> : <Sun className="w-4 h-4" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{isDark ? 'Dark' : 'Light'}</span>
          </div>
          <div className="pr-3 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
        </button>
      </div>

      {/* Left Panel: Branding (Visible only on Desktop) */}
      <div 
        className={`hidden lg:flex lg:w-[48%] xl:w-[42%] ${brandingBg} border-r border-[var(--border-subtle)] flex-col items-center justify-center relative p-16 overflow-hidden`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)', zIndex: 10 }}
      >
        {/* Electric Glow along the edge */}
        <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[var(--text-primary)]/20 to-transparent blur-[1px] rotate-[1.5deg]" />

        {/* Subtle background abstract */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--text-primary)] blur-[150px] rounded-full -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--text-primary)] blur-[150px] rounded-full -ml-64 -mb-64 opacity-50" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 w-full flex flex-col items-center text-center pr-[12%]"
        >
          <Link to="/" className="flex flex-col items-center gap-10 group">
            <motion.div 
              animate={{ 
                boxShadow: isDark 
                  ? ['0 0 20px rgba(255,255,255,0.1)', '0 0 40px rgba(255,255,255,0.2)', '0 0 20px rgba(255,255,255,0.1)']
                  : ['0 0 20px rgba(15,23,42,0.1)', '0 0 40px rgba(15,23,42,0.2)', '0 0 20px rgba(15,23,42,0.1)']
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-36 h-36 rounded-[2.8rem] bg-[var(--text-primary)] text-[var(--bg-app)] flex items-center justify-center shadow-3xl group-hover:scale-105 transition-all duration-700 relative overflow-hidden"
            >
              <Zap className="w-20 h-20 fill-current" />
              <motion.div 
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              />
            </motion.div>
            
            <div className="space-y-6">
              <h1 className="text-7xl font-black tracking-tighter text-[var(--text-primary)]">
                INTELLI<span className="opacity-20 italic">X</span>
              </h1>
              <div className="w-32 h-1.5 bg-[var(--text-primary)]/30 mx-auto rounded-full" />
              <p className="text-xl font-bold text-[var(--text-secondary)] max-w-xs tracking-tight leading-relaxed">
                The <span className="text-[var(--text-primary)]">Intelligent</span> Operating System for Modern Institutes.
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Footer info in left panel */}
        <div className="absolute bottom-12 left-0 w-full px-16 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-40 pr-[18%]">
          <span>v2.8.5-pro</span>
          <span>© 2026 IntelliX Systems</span>
        </div>
      </div>

      {/* Right Panel: Authentication */}
      <div className={`flex-1 flex items-center justify-center p-6 lg:p-12 relative ${isDark ? '' : 'lg:pl-0'}`}>
        <div className="w-full max-w-md relative z-20">
          {/* Logo only visible on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden text-center mb-10"
          >
            <Link to="/" className="inline-flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-app)] flex items-center justify-center shadow-2xl">
                <Zap className="w-7 h-7 fill-current" />
              </div>
              <span className={`text-xl font-black tracking-tighter ${headingColor}`}>
                INTELLI<span className="opacity-50">X</span>
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`p-8 sm:p-10 relative overflow-hidden ${cardBg}`}
          >
            {/* Header */}
            <div className="mb-10 text-center sm:text-left relative">
              <div className="absolute -left-10 top-0 w-1 h-full bg-[var(--text-primary)] rounded-full opacity-0 sm:opacity-100" />
              <h1 className={`text-2xl sm:text-3xl font-black mb-2 tracking-tight ${headingColor}`}>Access Terminal</h1>
              <p className={`text-sm font-semibold ${labelColor} opacity-80 uppercase tracking-tighter`}>
                Security Level: <span className="text-[var(--text-primary)]">Authorized Only</span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="login-email" className={`block text-[10px] font-black uppercase tracking-widest ${labelColor}`}>
                  Digital Identity (Email)
                </label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-[var(--text-primary)] ${isDark ? 'text-white/20' : 'text-slate-400'}`} />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@institute.com"
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border text-sm outline-none transition-all duration-300 font-bold ${inputBg} ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'hover:border-[var(--text-primary)]/50'}`}
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className={`text-[10px] font-black uppercase tracking-widest ${labelColor}`}>
                    Access Key (Password)
                  </label>
                  <a href="#" className="text-[10px] uppercase font-black tracking-tighter text-[var(--color-purple)] hover:opacity-70 transition-opacity">
                    Recover Key?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-[var(--text-primary)] ${isDark ? 'text-white/20' : 'text-slate-400'}`} />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl border text-sm outline-none transition-all duration-300 font-bold ${inputBg} ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'hover:border-[var(--text-primary)]/50'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.01, letterSpacing: '0.3em' } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                  loading 
                    ? 'bg-[var(--text-secondary)]/20 text-[var(--text-secondary)] cursor-not-allowed' 
                    : 'bg-[var(--text-primary)] text-[var(--bg-app)] shadow-[0_20px_40px_-15px_rgba(var(--text-primary-rgb),0.3)] hover:shadow-[var(--text-primary)]/40'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-[var(--text-secondary)]/30 border-t-[var(--text-secondary)] rounded-full animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <>Establish Link <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-10">
              <div className="flex-1 h-px bg-[var(--text-primary)] opacity-10" />
              <span className={`text-[9px] font-black uppercase tracking-widest ${labelColor} opacity-40 italic`}>Encryption Protocol</span>
              <div className="flex-1 h-px bg-[var(--text-primary)] opacity-10" />
            </div>

            {/* Google Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.01, backgroundColor: 'var(--text-primary)', color: 'var(--bg-app)' }}
              whileTap={{ scale: 0.99 }}
              className={`w-full flex items-center justify-center gap-4 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                isDark ? 'border-[var(--text-primary)]/20 text-white hover:border-transparent' : 'border-slate-200 text-slate-900 hover:border-transparent hover:bg-slate-900 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" opacity="0.8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" opacity="0.6" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" opacity="0.9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Cross-Verify via Google
            </motion.button>

            {/* Footer Links */}
            <div className="mt-10 pt-6 border-t border-[var(--text-primary)] border-opacity-5 text-center">
              <p className={`text-[10px] font-black uppercase tracking-widest ${labelColor}`}>
                No Active Profile?{' '}
                <Link to="/register" className="text-[var(--text-primary)] hover:opacity-70 transition-opacity ml-1">
                  Initialize Sync
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Home Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link
              to="/"
              className={`text-[11px] uppercase font-black tracking-[0.5em] transition-all opacity-20 hover:opacity-100 hover:tracking-[0.6em] ${headingColor}`}
            >
              Back to Uplink
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

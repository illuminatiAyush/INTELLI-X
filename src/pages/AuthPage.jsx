import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, ArrowRight, Mail, Lock, Sun, Moon, Zap, User, Building2, GraduationCap, Briefcase, BookOpen, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'

const AuthPage = () => {
  const { isDark, toggleTheme } = useTheme()
  const { role, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Derive initial mode from URL
  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login')

  // Login state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginSubmitted, setLoginSubmitted] = useState(false)
  const [loginErrors, setLoginErrors] = useState({})

  // Register state
  const [regForm, setRegForm] = useState({ fullName: '', email: '', password: '', phone: '', role: 'student', instituteCode: '', subject: '' })
  const [regLoading, setRegLoading] = useState(false)
  const [regSubmitted, setRegSubmitted] = useState(false)
  const [regErrors, setRegErrors] = useState({})

  // Shared
  const [showPassword, setShowPassword] = useState(false)

  // Sync URL with mode (no page reload)
  useEffect(() => {
    const targetPath = mode === 'login' ? '/login' : '/register'
    if (location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath)
    }
  }, [mode, location.pathname])

  // Navigate after login when role is resolved
  useEffect(() => {
    if (loginSubmitted && role && user) {
      const pendingCode = sessionStorage.getItem('pendingJoinCode')
      if (pendingCode) {
        sessionStorage.removeItem('pendingJoinCode')
        navigate(`/dashboard/join/${pendingCode}`)
      } else {
        navigate('/dashboard')
      }
    }
  }, [loginSubmitted, role, user, navigate])

  // ─── Mode switch ────────────────────────
  const switchMode = (newMode) => {
    setShowPassword(false)
    setLoginErrors({})
    setRegErrors({})
    setMode(newMode)
  }

  // ─── Login handlers ─────────────────────
  const validateLogin = () => {
    const e = {}
    if (!loginForm.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) e.email = 'Enter a valid email address'
    if (!loginForm.password) e.password = 'Password is required'
    else if (loginForm.password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleLoginChange = (e) => {
    setLoginForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (loginErrors[e.target.name]) setLoginErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const errs = validateLogin()
    if (Object.keys(errs).length) { setLoginErrors(errs); return }
    setLoginLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      })
      if (error) { setLoginErrors({ email: error.message }); setLoginLoading(false); return }
      setLoginSubmitted(true)
      setTimeout(() => { setLoginLoading(false) }, 10000)
    } catch (err) {
      console.error('Login error:', err)
      setLoginErrors({ email: 'An unexpected error occurred' })
      setLoginLoading(false)
    }
  }

  // ─── Register handlers ──────────────────
  const validateRegister = () => {
    const e = {}
    if (!regForm.fullName.trim()) e.fullName = 'Full Name is required'
    if (!regForm.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) e.email = 'Enter a valid email address'
    if (!regForm.password) e.password = 'Password is required'
    else if (regForm.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!regForm.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\+?[\d\s\-]{10,15}$/.test(regForm.phone.trim())) e.phone = 'Enter a valid phone number'
    if (!regForm.instituteCode.trim()) e.instituteCode = 'Institute Code is required'
    if (regForm.role === 'teacher' && !regForm.subject.trim()) e.subject = 'Subject is required for teachers'
    return e
  }

  const handleRegChange = (e) => {
    setRegForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (regErrors[e.target.name]) setRegErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleRoleSelect = (role) => {
    setRegForm(prev => ({ ...prev, role, subject: role === 'student' ? '' : prev.subject }))
  }

  const handleRegSubmit = async (e) => {
    e.preventDefault()
    const errs = validateRegister()
    if (Object.keys(errs).length) { setRegErrors(errs); return }
    setRegLoading(true)
    try {
      const { data: institute, error: instError } = await supabase
        .rpc('get_institute_by_code', { code: regForm.instituteCode.toUpperCase() })
        .single()
      if (instError || !institute) {
        setRegErrors({ instituteCode: 'Invalid Institute Code.' })
        setRegLoading(false)
        return
      }
      const { error: authError } = await supabase.auth.signUp({
        email: regForm.email,
        password: regForm.password,
        options: {
          data: {
            role: regForm.role,
            first_name: regForm.fullName,
            institute_id: institute.id,
            phone: regForm.phone.trim(),
            ...(regForm.role === 'teacher' && { subject: regForm.subject.trim() })
          }
        }
      })
      if (authError) { setRegErrors({ email: authError.message }); setRegLoading(false); return }
      setRegSubmitted(true)
      setTimeout(() => { switchMode('login'); setRegSubmitted(false); setRegLoading(false) }, 2500)
    } catch (err) {
      console.error('Registration error:', err)
      setRegErrors({ email: 'An unexpected error occurred' })
      setRegLoading(false)
    }
  }

  // ─── Shared styling tokens ──────────────
  const bg = isDark ? 'bg-black' : 'bg-[#f8fafc]'
  const brandingBg = isDark ? 'bg-[#000000]' : 'bg-[#f1f5f9]'
  const cardBg = isDark 
    ? 'bg-[#0a0a0a] border border-white/10 shadow-2xl rounded-3xl' 
    : 'bg-white border border-slate-200 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.1)] rounded-3xl'
  const inputBg = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/30'
    : 'bg-slate-100/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-900'
  const labelColor = isDark ? 'text-gray-400' : 'text-slate-500'
  const headingColor = isDark ? 'text-white' : 'text-slate-900'

  // Framer motion variants for the form crossfade
  const formVariants = {
    enter: { opacity: 0, filter: 'blur(4px)', y: 8 },
    center: { opacity: 1, filter: 'blur(0px)', y: 0 },
    exit: { opacity: 0, filter: 'blur(4px)', y: -8 },
  }

  // ─── Error display helper ───────────────
  const ErrorMsg = ({ msg }) => msg ? (
    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-bold text-red-500 uppercase tracking-tight mt-1.5">{msg}</motion.p>
  ) : null

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row overflow-hidden ${bg}`}>
      {/* Theme Toggle */}
      <div className="fixed top-8 right-8 z-50">
        <button
          onClick={toggleTheme}
          className={`relative flex items-center justify-between gap-3 p-1.5 border rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 group overflow-hidden ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-slate-200'}`}
          aria-label="Toggle theme"
        >
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
            {isDark ? <Moon className="w-4 h-4 fill-current" /> : <Sun className="w-4 h-4" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{isDark ? 'Dark' : 'Light'}</span>
          </div>
          <div className={`pr-3 transition-colors ${isDark ? 'text-gray-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
        </button>
      </div>

      {/* Left Panel: Branding (Desktop only) */}
      <div
        className={`hidden lg:flex lg:w-[48%] xl:w-[42%] ${brandingBg} border-r border-white/5 flex-col items-center justify-center relative p-16 overflow-hidden`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)', zIndex: 10 }}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 w-full flex flex-col items-center text-center pr-[12%]"
        >
          <Link to="/" className="flex flex-col items-center gap-10 group">
            <motion.div
              className={`w-36 h-36 rounded-[2.8rem] flex items-center justify-center shadow-3xl group-hover:scale-105 transition-all duration-700 relative overflow-hidden ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
            >
              <Zap className="w-20 h-20 fill-current" />
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-transparent via-black/10 to-transparent' : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'} -skew-x-12`}
              />
            </motion.div>
            <div className="space-y-6">
              <h1 className={`text-7xl font-black tracking-tighter ${headingColor}`}>
                INTELLI<span className="opacity-20 italic">X</span>
              </h1>
              <div className={`w-32 h-1 gap-1.5 ${isDark ? 'bg-white/20' : 'bg-black/20'} mx-auto rounded-full`} />
              <p className={`text-xl font-bold ${labelColor} max-w-xs tracking-tight leading-relaxed`}>
                The <span className={headingColor}>Intelligent</span> Operating System for Modern Institutes.
              </p>
            </div>
          </Link>
        </motion.div>
        <div className={`absolute bottom-12 left-0 w-full px-16 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] ${labelColor} opacity-40 pr-[18%]`}>
          <span>v2.8.5-pro</span>
          <span>© 2026 IntelliX Systems</span>
        </div>
      </div>

      {/* Right Panel: Auth Card */}
      <div className={`flex-1 flex items-center justify-center p-6 lg:p-12 relative ${isDark ? '' : 'lg:pl-0'}`}>
        <div className="w-full max-w-md relative z-20">
          {/* Mobile Logo */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex flex-col items-center gap-3 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                <Zap className="w-7 h-7 fill-current" />
              </div>
              <span className={`text-xl font-black tracking-tighter ${headingColor}`}>
                INTELLI<span className="opacity-50">X</span>
              </span>
            </Link>
          </motion.div>

          {/* === THE CARD === */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`p-8 sm:p-10 relative overflow-hidden ${cardBg}`}
          >
            {/* Animated content swap */}
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                /* ===================== LOGIN FORM ===================== */
                <motion.div
                  key="login"
                  variants={formVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {/* Header */}
                  <div className="mb-10 text-center sm:text-left relative">
                    <div className={`absolute -left-10 top-0 w-1 h-full ${isDark ? 'bg-white' : 'bg-black'} rounded-full opacity-0 sm:opacity-100`} />
                    <h1 className={`text-2xl sm:text-3xl font-black mb-2 tracking-tight ${headingColor}`}>Access Terminal</h1>
                    <p className={`text-sm font-semibold ${labelColor} opacity-80 uppercase tracking-tighter`}>
                      Security Level: <span className={headingColor}>Authorized Only</span>
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} noValidate className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="login-email" className={`block text-[10px] font-black uppercase tracking-widest ${labelColor}`}>Digital Identity (Email)</label>
                      <div className="relative group">
                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:${headingColor} ${isDark ? 'text-white/20' : 'text-slate-400'}`} />
                        <input id="login-email" name="email" type="email" autoComplete="email" value={loginForm.email} onChange={handleLoginChange} placeholder="name@institute.com"
                          className={`w-full pl-12 pr-4 py-4 rounded-2xl border text-sm outline-none transition-all duration-300 font-bold ${inputBg} ${loginErrors.email ? 'border-red-500/50 focus:border-red-500' : ''}`}
                        />
                      </div>
                      <ErrorMsg msg={loginErrors.email} />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="login-password" className={`text-[10px] font-black uppercase tracking-widest ${labelColor}`}>Access Key (Password)</label>
                        <a href="#" className={`text-[10px] uppercase font-black tracking-tighter transition-opacity ${isDark ? 'text-white hover:opacity-70' : 'text-slate-900 hover:opacity-70'}`}>Recover Key?</a>
                      </div>
                      <div className="relative group">
                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:${headingColor} ${isDark ? 'text-white/20' : 'text-slate-400'}`} />
                        <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={loginForm.password} onChange={handleLoginChange} placeholder="••••••••"
                          className={`w-full pl-12 pr-12 py-4 rounded-2xl border text-sm outline-none transition-all duration-300 font-bold ${inputBg} ${loginErrors.password ? 'border-red-500/50 focus:border-red-500' : ''}`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} className={`absolute right-4 top-1/2 -translate-y-1/2 ${labelColor} hover:${headingColor} transition-colors`}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <ErrorMsg msg={loginErrors.password} />
                    </div>

                    {/* Submit */}
                    <motion.button id="login-submit-btn" type="submit" disabled={loginLoading}
                      whileHover={!loginLoading ? { scale: 1.01 } : {}}
                      whileTap={!loginLoading ? { scale: 0.99 } : {}}
                      className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden ${loginLoading ? 'bg-white/10 text-gray-500 cursor-not-allowed' : isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-black/90'}`}
                    >
                      {loginLoading ? (
                        <div className="flex items-center gap-3 relative z-10">
                          <div className={`w-4 h-4 border-2 ${isDark ? 'border-black/20 border-t-black' : 'border-white/20 border-t-white'} rounded-full animate-spin`} />
                          <span className="animate-pulse">Establishing Link...</span>
                        </div>
                      ) : (
                        <>Establish Link <ArrowRight className="w-4 h-4" /></>
                      )}
                    </motion.button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-10">
                    <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${labelColor} opacity-40 italic`}>Authentication Protocol</span>
                    <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                  </div>

                  {/* Google */}
                  <motion.button type="button"
                    whileHover={{ scale: 1.01, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full flex items-center justify-center gap-4 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" opacity="0.8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" opacity="0.6" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" opacity="0.9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Cross-Verify via Google
                  </motion.button>

                  {/* Switch to Register */}
                  <div className="mt-10 pt-6 border-t border-white/5 text-center">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${labelColor}`}>
                      No Active Profile?{' '}
                      <button onClick={() => switchMode('register')} className={`hover:opacity-70 transition-opacity ml-1 cursor-pointer ${isDark ? 'text-white' : 'text-black'}`}>
                        Initialize Sync
                      </button>
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* ===================== REGISTER FORM ===================== */
                <motion.div
                  key="register"
                  variants={formVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {regSubmitted ? (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                        <span className="text-2xl">✅</span>
                      </div>
                      <h2 className={`text-2xl font-black mb-2 ${headingColor}`}>Account Created!</h2>
                      <p className={`text-sm ${labelColor}`}>Switching to login terminal...</p>
                      <div className="mt-5 flex justify-center">
                        <div className={`w-8 h-1 ${isDark ? 'bg-white' : 'bg-black'} rounded-full animate-pulse`} />
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="mb-8 text-center sm:text-left relative">
                        <div className={`absolute -left-10 top-0 w-1 h-full ${isDark ? 'bg-white' : 'bg-black'} rounded-full opacity-0 sm:opacity-100`} />
                        <h1 className={`text-2xl sm:text-3xl font-black mb-2 tracking-tight ${headingColor}`}>Create Account</h1>
                        <p className={`text-sm font-semibold ${labelColor} opacity-80 uppercase tracking-tighter`}>
                          Join your institute seamlessly
                        </p>
                      </div>

                      <form onSubmit={handleRegSubmit} noValidate className="space-y-4">
                        {/* Role Switcher */}
                        <div className={`p-1 border rounded-xl flex gap-1 relative ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                          <button type="button" onClick={() => handleRoleSelect('student')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors ${regForm.role === 'student' ? 'text-black' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                          >
                            <GraduationCap className="w-4 h-4" /> Student
                          </button>
                          <button type="button" onClick={() => handleRoleSelect('teacher')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors ${regForm.role === 'teacher' ? 'text-black' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                          >
                            <Briefcase className="w-4 h-4" /> Teacher
                          </button>
                          <motion.div
                            className="absolute top-1 bottom-1 w-[calc(50%-6px)] bg-white rounded-lg -z-0"
                            initial={false}
                            animate={{ left: regForm.role === 'student' ? '4px' : 'calc(50% + 2px)' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        </div>

                        {/* Subject (teacher only) */}
                        <AnimatePresence>
                          {regForm.role === 'teacher' && (
                            <motion.div key="subject" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                              <div className="relative">
                                <BookOpen className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'} z-10`} />
                                <input name="subject" type="text" value={regForm.subject} onChange={handleRegChange} placeholder="Subject you teach *"
                                  className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${inputBg} ${regErrors.subject ? 'border-red-500/60 focus:border-red-500' : ''}`}
                                />
                              </div>
                              <ErrorMsg msg={regErrors.subject} />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Institute Code */}
                        <div>
                          <div className="relative">
                            <Building2 className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'} z-10`} />
                            <input name="instituteCode" type="text" value={regForm.instituteCode} onChange={handleRegChange} placeholder="Institute Join Code (e.g. A9B2X)"
                              className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 uppercase tracking-widest font-bold ${inputBg} ${regErrors.instituteCode ? 'border-red-500/60 focus:border-red-500' : ''}`}
                            />
                          </div>
                          <ErrorMsg msg={regErrors.instituteCode} />
                        </div>

                        {/* Full Name */}
                        <div>
                          <div className="relative">
                            <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
                            <input name="fullName" type="text" value={regForm.fullName} onChange={handleRegChange} placeholder="Full Name"
                              className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${inputBg} ${regErrors.fullName ? 'border-red-500/60 focus:border-red-500' : ''}`}
                            />
                          </div>
                          <ErrorMsg msg={regErrors.fullName} />
                        </div>

                        {/* Phone */}
                        <div>
                          <div className="relative">
                            <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
                            <input name="phone" type="tel" value={regForm.phone} onChange={handleRegChange} placeholder="Phone Number"
                              className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${inputBg} ${regErrors.phone ? 'border-red-500/60 focus:border-red-500' : ''}`}
                            />
                          </div>
                          <ErrorMsg msg={regErrors.phone} />
                        </div>

                        {/* Email */}
                        <div>
                          <div className="relative">
                            <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
                            <input name="email" type="email" autoComplete="email" value={regForm.email} onChange={handleRegChange} placeholder="Email address"
                              className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${inputBg} ${regErrors.email ? 'border-red-500/60 focus:border-red-500' : ''}`}
                            />
                          </div>
                          <ErrorMsg msg={regErrors.email} />
                        </div>

                        {/* Password */}
                        <div>
                          <div className="relative">
                            <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
                            <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={regForm.password} onChange={handleRegChange} placeholder="Password (min 6 characters)"
                              className={`w-full pl-10 pr-11 py-3.5 rounded-xl border text-sm outline-none transition-all duration-200 ${inputBg} ${regErrors.password ? 'border-red-500/60 focus:border-red-500' : ''}`}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                              className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${labelColor} hover:${headingColor} transition-colors`}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <ErrorMsg msg={regErrors.password} />
                        </div>

                        {/* Submit */}
                        <motion.button type="submit" disabled={regLoading}
                          whileHover={!regLoading ? { scale: 1.01 } : {}}
                          whileTap={!regLoading ? { scale: 0.99 } : {}}
                          className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden mt-2 ${regLoading ? 'bg-white/10 text-gray-500 cursor-not-allowed' : isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-black/90'}`}
                        >
                          {regLoading ? (
                            <div className="flex items-center gap-3 relative z-10">
                              <div className={`w-4 h-4 border-2 ${isDark ? 'border-black/20 border-t-black' : 'border-white/20 border-t-white'} rounded-full animate-spin`} />
                              <span className="animate-pulse">Creating Account...</span>
                            </div>
                          ) : (
                            <>Create Account <ArrowRight className="w-4 h-4" /></>
                          )}
                        </motion.button>
                      </form>

                      {/* Switch to Login */}
                      <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${labelColor}`}>
                          Already Synced?{' '}
                          <button onClick={() => switchMode('login')} className={`hover:opacity-70 transition-opacity ml-1 cursor-pointer ${isDark ? 'text-white' : 'text-black'}`}>
                            Access Terminal
                          </button>
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Home Link */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-12">
            <Link to="/" className={`text-[11px] uppercase font-black tracking-[0.5em] transition-all opacity-20 hover:opacity-100 hover:tracking-[0.6em] ${headingColor}`}>
              Back to Uplink
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage

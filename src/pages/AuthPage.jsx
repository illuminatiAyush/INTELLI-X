import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import {
  Eye, EyeOff, ArrowRight, Sun, Moon,
  GraduationCap, Briefcase, Mail, Lock,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

/* ── Field wrapper ── */
const Field = ({ label, error, children }) => (
  <div>
    {label && (
      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1.5">
        {label}
      </label>
    )}
    {children}
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1.5 text-[11px] font-medium text-red-500"
      >
        {error}
      </motion.p>
    )}
  </div>
)

/* ── Input base style ── */
const inputCls = (hasError) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 outline-none transition-all [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:#111827] ${
    hasError
      ? 'border-red-400 focus:ring-2 focus:ring-red-100 bg-white'
      : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 bg-white'
  }`

const AuthPage = () => {
  const { isDark, toggleTheme } = useTheme()
  const { role, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login')

  /* ── login state ── */
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginSubmitted, setLoginSubmitted] = useState(false)
  const [loginErrors, setLoginErrors] = useState({})

  /* ── register state ── */
  const [regForm, setRegForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    role: 'student', instituteCode: '', subject: '',
  })
  const [regLoading, setRegLoading] = useState(false)
  const [regSubmitted, setRegSubmitted] = useState(false)
  const [regErrors, setRegErrors] = useState({})

  const [showPassword, setShowPassword] = useState(false)

  /* sync URL */
  useEffect(() => {
    const target = mode === 'login' ? '/login' : '/register'
    if (location.pathname !== target) window.history.replaceState(null, '', target)
  }, [mode, location.pathname])

  /* redirect after login */
  useEffect(() => {
    if (loginSubmitted && role && user) {
      const code = sessionStorage.getItem('pendingJoinCode')
      if (code) { sessionStorage.removeItem('pendingJoinCode'); navigate(`/dashboard/join/${code}`) }
      else navigate('/dashboard')
    }
  }, [loginSubmitted, role, user, navigate])

  const switchMode = (m) => {
    setShowPassword(false)
    setLoginErrors({})
    setRegErrors({})
    setMode(m)
  }

  /* ── login handlers ── */
  const validateLogin = () => {
    const e = {}
    if (!loginForm.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) e.email = 'Enter a valid email'
    if (!loginForm.password) e.password = 'Password is required'
    else if (loginForm.password.length < 6) e.password = 'Min 6 characters'
    return e
  }

  const handleLoginChange = (e) => {
    setLoginForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (loginErrors[e.target.name]) setLoginErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const errs = validateLogin()
    if (Object.keys(errs).length) { setLoginErrors(errs); return }
    setLoginLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email, password: loginForm.password,
      })
      if (error) { setLoginErrors({ email: error.message }); setLoginLoading(false); return }
      setLoginSubmitted(true)
      setTimeout(() => setLoginLoading(false), 10000)
    } catch {
      setLoginErrors({ email: 'An unexpected error occurred' })
      setLoginLoading(false)
    }
  }

  /* ── register handlers ── */
  const validateRegister = () => {
    const e = {}
    if (!regForm.fullName.trim()) e.fullName = 'Full name is required'
    if (!regForm.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) e.email = 'Enter a valid email'
    if (!regForm.password) e.password = 'Password is required'
    else if (regForm.password.length < 6) e.password = 'Min 6 characters'
    if (!regForm.phone.trim()) e.phone = 'Phone is required'
    else if (!/^\+?[\d\s\-]{10,15}$/.test(regForm.phone.trim())) e.phone = 'Enter a valid phone number'
    if (!regForm.instituteCode.trim()) e.instituteCode = 'Institute code is required'
    if (regForm.role === 'teacher' && !regForm.subject.trim()) e.subject = 'Subject is required'
    return e
  }

  const handleRegChange = (e) => {
    setRegForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (regErrors[e.target.name]) setRegErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const handleRoleSelect = (r) => {
    setRegForm(p => ({ ...p, role: r, subject: r === 'student' ? '' : p.subject }))
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
        setRegErrors({ instituteCode: 'Invalid institute code.' })
        setRegLoading(false)
        return
      }
      const { error: authError } = await supabase.auth.signUp({
        email: regForm.email, password: regForm.password,
        options: {
          data: {
            role: regForm.role,
            first_name: regForm.fullName,
            institute_id: institute.id,
            phone: regForm.phone.trim(),
            ...(regForm.role === 'teacher' && { subject: regForm.subject.trim() }),
          },
        },
      })
      if (authError) { setRegErrors({ email: authError.message }); setRegLoading(false); return }
      setRegSubmitted(true)
      setTimeout(() => { switchMode('login'); setRegSubmitted(false); setRegLoading(false) }, 2500)
    } catch {
      setRegErrors({ email: 'An unexpected error occurred' })
      setRegLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex overflow-hidden bg-[#E8E8E8]">

      {/* ── Light / Dark toggle pill — fixed top right ── */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {isDark
            ? <><Sun size={13} className="text-amber-500" /> Light</>
            : <><Moon size={13} className="text-gray-600" /> Dark</>
          }
        </button>
      </div>

      {/* ══ LEFT — branding ══════════════════════════════════════ */}
      <div className="hidden lg:flex w-[42%] flex-col items-center justify-center gap-8 flex-shrink-0 bg-[#E8E8E8] relative">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6 text-center"
        >
          {/* Big black iX square */}
          <div
            className="w-44 h-44 rounded-[32px] flex items-center justify-center shadow-2xl"
            style={{ background: '#111111' }}
          >
            <span className="text-white font-black text-6xl tracking-tighter select-none">iX</span>
          </div>

          {/* INTELLIX wordmark */}
          <div>
            <h1 className="text-5xl font-black tracking-tight leading-none text-gray-900">
              INTELLI<span className="text-gray-400">X</span>
            </h1>
            <div className="w-8 h-0.5 bg-gray-400 mx-auto mt-4 mb-4 rounded-full" />
            <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">
              The <strong className="text-gray-800">Intelligent</strong> Operating System<br />
              for Modern Institutes.
            </p>
          </div>
        </motion.div>

        {/* Mobile logo fallback */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">v2.8.5</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">© 2026 IntelliX</span>
        </div>
      </div>

      {/* ══ RIGHT — form ════════════════════════════════════════ */}
      <div
        className="flex-1 flex items-center justify-center px-8 py-12 bg-white relative"
        style={{ clipPath: 'polygon(5% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
      >
        {/* Mobile logo */}
        <div className="absolute top-6 left-10 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
            <span className="text-white font-black text-sm">iX</span>
          </div>
          <span className="text-gray-900 font-bold text-sm">IntelliX</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-[400px]"
          >
            {/* ══ LOGIN CARD ══════════════════════════════════ */}
            {mode === 'login' && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">

                {/* Heading with blue left bar */}
                <div className="flex items-start gap-3 mb-7">
                  <div className="w-1 h-16 bg-blue-600 rounded-full flex-shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1.5">
                      Access Terminal
                    </h2>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
                      Security Level:{' '}
                      <span className="text-blue-600 font-black">Authorized Only</span>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">

                  {/* Email */}
                  <Field label="Digital Identity (Email)" error={loginErrors.email}>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        placeholder="name@institute.com"
                        className={inputCls(loginErrors.email) + ' pl-9'}
                      />
                    </div>
                  </Field>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
                        Access Key (Password)
                      </label>
                      <button type="button" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-700 transition-colors">
                        Recover Key?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        placeholder="••••••••"
                        className={inputCls(loginErrors.password) + ' pl-9 pr-10'}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-1.5 text-xs text-red-500 font-medium">
                        {loginErrors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* ESTABLISH LINK button — black */}
                  <div className="pt-1">
                    <motion.button
                      type="submit"
                      disabled={loginLoading}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-12 bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-colors tracking-[0.14em] uppercase"
                    >
                      {loginLoading ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
                          Authenticating…
                        </>
                      ) : (
                        <>
                          Establish Link <ArrowRight size={14} strokeWidth={2.5} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>

                {/* Authentication Protocol divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 whitespace-nowrap">
                    Authentication Protocol
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Google button */}
                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="w-full h-12 border border-gray-200 rounded-xl flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
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
                  <button
                    onClick={() => switchMode('register')}
                    className="font-bold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    Initialize Sync
                  </button>
                </p>
                <p className="mt-3 text-center">
                  <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 hover:text-gray-600 transition-colors">
                    ← Back to Home
                  </Link>
                </p>

              </div>
            )}

            {/* ══ REGISTER CARD ═══════════════════════════════ */}
            {mode === 'register' && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">

                <AnimatePresence mode="wait">
                  {regSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-16 flex flex-col items-center text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-6 text-2xl text-green-600">
                        ✓
                      </div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                        Account created
                      </h2>
                      <p className="text-sm text-gray-500">Switching to sign in…</p>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                      {/* Heading with blue left bar */}
                      <div className="flex items-start gap-3 mb-7">
                        <div className="w-1 h-14 bg-blue-600 rounded-full flex-shrink-0 mt-0.5" />
                        <div>
                          <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1.5">
                            Initialize Sync
                          </h2>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
                            Create your account
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleRegSubmit} noValidate className="space-y-4">

                        {/* Role switcher */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1.5">I am a</p>
                          <div className="flex gap-2 p-1 rounded-xl bg-gray-100 border border-gray-200">
                            {[
                              { value: 'student', label: 'Student', icon: GraduationCap },
                              { value: 'teacher', label: 'Teacher', icon: Briefcase },
                            ].map(({ value, label, icon: Icon }) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => handleRoleSelect(value)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                                  regForm.role === value
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                <Icon size={13} strokeWidth={2} />
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <Field label="Institute Code" error={regErrors.instituteCode}>
                          <input
                            name="instituteCode"
                            type="text"
                            value={regForm.instituteCode}
                            onChange={handleRegChange}
                            placeholder="e.g. A9B2X"
                            className={inputCls(regErrors.instituteCode) + ' uppercase tracking-widest font-bold'}
                          />
                        </Field>

                        <AnimatePresence>
                          {regForm.role === 'teacher' && (
                            <motion.div
                              key="subject"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <Field label="Subject you teach" error={regErrors.subject}>
                                <input
                                  name="subject"
                                  type="text"
                                  value={regForm.subject}
                                  onChange={handleRegChange}
                                  placeholder="e.g. Mathematics"
                                  className={inputCls(regErrors.subject)}
                                />
                              </Field>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Field label="Full Name" error={regErrors.fullName}>
                          <input
                            name="fullName"
                            type="text"
                            value={regForm.fullName}
                            onChange={handleRegChange}
                            placeholder="Your full name"
                            className={inputCls(regErrors.fullName)}
                          />
                        </Field>

                        <Field label="Phone" error={regErrors.phone}>
                          <input
                            name="phone"
                            type="tel"
                            value={regForm.phone}
                            onChange={handleRegChange}
                            placeholder="+91 99999 00000"
                            className={inputCls(regErrors.phone)}
                          />
                        </Field>

                        <Field label="Digital Identity (Email)" error={regErrors.email}>
                          <div className="relative">
                            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                              name="email"
                              type="email"
                              autoComplete="email"
                              value={regForm.email}
                              onChange={handleRegChange}
                              placeholder="you@institute.com"
                              className={inputCls(regErrors.email) + ' pl-9'}
                            />
                          </div>
                        </Field>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1.5">
                            Access Key (Password)
                          </label>
                          <div className="relative">
                            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              value={regForm.password}
                              onChange={handleRegChange}
                              placeholder="Min 6 characters"
                              className={inputCls(regErrors.password) + ' pl-9 pr-10'}
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => setShowPassword(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                            </button>
                          </div>
                          {regErrors.password && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                              className="mt-1.5 text-xs text-red-500 font-medium">
                              {regErrors.password}
                            </motion.p>
                          )}
                        </div>

                        {/* CREATE button — black */}
                        <div className="pt-1">
                          <motion.button
                            type="submit"
                            disabled={regLoading}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-12 bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-colors tracking-[0.14em] uppercase"
                          >
                            {regLoading ? (
                              <>
                                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
                                Creating account…
                              </>
                            ) : (
                              <>
                                Create Account <ArrowRight size={14} strokeWidth={2.5} />
                              </>
                            )}
                          </motion.button>
                        </div>
                      </form>

                      <p className="mt-5 text-center text-xs text-gray-500">
                        Already have an account?{' '}
                        <button
                          onClick={() => switchMode('login')}
                          className="font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          Access Terminal
                        </button>
                      </p>
                      <p className="mt-3 text-center">
                        <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 hover:text-gray-600 transition-colors">
                          ← Back to Home
                        </Link>
                      </p>

                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AuthPage

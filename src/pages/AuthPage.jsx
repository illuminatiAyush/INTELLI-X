import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import {
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  GraduationCap,
  Briefcase,
  Mail,
  Lock,
  User,
  Phone,
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart3,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Layers,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import './LandingPage.css'

// ── Interactive ASCII Canvas Background (Matching Landing Page Aesthetic) ──
const ASCII_CHARS = " .·:-=+*#@"

function AsciiBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouse = { x: -9999, y: -9999, active: false }
    let width = 0
    let height = 0
    let animId = 0
    let lastTime = 0
    let isIntersecting = true
    let asciiRgb = '255 255 255'
    const colorCache = new Map()

    const updateColor = () => {
      const root = canvas.closest('.landing-page-root') || document.documentElement
      const isLight = root.classList.contains('light') || document.documentElement.classList.contains('light')
      const val = getComputedStyle(root).getPropertyValue('--ascii').trim()
      asciiRgb = val && val !== '' ? val : (isLight ? '35 35 40' : '255 255 255')
      colorCache.clear()
    }

    const getColor = (alpha) => {
      const key = Math.min(100, Math.max(0, Math.round(100 * alpha)))
      let col = colorCache.get(key)
      if (!col) {
        col = `rgb(${asciiRgb} / ${key / 100})`
        colorCache.set(key, col)
      }
      return col
    }

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height)
      ctx.font = '11px ui-monospace, "Geist Mono", monospace'
      ctx.textBaseline = 'top'
      const midX = width / 2

      for (let y = 0; y < height; y += 14) {
        const rowFade = Math.max(0, 1 - y / (0.95 * height))
        for (let x = 0; x < width; x += 12) {
          const wave = (
            Math.sin(0.045 * x + 0.00045 * time) +
            Math.sin(0.07 * y - 0.00035 * time) +
            Math.sin((x - y) * 0.03 + 0.0006 * time)
          ) / 3

          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y)
          const mouseInfluence = distToMouse < 140
            ? Math.pow(1 - distToMouse / 140, 1.35) * 0.55
            : 0

          const intensity = ((wave + 1) / 2) * 0.55 * rowFade + 0.35 * mouseInfluence
          const charIndex = Math.min(ASCII_CHARS.length - 1, Math.floor(intensity * ASCII_CHARS.length))

          if (charIndex !== 0 || mouseInfluence > 0.04) {
            const finalCharIdx = Math.max(charIndex, mouseInfluence > 0.35 ? 4 : (mouseInfluence > 0.1 ? 2 : 1))
            const baseAlpha = 0.12 + (finalCharIdx / ASCII_CHARS.length) * 0.35
            const hoverAlpha = 0.25 * mouseInfluence
            const alpha = Math.min(0.9, baseAlpha + hoverAlpha)

            if (mouseInfluence > 0.06) {
              const root = canvas.closest('.landing-page-root') || document.documentElement
              const isLight = root.classList.contains('light')
              ctx.fillStyle = isLight ? `rgba(37, 99, 235, ${alpha})` : `rgba(96, 165, 250, ${alpha})`
            } else {
              ctx.fillStyle = getColor(alpha)
            }

            ctx.fillText(ASCII_CHARS[finalCharIdx], x, y)
          }
        }
      }
    }

    const loop = (time) => {
      animId = requestAnimationFrame(loop)
      if (!isIntersecting) return
      if (time - lastTime < 35) return
      lastTime = time
      draw(time)
    }

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (width < 1 || height < 1) return
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw(performance.now())
    }

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }

    const handlePointerLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
      mouse.active = false
    }

    updateColor()

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas)

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting
    })
    intersectionObserver.observe(canvas)

    handleResize()

    if (!prefersReducedMotion) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true })
      window.addEventListener('pointerleave', handlePointerLeave, { passive: true })
      animId = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-30"
    />
  )
}

/* ── Field Component ── */
const Field = ({ label, error, rightLabel, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      {label && (
        <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--wl-muted)] font-medium">
          {label}
        </label>
      )}
      {rightLabel}
    </div>
    {children}
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-rose-500 font-medium flex items-center gap-1.5 pt-0.5"
      >
        <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
        {error}
      </motion.p>
    )}
  </div>
)

const AuthPage = () => {
  const { isDark, toggleTheme } = useTheme()
  const { role, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login')

  /* ── Login state ── */
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginSubmitted, setLoginSubmitted] = useState(false)
  const [loginErrors, setLoginErrors] = useState({})

  /* ── Register state ── */
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'student',
    instituteCode: '',
    subject: '',
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
      if (code) {
        sessionStorage.removeItem('pendingJoinCode')
        navigate(`/dashboard/join/${code}`)
      } else {
        navigate('/dashboard')
      }
    }
  }, [loginSubmitted, role, user, navigate])

  const switchMode = (m) => {
    setShowPassword(false)
    setLoginErrors({})
    setRegErrors({})
    setMode(m)
  }

  /* ── Login handlers ── */
  const validateLogin = () => {
    const e = {}
    if (!loginForm.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) e.email = 'Enter a valid email address'
    if (!loginForm.password) e.password = 'Password is required'
    else if (loginForm.password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  const handleLoginChange = (e) => {
    setLoginForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    if (loginErrors[e.target.name]) setLoginErrors((p) => ({ ...p, [e.target.name]: '' }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const errs = validateLogin()
    if (Object.keys(errs).length) {
      setLoginErrors(errs)
      return
    }
    setLoginLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      })
      if (error) {
        setLoginErrors({ email: error.message })
        setLoginLoading(false)
        return
      }
      setLoginSubmitted(true)
      setTimeout(() => setLoginLoading(false), 10000)
    } catch {
      setLoginErrors({ email: 'An unexpected authentication error occurred.' })
      setLoginLoading(false)
    }
  }

  /* ── Register handlers ── */
  const validateRegister = () => {
    const e = {}
    if (!regForm.fullName.trim()) e.fullName = 'Full name is required'
    if (!regForm.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) e.email = 'Enter a valid email address'
    if (!regForm.password) e.password = 'Password is required'
    else if (regForm.password.length < 6) e.password = 'Minimum 6 characters'
    if (!regForm.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\+?[\d\s\-]{10,15}$/.test(regForm.phone.trim())) e.phone = 'Enter a valid phone number'
    if (!regForm.instituteCode.trim()) e.instituteCode = 'Institute code is required'
    if (regForm.role === 'teacher' && !regForm.subject.trim()) e.subject = 'Subject is required'
    return e
  }

  const handleRegChange = (e) => {
    setRegForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    if (regErrors[e.target.name]) setRegErrors((p) => ({ ...p, [e.target.name]: '' }))
  }

  const handleRoleSelect = (r) => {
    setRegForm((p) => ({ ...p, role: r, subject: r === 'student' ? '' : p.subject }))
  }

  const handleRegSubmit = async (e) => {
    e.preventDefault()
    const errs = validateRegister()
    if (Object.keys(errs).length) {
      setRegErrors(errs)
      return
    }
    setRegLoading(true)
    try {
      const { data: institute, error: instError } = await supabase
        .rpc('get_institute_by_code', { code: regForm.instituteCode.toUpperCase() })
        .single()
      if (instError || !institute) {
        setRegErrors({ instituteCode: 'Invalid institute code. Check with your administrator.' })
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
            ...(regForm.role === 'teacher' && { subject: regForm.subject.trim() }),
          },
        },
      })
      if (authError) {
        setRegErrors({ email: authError.message })
        setRegLoading(false)
        return
      }
      setRegSubmitted(true)
      setTimeout(() => {
        switchMode('login')
        setRegSubmitted(false)
        setRegLoading(false)
      }, 2500)
    } catch {
      setRegErrors({ email: 'An unexpected error occurred during account creation.' })
      setRegLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className={`landing-page-root min-h-screen flex flex-col justify-between ${isDark ? 'dark' : 'light'} relative selection:bg-blue-500/20 selection:text-blue-500 overflow-x-hidden`}>
      
      {/* ── Background ASCII Canvas & Gradient Aura ── */}
      <AsciiBackground />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.18),transparent_70%)] pointer-events-none" />

      {/* ── Navigation Header (Landing Page Style) ── */}
      <header className="relative z-20 border-b border-[var(--wl-line)]/70 bg-[var(--wl-bg)]/60 backdrop-blur-md px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Terminal Tag */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={isDark ? "/intellix-wordmark-white.png" : "/intellix-wordmark-black.png"}
                alt="IntelliX"
                className="h-6 sm:h-7 w-auto object-contain transition-opacity group-hover:opacity-80"
              />
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] text-[10px] font-mono text-[var(--wl-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AUTH TERMINAL</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--wl-muted)] hover:text-[var(--wl-fg)] hover:bg-[var(--wl-surface-2)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Platform</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] text-xs font-medium text-[var(--wl-muted)] hover:text-[var(--wl-fg)] hover:border-[var(--wl-muted)] transition-all"
              title="Toggle theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline font-mono text-[11px]">LIGHT</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-700" />
                  <span className="hidden sm:inline font-mono text-[11px]">DARK</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* ── Main Layout: Hero Showcase & Auth Card ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ══ LEFT: Brand & Capabilities Showcase ══ */}
          <div className="hidden lg:flex lg:col-span-6 flex-col space-y-8 pr-4">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>INTELLI-X // COHORT OS 2.8</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-light text-[var(--wl-fg)] tracking-tight leading-[1.08] font-heading">
                The <span className="font-editorial-italic font-normal text-blue-500">intelligent</span> command center for modern institutes.
              </h1>

              <p className="text-base text-[var(--wl-muted)] leading-relaxed max-w-lg">
                Autonomous attendance tracking, algorithmic marksheet generation, and automated parent communication in one unified, real-time interface.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[var(--wl-surface-2)]/70 border border-[var(--wl-line)]/80 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--wl-fg)] font-mono uppercase tracking-wider">
                    Role-Gated Enclave
                  </h4>
                  <p className="text-xs text-[var(--wl-muted)] mt-0.5">
                    Separated portals for institutional directors, faculty instructors, students, and parents.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[var(--wl-surface-2)]/70 border border-[var(--wl-line)]/80 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--wl-fg)] font-mono uppercase tracking-wider">
                    Sub-Millisecond Data Sync
                  </h4>
                  <p className="text-xs text-[var(--wl-muted)] mt-0.5">
                    Live batch updates, offline-tolerant marks entry, and instantaneous leaderboard recalculations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[var(--wl-surface-2)]/70 border border-[var(--wl-line)]/80 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--wl-fg)] font-mono uppercase tracking-wider">
                    Automated Performance Intelligence
                  </h4>
                  <p className="text-xs text-[var(--wl-muted)] mt-0.5">
                    Deep test metrics and scheduled dispatch directly into parent messaging channels.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="flex items-center gap-6 pt-2 text-xs font-mono text-[var(--wl-faint)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                99.98% System Uptime
              </span>
              <span>256-Bit SSL Enclave</span>
              <span>ISO 27001 Certified</span>
            </div>

          </div>

          {/* ══ RIGHT: Auth Terminal Card ══ */}
          <div className="w-full lg:col-span-6 max-w-md mx-auto">
            <div className="relative rounded-2xl bg-[var(--wl-surface)] border border-[var(--wl-line)] p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden transition-all">
              
              {/* Subtle Top Cyan/Blue Glow Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

              {/* Segmented Mode Selector (Sign In vs Create Account) */}
              <div className="p-1 rounded-xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono font-medium uppercase tracking-wider transition-all ${
                    mode === 'login'
                      ? 'bg-[var(--wl-surface)] text-[var(--wl-fg)] shadow-sm border border-[var(--wl-line)]'
                      : 'text-[var(--wl-muted)] hover:text-[var(--wl-fg)]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono font-medium uppercase tracking-wider transition-all ${
                    mode === 'register'
                      ? 'bg-[var(--wl-surface)] text-[var(--wl-fg)] shadow-sm border border-[var(--wl-line)]'
                      : 'text-[var(--wl-muted)] hover:text-[var(--wl-fg)]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <AnimatePresence mode="wait">
                {mode === 'login' ? (
                  /* ─── LOGIN VIEW ─── */
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-[var(--wl-fg)] tracking-tight font-heading">
                        Access Terminal
                      </h2>
                      <p className="text-xs text-[var(--wl-muted)] mt-1">
                        Enter your credentials to enter your institute workspace.
                      </p>
                    </div>

                    <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                      {/* Email Field */}
                      <Field label="Email Address" error={loginErrors.email}>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[var(--wl-faint)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={loginForm.email}
                            onChange={handleLoginChange}
                            placeholder="name@institute.com"
                            className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2.5 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10"
                          />
                        </div>
                      </Field>

                      {/* Password Field */}
                      <Field
                        label="Password"
                        error={loginErrors.password}
                        rightLabel={
                          <span className="text-[11px] font-mono text-[var(--wl-muted)] hover:text-blue-500 cursor-pointer transition-colors">
                            Forgot?
                          </span>
                        }
                      >
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[var(--wl-faint)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={loginForm.password}
                            onChange={handleLoginChange}
                            placeholder="••••••••"
                            className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2.5 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--wl-faint)] hover:text-[var(--wl-fg)] transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </Field>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full h-11 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-medium text-xs rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group tracking-wider uppercase font-mono mt-2"
                      >
                        {loginLoading ? (
                          <>
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                            <span>Authenticating…</span>
                          </>
                        ) : (
                          <>
                            <span>Establish Session</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                      <div className="flex-1 h-px bg-[var(--wl-line)]" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--wl-faint)]">
                        or verify with
                      </span>
                      <div className="flex-1 h-px bg-[var(--wl-line)]" />
                    </div>

                    {/* Google OAuth Button */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full h-11 bg-[var(--wl-surface-2)] hover:bg-[var(--wl-surface-3)] border border-[var(--wl-line)] text-[var(--wl-fg)] text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    {/* Bottom Helper */}
                    <p className="mt-5 text-center text-xs text-[var(--wl-muted)]">
                      New to the platform?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        Create an account
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  /* ─── REGISTER VIEW ─── */
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {regSubmitted ? (
                      <div className="py-12 flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--wl-fg)] font-heading">
                          Account Created
                        </h3>
                        <p className="text-xs text-[var(--wl-muted)] max-w-xs">
                          Your profile has been verified and synced with your institute. Redirecting to terminal…
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-5">
                          <h2 className="text-2xl font-bold text-[var(--wl-fg)] tracking-tight font-heading">
                            Initialize Sync
                          </h2>
                          <p className="text-xs text-[var(--wl-muted)] mt-1">
                            Link your profile with your institute code to join your cohort.
                          </p>
                        </div>

                        <form onSubmit={handleRegSubmit} noValidate className="space-y-3.5">
                          {/* Role Selector Pill */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--wl-muted)] font-medium">
                              Select Role
                            </label>
                            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)]">
                              <button
                                type="button"
                                onClick={() => handleRoleSelect('student')}
                                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                                  regForm.role === 'student'
                                    ? 'bg-[var(--wl-surface)] text-blue-500 shadow-sm border border-[var(--wl-line)]'
                                    : 'text-[var(--wl-muted)] hover:text-[var(--wl-fg)]'
                                }`}
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                                Student
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRoleSelect('teacher')}
                                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                                  regForm.role === 'teacher'
                                    ? 'bg-[var(--wl-surface)] text-blue-500 shadow-sm border border-[var(--wl-line)]'
                                    : 'text-[var(--wl-muted)] hover:text-[var(--wl-fg)]'
                                }`}
                              >
                                <Briefcase className="w-3.5 h-3.5" />
                                Teacher
                              </button>
                            </div>
                          </div>

                          {/* Institute Code */}
                          <Field
                            label="Institute Code"
                            error={regErrors.instituteCode}
                            rightLabel={
                              <span className="text-[10px] font-mono text-[var(--wl-faint)]">
                                Provided by Admin
                              </span>
                            }
                          >
                            <div className="relative">
                              <KeyRound className="w-4 h-4 text-[var(--wl-faint)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                name="instituteCode"
                                type="text"
                                value={regForm.instituteCode}
                                onChange={handleRegChange}
                                placeholder="e.g. APEX01"
                                className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2 text-sm font-mono tracking-widest uppercase text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10"
                              />
                            </div>
                          </Field>

                          {/* Teacher Subject (Conditional) */}
                          <AnimatePresence>
                            {regForm.role === 'teacher' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <Field label="Subject You Teach" error={regErrors.subject}>
                                  <input
                                    name="subject"
                                    type="text"
                                    value={regForm.subject}
                                    onChange={handleRegChange}
                                    placeholder="e.g. Physics / Mathematics"
                                    className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                  />
                                </Field>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Full Name */}
                          <Field label="Full Name" error={regErrors.fullName}>
                            <div className="relative">
                              <User className="w-4 h-4 text-[var(--wl-faint)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                name="fullName"
                                type="text"
                                value={regForm.fullName}
                                onChange={handleRegChange}
                                placeholder="Aarav Sharma"
                                className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10"
                              />
                            </div>
                          </Field>

                          {/* Phone Number */}
                          <Field label="Phone (WhatsApp Alerts)" error={regErrors.phone}>
                            <div className="relative">
                              <Phone className="w-4 h-4 text-[var(--wl-faint)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                name="phone"
                                type="tel"
                                value={regForm.phone}
                                onChange={handleRegChange}
                                placeholder="+91 98765 43210"
                                className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10"
                              />
                            </div>
                          </Field>

                          {/* Email */}
                          <Field label="Email Address" error={regErrors.email}>
                            <div className="relative">
                              <Mail className="w-4 h-4 text-[var(--wl-faint)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={regForm.email}
                                onChange={handleRegChange}
                                placeholder="name@institute.com"
                                className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10"
                              />
                            </div>
                          </Field>

                          {/* Password */}
                          <Field label="Create Password" error={regErrors.password}>
                            <div className="relative">
                              <Lock className="w-4 h-4 text-[var(--wl-faint)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={regForm.password}
                                onChange={handleRegChange}
                                placeholder="Min 6 characters"
                                className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pl-10 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--wl-faint)] hover:text-[var(--wl-fg)] transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </Field>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={regLoading}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-medium text-xs rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group tracking-wider uppercase font-mono mt-3"
                          >
                            {regLoading ? (
                              <>
                                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                                <span>Creating Account…</span>
                              </>
                            ) : (
                              <>
                                <span>Initialize Sync</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </button>
                        </form>

                        {/* Bottom Helper */}
                        <p className="mt-4 text-center text-xs text-[var(--wl-muted)]">
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            Sign in here
                          </button>
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </main>

      {/* ── Minimal Footer (Landing Page Style) ── */}
      <footer className="relative z-10 border-t border-[var(--wl-line)]/50 py-4 px-4 sm:px-8 bg-[var(--wl-bg)]/40 backdrop-blur-xs text-center text-xs text-[var(--wl-faint)] font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 INTELLI-X // ALL RIGHTS RESERVED</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-[var(--wl-fg)] transition-colors">Overview</Link>
            <a href="#privacy" className="hover:text-[var(--wl-fg)] transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-[var(--wl-fg)] transition-colors">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default AuthPage

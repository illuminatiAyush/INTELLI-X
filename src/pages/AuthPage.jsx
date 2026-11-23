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
  Mail,
  Lock,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Check,
  AlertCircle,
  Sparkles,
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
              ctx.fillStyle = isLight ? `rgba(132, 204, 22, ${alpha})` : `rgba(190, 242, 100, ${alpha})`
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

  // Extract query parameters for invite link / pre-filling
  const searchParams = new URLSearchParams(location.search)
  const initialCode = (searchParams.get('code') || searchParams.get('invite') || '').trim()
  const initialEmail = (searchParams.get('email') || '').trim()

  const [mode, setMode] = useState(
    location.pathname === '/register' || location.pathname === '/activate' || initialCode
      ? 'activate'
      : 'login'
  )

  /* ── Login state ── */
  const [loginForm, setLoginForm] = useState({ email: initialEmail, password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginSubmitted, setLoginSubmitted] = useState(false)
  const [loginErrors, setLoginErrors] = useState({})

  /* ── Account Activation state ── */
  const [actForm, setActForm] = useState({
    inviteCode: initialCode,
    email: initialEmail,
    password: '',
    confirmPassword: '',
  })
  const [actLoading, setActLoading] = useState(false)
  const [actSubmitted, setActSubmitted] = useState(false)
  const [actSuccessMsg, setActSuccessMsg] = useState('')
  const [actErrors, setActErrors] = useState({})

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /* Listen to query params changes */
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const code = params.get('code') || params.get('invite')
    const email = params.get('email')
    if (code || email) {
      setActForm((prev) => ({
        ...prev,
        inviteCode: code ? code.trim() : prev.inviteCode,
        email: email ? email.trim() : prev.email,
      }))
      if (code) {
        setMode('activate')
      }
    }
  }, [location.search])

  /* sync URL path */
  useEffect(() => {
    const currentPath = location.pathname
    if (mode === 'login' && currentPath !== '/login') {
      window.history.replaceState(null, '', '/login')
    } else if (mode === 'activate' && currentPath !== '/activate' && currentPath !== '/register') {
      window.history.replaceState(null, '', '/activate')
    }
  }, [mode, location.pathname])

  /* redirect after login or activation */
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
    setShowConfirmPassword(false)
    setLoginErrors({})
    setActErrors({})
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
        email: loginForm.email.trim(),
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

  /* ── Activate handlers ── */
  const validateActivate = () => {
    const e = {}
    const code = actForm.inviteCode.trim()
    if (!code) {
      e.inviteCode = 'Invite code or link token is required'
    } else if (code.length < 4) {
      e.inviteCode = 'Invite code must be at least 4 characters'
    }

    if (!actForm.email.trim()) {
      e.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(actForm.email)) {
      e.email = 'Enter a valid email address'
    }

    if (!actForm.password) {
      e.password = 'Password is required'
    } else if (actForm.password.length < 6) {
      e.password = 'Minimum 6 characters required'
    }

    if (!actForm.confirmPassword) {
      e.confirmPassword = 'Confirm your password'
    } else if (actForm.password !== actForm.confirmPassword) {
      e.confirmPassword = 'Passwords do not match'
    }

    return e
  }

  const handleActChange = (e) => {
    const { name, value } = e.target
    setActForm((p) => ({ ...p, [name]: value }))
    if (actErrors[name]) setActErrors((p) => ({ ...p, [name]: '' }))
  }

  const handleActivateSubmit = async (e) => {
    e.preventDefault()
    const errs = validateActivate()
    if (Object.keys(errs).length) {
      setActErrors(errs)
      return
    }

    setActLoading(true)
    const cleanCode = actForm.inviteCode.trim().toUpperCase()
    const cleanEmail = actForm.email.trim().toLowerCase()

    try {
      let instituteId = null
      let batchId = null
      let assignedRole = 'student'

      // Check institute join code RPC
      const { data: instData } = await supabase
        .rpc('get_institute_by_code', { code: cleanCode })
        .maybeSingle()

      if (instData?.id) {
        instituteId = instData.id
      } else {
        // Check batch join code
        const { data: batchData } = await supabase
          .from('batches')
          .select('id, name, institute_id')
          .eq('join_code', cleanCode)
          .maybeSingle()

        if (batchData?.id) {
          batchId = batchData.id
          instituteId = batchData.institute_id
        } else {
          // Check institutes table directly
          const { data: instDirect } = await supabase
            .from('institutes')
            .select('id, name')
            .eq('join_code', cleanCode)
            .maybeSingle()

          if (instDirect?.id) {
            instituteId = instDirect.id
          }
        }
      }

      // Check pre-registered student/teacher rosters
      if (!instituteId) {
        const { data: existingStudent } = await supabase
          .from('students')
          .select('id, institute_id')
          .eq('email', cleanEmail)
          .maybeSingle()

        if (existingStudent?.institute_id) {
          instituteId = existingStudent.institute_id
          assignedRole = 'student'
        } else {
          const { data: existingTeacher } = await supabase
            .from('teachers')
            .select('id, institute_id')
            .eq('email', cleanEmail)
            .maybeSingle()

          if (existingTeacher?.institute_id) {
            instituteId = existingTeacher.institute_id
            assignedRole = 'teacher'
          }
        }
      }

      // If code verification failed
      if (!instituteId) {
        setActErrors({
          inviteCode: 'Invalid or unverified invite code. Please contact your institute administrator.',
        })
        setActLoading(false)
        return
      }

      // Perform user activation / sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: actForm.password,
        options: {
          data: {
            role: assignedRole,
            institute_id: instituteId,
            invite_code: cleanCode,
            activated: true,
            activated_at: new Date().toISOString(),
          },
        },
      })

      if (authError) {
        if (
          authError.message.includes('already registered') ||
          authError.message.includes('User already registered')
        ) {
          // Check if user credentials authenticate
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: actForm.password,
          })
          if (!signInErr) {
            setActSuccessMsg('Account already activated! Establishing session…')
            setActSubmitted(true)
            setTimeout(() => {
              navigate('/dashboard')
            }, 1200)
            return
          } else {
            setActErrors({
              email:
                'This account is already registered. Please Sign In, or use password reset if forgotten.',
            })
            setActLoading(false)
            return
          }
        } else {
          setActErrors({ email: authError.message })
          setActLoading(false)
          return
        }
      }

      if (batchId) {
        sessionStorage.setItem('pendingJoinCode', cleanCode)
      }

      setActSuccessMsg('Account activated! Establishing workspace session…')
      setActSubmitted(true)

      // Auto sign-in if session was not automatically populated
      if (!authData.session) {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: actForm.password,
        })
      }

      setTimeout(() => {
        const pendingCode = sessionStorage.getItem('pendingJoinCode')
        if (pendingCode) {
          sessionStorage.removeItem('pendingJoinCode')
          navigate(`/dashboard/join/${pendingCode}`)
        } else {
          navigate('/dashboard')
        }
      }, 1600)
    } catch {
      setActErrors({
        inviteCode: 'An unexpected error occurred during account activation.',
      })
      setActLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const isPasswordMatch =
    actForm.confirmPassword.length > 0 &&
    actForm.password.length >= 6 &&
    actForm.password === actForm.confirmPassword

  const isPasswordMismatch =
    actForm.confirmPassword.length > 0 &&
    actForm.password !== actForm.confirmPassword

  return (
    <div className={`landing-page-root min-h-screen flex flex-col justify-between ${isDark ? 'dark' : 'light'} relative selection:bg-lime-400/20 selection:text-lime-400 overflow-x-hidden`}>
      
      {/* ── Background ASCII Canvas & Gradient Aura ── */}
      <AsciiBackground />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(190, 242, 100, 0.18),transparent_70%)] pointer-events-none" />

      {/* ── Navigation Header (Landing Page Style) ── */}
      <header className="relative z-20 border-b border-[var(--wl-line)]/70 bg-[var(--wl-bg)]/60 backdrop-blur-md px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={isDark ? "/intellix-wordmark-white.png" : "/intellix-wordmark-black.png"}
              alt="IntelliX"
              className="h-6 sm:h-7 w-auto object-contain transition-opacity group-hover:opacity-80"
            />
          </Link>

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
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/25 text-[11px] font-mono uppercase tracking-wider text-lime-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Invite-Only Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-light text-[var(--wl-fg)] tracking-tight leading-[1.12] font-heading">
                The <span className="font-editorial-italic font-normal text-lime-400">intelligent</span> command center for modern institutes.
              </h1>

              <p className="text-sm text-[var(--wl-muted)] leading-relaxed max-w-md">
                Autonomous attendance tracking, algorithmic marksheet generation, and automated parent communication in one unified, single-institute interface.
              </p>
            </div>

            {/* Minimal Indicators */}
            <div className="pt-1 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-mono text-[var(--wl-muted)]">
              <span className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Real-time Sync
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                Zero Public Signups
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                Encrypted Gradebooks
              </span>
            </div>

            {/* Security Notice Card */}
            <div className="p-4 rounded-xl bg-[var(--wl-surface)] border border-[var(--wl-line)] max-w-md text-xs text-[var(--wl-muted)] space-y-2">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--wl-fg)] font-medium">
                <KeyRound className="w-3.5 h-3.5 text-lime-400" />
                Admin Provisioned Access
              </div>
              <p className="leading-relaxed">
                To protect student data integrity and institute privacy, accounts cannot be registered publicly. Enter the activation code supplied in your onboarding invitation.
              </p>
            </div>

          </div>

          {/* ══ RIGHT: Auth Terminal Card ══ */}
          <div className="w-full lg:col-span-6 max-w-md mx-auto">
            <motion.div
              layout
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl bg-[var(--wl-surface)] border border-[var(--wl-line)] p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden transition-all"
            >
              
              {/* Subtle Top Cyan/Lime Glow Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-lime-400 to-transparent" />

              {/* Segmented Mode Selector (Sign In vs Activate Account) */}
              <div className="relative p-1 rounded-xl bg-[var(--wl-surface-2)] border border-[var(--wl-line)] flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`relative flex-1 py-2.5 px-3 rounded-lg text-[13px] sm:text-sm font-semibold tracking-[-0.01em] transition-colors duration-200 z-10 flex items-center justify-center cursor-pointer select-none ${
                    mode === 'login'
                      ? 'text-[var(--wl-fg)]'
                      : 'text-[var(--wl-muted)] hover:text-[var(--wl-fg)]'
                  }`}
                >
                  {mode === 'login' && (
                    <motion.div
                      layoutId="activeAuthTab"
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                      className="absolute inset-0 rounded-lg bg-[var(--wl-surface)] border border-[var(--wl-line)] shadow-sm"
                    />
                  )}
                  <span className="relative z-10">Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('activate')}
                  className={`relative flex-1 py-2.5 px-3 rounded-lg text-[13px] sm:text-sm font-semibold tracking-[-0.01em] transition-colors duration-200 z-10 flex items-center justify-center cursor-pointer select-none ${
                    mode === 'activate'
                      ? 'text-[var(--wl-fg)]'
                      : 'text-[var(--wl-muted)] hover:text-[var(--wl-fg)]'
                  }`}
                >
                  {mode === 'activate' && (
                    <motion.div
                      layoutId="activeAuthTab"
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                      className="absolute inset-0 rounded-lg bg-[var(--wl-surface)] border border-[var(--wl-line)] shadow-sm"
                    />
                  )}
                  <span className="relative z-10">Activate Account</span>
                </button>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {mode === 'login' ? (
                  /* ─── LOGIN VIEW ─── */
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -14, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: 14, filter: 'blur(4px)' }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
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
                            className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2.5 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all pl-10"
                          />
                        </div>
                      </Field>

                      {/* Password Field */}
                      <Field
                        label="Password"
                        error={loginErrors.password}
                        rightLabel={
                          <span className="text-[11px] font-mono text-[var(--wl-muted)] hover:text-lime-400 cursor-pointer transition-colors">
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
                            className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2.5 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all pl-10 pr-10"
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
                        className="w-full h-11 bg-lime-400 hover:bg-lime-300 active:scale-[0.99] text-zinc-950 font-bold shadow-[0_0_20px_rgba(190,242,100,0.35)] text-xs rounded-xl transition-all shadow-lg shadow-lime-400/25 flex items-center justify-center gap-2 group tracking-wider uppercase font-mono mt-2"
                      >
                        {loginLoading ? (
                          <>
                            <span className="w-4 h-4 rounded-full border-2 border-zinc-950/30 border-t-zinc-950 animate-spin shrink-0" />
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

                    {/* Bottom Switch to Activate */}
                    <p className="mt-5 text-center text-xs text-[var(--wl-muted)]">
                      Received an invitation code?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('activate')}
                        className="font-medium text-lime-400 hover:text-lime-300 transition-colors"
                      >
                        Activate your account
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  /* ─── ACTIVATE ACCOUNT VIEW ─── */
                  <motion.div
                    key="activate"
                    initial={{ opacity: 0, x: 14, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -14, filter: 'blur(4px)' }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {actSubmitted ? (
                      <div className="py-10 flex flex-col items-center text-center space-y-3.5">
                        <div className="w-14 h-14 rounded-full bg-lime-400/15 border border-lime-400/30 text-lime-400 flex items-center justify-center shadow-lg shadow-lime-400/10">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--wl-fg)] font-heading">
                          Account Activated!
                        </h3>
                        <p className="text-xs text-[var(--wl-muted)] max-w-xs leading-relaxed">
                          {actSuccessMsg || 'Your profile has been authenticated and linked with your institute.'}
                        </p>
                        <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-lime-400">
                          <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                          <span>Routing to workspace…</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-5">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/25 text-[10px] font-mono uppercase tracking-widest text-lime-400 mb-2">
                            <Sparkles className="w-3 h-3" />
                            <span>Invite-Only Onboarding</span>
                          </div>
                          <h2 className="text-2xl font-bold text-[var(--wl-fg)] tracking-tight font-heading">
                            Activate Account
                          </h2>
                          <p className="text-xs text-[var(--wl-muted)] mt-1">
                            Enter the code provided by your institute administrator and set your secure password.
                          </p>
                        </div>

                        <form onSubmit={handleActivateSubmit} noValidate className="space-y-3.5">
                          {/* Invite Code */}
                          <Field
                            label="Invite / Activation Code"
                            error={actErrors.inviteCode}
                            rightLabel={
                              <span className="text-[10px] font-mono text-[var(--wl-faint)]">
                                6-Digit / Token
                              </span>
                            }
                          >
                            <div className="relative">
                              <KeyRound className="w-4 h-4 text-[var(--wl-faint)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                name="inviteCode"
                                type="text"
                                value={actForm.inviteCode}
                                onChange={handleActChange}
                                placeholder="e.g. 7X92KL or INVITE-CODE"
                                className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest uppercase text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all pl-10"
                              />
                            </div>
                          </Field>

                          {/* Email Address */}
                          <Field
                            label="Registered Email"
                            error={actErrors.email}
                            rightLabel={
                              initialEmail ? (
                                <span className="text-[10px] font-mono text-lime-400">
                                  Pre-filled
                                </span>
                              ) : null
                            }
                          >
                            <div className="relative">
                              <Mail className="w-4 h-4 text-[var(--wl-faint)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={actForm.email}
                                onChange={handleActChange}
                                placeholder="student@institute.com"
                                className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2.5 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all pl-10"
                              />
                            </div>
                          </Field>

                          {/* Create Password */}
                          <Field label="Create Password" error={actErrors.password}>
                            <div className="relative">
                              <Lock className="w-4 h-4 text-[var(--wl-faint)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={actForm.password}
                                onChange={handleActChange}
                                placeholder="Min 6 characters"
                                className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2.5 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all pl-10 pr-10"
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

                          {/* Confirm Password */}
                          <Field
                            label="Confirm Password"
                            error={actErrors.confirmPassword}
                            rightLabel={
                              isPasswordMatch ? (
                                <span className="text-[10px] font-mono text-lime-400 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Match
                                </span>
                              ) : isPasswordMismatch ? (
                                <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                                  Mismatch
                                </span>
                              ) : null
                            }
                          >
                            <div className="relative">
                              <ShieldCheck className="w-4 h-4 text-[var(--wl-faint)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={actForm.confirmPassword}
                                onChange={handleActChange}
                                placeholder="Re-enter password"
                                className="w-full bg-[var(--wl-surface-2)] border border-[var(--wl-line)] rounded-xl px-4 py-2.5 text-sm text-[var(--wl-fg)] placeholder:text-[var(--wl-faint)] focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all pl-10 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--wl-faint)] hover:text-[var(--wl-fg)] transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </Field>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={actLoading}
                            className="w-full h-11 bg-lime-400 hover:bg-lime-300 active:scale-[0.99] text-zinc-950 font-bold shadow-[0_0_20px_rgba(190,242,100,0.35)] text-xs rounded-xl transition-all shadow-lg shadow-lime-400/25 flex items-center justify-center gap-2 group tracking-wider uppercase font-mono mt-3"
                          >
                            {actLoading ? (
                              <>
                                <span className="w-4 h-4 rounded-full border-2 border-zinc-950/30 border-t-zinc-950 animate-spin shrink-0" />
                                <span>Activating Account…</span>
                              </>
                            ) : (
                              <>
                                <span>Activate & Enter Workspace</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </button>
                        </form>

                        {/* Bottom Switch back to Login */}
                        <p className="mt-4 text-center text-xs text-[var(--wl-muted)]">
                          Already activated your account?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className="font-medium text-lime-400 hover:text-lime-300 transition-colors"
                          >
                            Sign in here
                          </button>
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
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
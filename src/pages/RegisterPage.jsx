import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Eye, EyeOff, Sun, Moon, ArrowRight, GraduationCap, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Field = ({ label, error, children }) => (
  <div>
    {label && (
      <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
    )}
    {children}
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1.5 text-[11px] font-medium text-red-400"
      >
        {error}
      </motion.p>
    )}
  </div>
)

const RegisterPage = () => {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    role: 'student', instituteCode: '', subject: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Min 6 characters'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\+?[\d\s\-]{10,15}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number'
    if (!form.instituteCode.trim()) e.instituteCode = 'Institute code is required'
    if (form.role === 'teacher' && !form.subject.trim()) e.subject = 'Subject is required'
    return e
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleRoleSelect = (role) => {
    setForm(prev => ({ ...prev, role, subject: role === 'student' ? '' : prev.subject }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const { data: institute, error: instError } = await supabase
        .rpc('get_institute_by_code', { code: form.instituteCode.toUpperCase() })
        .single()
      if (instError || !institute) {
        setErrors({ instituteCode: 'Invalid institute code.' })
        setLoading(false)
        return
      }
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            role: form.role,
            first_name: form.fullName,
            institute_id: institute.id,
            phone: form.phone.trim(),
            ...(form.role === 'teacher' && { subject: form.subject.trim() }),
          },
        },
      })
      if (authError) { setErrors({ email: authError.message }); setLoading(false); return }
      setSubmitted(true)
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch {
      setErrors({ email: 'An unexpected error occurred' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex w-[44%] xl:w-[40%] flex-col justify-between p-14 border-r border-[var(--border-subtle)] relative overflow-hidden flex-shrink-0">
        {/* grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(var(--border-strong) 1px, transparent 1px),
                              linear-gradient(90deg, var(--border-strong) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <Link to="/" className="flex items-center gap-3 group w-fit">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: 'var(--text-primary)' }}
          >
            <img
              src={isDark ? '/intellix-icon-black.svg' : '/intellix-icon-white.svg'}
              alt="IntelliX"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>IntelliX</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-6" style={{ color: 'var(--text-muted)' }}>
            Join the platform
          </p>
          <h1
            className="text-5xl xl:text-6xl font-black leading-[1.0] tracking-tighter mb-8"
            style={{ color: 'var(--text-primary)' }}
          >
            Start<br />
            your<br />
            <span style={{ color: 'var(--text-secondary)' }}>journey</span><br />
            today.
          </h1>
          <div className="w-8 h-px" style={{ background: 'var(--border-accent)' }} />
        </motion.div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>v2.8.5</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>© 2026 IntelliX</span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col">
        {/* top bar */}
        <div className="flex items-center justify-between px-8 py-5">
          <Link to="/" className="lg:hidden flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0" style={{ background: 'var(--text-primary)' }}>
              <img src={isDark ? '/intellix-icon-black.svg' : '/intellix-icon-white.svg'} alt="IntelliX" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>IntelliX</span>
          </Link>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
            </button>
            <Link
              to="/login"
              className="text-xs font-semibold transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Sign in →
            </Link>
          </div>
        </div>

        {/* scrollable form */}
        <div className="flex-1 flex items-start justify-center px-8 pb-12 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full max-w-[420px] pt-4"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                /* ── Success state ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 flex flex-col items-center text-center"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-2xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                  >
                    ✓
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                    Account created
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Redirecting you to sign in…
                  </p>
                  <div className="mt-6 w-6 h-0.5 rounded-full animate-pulse" style={{ background: 'var(--border-accent)' }} />
                </motion.div>
              ) : (
                <motion.div key="form">
                  {/* heading */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      Create account
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Join your institute on IntelliX.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-4">

                    {/* Role switcher */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                        I am a
                      </p>
                      <div
                        className="flex gap-2 p-1 rounded-xl"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                      >
                        {[
                          { value: 'student', label: 'Student', icon: GraduationCap },
                          { value: 'teacher', label: 'Teacher', icon: Briefcase },
                        ].map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleRoleSelect(value)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all"
                            style={
                              form.role === value
                                ? { background: 'var(--text-primary)', color: 'var(--bg-app)' }
                                : { color: 'var(--text-secondary)' }
                            }
                          >
                            <Icon size={13} strokeWidth={2} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Institute code */}
                    <Field label="Institute Code" error={errors.instituteCode}>
                      <input
                        name="instituteCode"
                        type="text"
                        value={form.instituteCode}
                        onChange={handleChange}
                        placeholder="e.g. A9B2X"
                        className="input-base uppercase tracking-widest font-bold"
                        style={errors.instituteCode ? { borderColor: 'rgb(239 68 68 / 0.7)' } : {}}
                      />
                    </Field>

                    {/* Teacher subject (conditional) */}
                    <AnimatePresence>
                      {form.role === 'teacher' && (
                        <motion.div
                          key="subject"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <Field label="Subject you teach" error={errors.subject}>
                            <input
                              name="subject"
                              type="text"
                              value={form.subject}
                              onChange={handleChange}
                              placeholder="e.g. Mathematics"
                              className="input-base"
                              style={errors.subject ? { borderColor: 'rgb(239 68 68 / 0.7)' } : {}}
                            />
                          </Field>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Full name */}
                    <Field label="Full Name" error={errors.fullName}>
                      <input
                        name="fullName"
                        type="text"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="input-base"
                        style={errors.fullName ? { borderColor: 'rgb(239 68 68 / 0.7)' } : {}}
                      />
                    </Field>

                    {/* Phone */}
                    <Field label="Phone Number" error={errors.phone}>
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 99999 00000"
                        className="input-base"
                        style={errors.phone ? { borderColor: 'rgb(239 68 68 / 0.7)' } : {}}
                      />
                    </Field>

                    {/* Email */}
                    <Field label="Email" error={errors.email}>
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@institute.com"
                        className="input-base"
                        style={errors.email ? { borderColor: 'rgb(239 68 68 / 0.7)' } : {}}
                      />
                    </Field>

                    {/* Password */}
                    <Field label="Password" error={errors.password}>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Min 6 characters"
                          className="input-base pr-10"
                          style={errors.password ? { borderColor: 'rgb(239 68 68 / 0.7)' } : {}}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {showPassword
                            ? <EyeOff size={15} strokeWidth={1.8} />
                            : <Eye size={15} strokeWidth={1.8} />
                          }
                        </button>
                      </div>
                    </Field>

                    {/* Submit */}
                    <div className="pt-2">
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary w-full"
                        style={{ height: 44 }}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border-2 animate-spin flex-shrink-0"
                              style={{ borderColor: 'var(--bg-app)', borderTopColor: 'transparent' }}
                            />
                            Creating account…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Create account <ArrowRight size={14} strokeWidth={2} />
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </form>

                  <p className="mt-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-semibold transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

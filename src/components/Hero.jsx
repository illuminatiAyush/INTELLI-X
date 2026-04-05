import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'

const Hero = () => {
  const { isDark } = useTheme()
  const canvasRef = useRef(null)

  // Subtle radial canvas glow
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isDark) return
    const ctx = canvas.getContext('2d')
    let raf

    const draw = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const cy = canvas.height * 0.42

      // Deep center glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.6)
      glow.addColorStop(0, 'rgba(120, 80, 200, 0.13)')
      glow.addColorStop(0.5, 'rgba(60, 40, 130, 0.06)')
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => { ro.disconnect(); cancelAnimationFrame(raf) }
  }, [isDark])

  const bgClass = isDark
    ? 'bg-[#08080c]'
    : 'bg-gradient-to-b from-slate-50 to-white'

  const eyebrowColor = isDark ? 'text-gray-500' : 'text-gray-400'
  const headlineColor = isDark ? 'text-white' : 'text-gray-950'
  const quoteColor = isDark ? 'text-gray-400' : 'text-gray-500'

  return (
    <section
      id="hero"
      className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${bgClass}`}
    >
      {/* Canvas radial glow */}
      {isDark && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        />
      )}

      {/* Light mode soft blob */}
      {!isDark && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(139,92,246,0.07) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />
      )}

      <div className="relative w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center" style={{ zIndex: 1 }}>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`text-xs font-semibold tracking-[0.25em] uppercase mb-10 ${eyebrowColor}`}
        >
          For Modern Educational Systems
        </motion.p>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className={`font-serif leading-[1.08] tracking-tight mb-8 ${headlineColor}`}
          style={{
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
          }}
        >
          Architecting the
          <br />
          <span
            style={{
              fontStyle: 'italic',
              fontWeight: 400,
              color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(15,10,30,0.6)',
            }}
          >
            future
          </span>{' '}
          of learning.
        </motion.h1>

        {/* Quote subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className={`text-base sm:text-lg leading-relaxed max-w-xl mb-14 ${quoteColor}`}
          style={{ fontStyle: 'italic' }}
        >
          "Transforming institutes through clarity. The best systems are not managed—they are
          engineered."
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <Link
            to="/register"
            id="hero-cta-btn"
          >
            <motion.span
              whileHover={{ scale: 1.04, backgroundColor: isDark ? '#1a1a2e' : '#111' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 cursor-pointer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 36px',
                borderRadius: '9999px',
                backgroundColor: isDark ? '#111118' : '#0f0a1e',
                color: '#fff',
                fontSize: '0.925rem',
                fontWeight: 500,
                letterSpacing: '0.01em',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.12)',
                boxShadow: isDark
                  ? '0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.6)'
                  : '0 4px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
              }}
            >
              Begin the transformation
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ zIndex: 1 }}
      >
        <div
          className={`w-5 h-8 rounded-full border flex items-start justify-center pt-1.5 ${
            isDark ? 'border-white/15' : 'border-gray-300'
          }`}
        >
          <motion.div
            className="w-1 h-2 rounded-full"
            style={{ background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}

export default Hero

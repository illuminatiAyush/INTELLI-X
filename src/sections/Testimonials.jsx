import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const TESTIMONIALS = [
  {
    quote: "Managing batches used to be chaotic.\nNow everything runs in one place.",
    name: "Riya Shah",
    role: "Physics Faculty"
  },
  {
    quote: "We spent hours coordinating schedules.\nIntelliX completely automated it.",
    name: "Amit Desai",
    role: "Center Director"
  },
  {
    quote: "Instead of juggling fragmented tools,\nwe finally have a single continuous system.",
    name: "Sneha Kapoor",
    role: "Head of Academics"
  }
]

const Testimonials = () => {
  const { isDark } = useTheme()
  const [index, setIndex] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  // Rotate testimonials every 4 seconds
  useEffect(() => {
    if (shouldReduceMotion) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [shouldReduceMotion])

  const current = TESTIMONIALS[index]

  // Formatter to render \n nicely on larger screens
  const formatQuote = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i !== text.split('\n').length - 1 && <br className="hidden md:block" />}
      </span>
    ))
  }

  return (
    <section id="testimonials" className={`py-24 md:py-32 lg:p-48 relative overflow-hidden flex flex-col items-center justify-center min-h-[60vh] md:min-h-[80vh] ${isDark ? 'bg-[#000000]' : 'bg-[#fafafa]'}`}>
      {/* Background Architectural Grid Texture */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px), 
                            linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Background Radial Spotlight */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: isDark 
            ? 'radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 100%)'
            : 'radial-gradient(circle at center, rgba(0,0,0,0.03) 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        
        {/* Minimal Section Label */}
        <p className={`text-[12px] font-bold tracking-[0.3em] uppercase mb-[48px] opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
          What Educators Are Saying
        </p>

        {/* Premium Floating Glass Panel */}
        <motion.div 
          initial={{ scale: 1, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          whileHover={!shouldReduceMotion ? { 
            scale: 1.005, 
            backdropFilter: 'blur(32px)', 
            WebkitBackdropFilter: 'blur(32px)',
            transition: { duration: 0.4, ease: "easeOut" }
          } : {}}
          className={`relative w-full flex flex-col items-center rounded-[32px] border p-8 sm:p-12 md:p-16 ${
            isDark 
              ? 'bg-black/40 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.4)]' 
              : 'bg-black/[0.01] border-black/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.05)]'
          }`}
        >
          {/* Fixed Height Variable Container to trap crossfades */}
          <div className="relative w-full flex flex-col items-center justify-center min-h-[240px] md:min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute flex flex-col items-center w-full top-0 md:top-auto"
              >
                {/* Main Testimonial Quote */}
                <h3 
                  className={`text-2xl md:text-4xl lg:text-5xl font-serif max-w-[820px] leading-[1.2] tracking-tight ${
                    isDark ? 'text-white' : 'text-gray-950'
                  }`}
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {formatQuote(current.quote)}
                </h3>

                {/* Author Block */}
                <div className="mt-8 md:mt-10 flex flex-col items-center">
                  <p className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    — {current.name}
                  </p>
                  <p className={`text-sm mt-2 font-medium tracking-wide ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                    {current.role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Institutional Scale Trust Line */}
        <p className={`text-[12px] font-medium mt-[56px] tracking-wider opacity-30 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Trusted by premium coaching institutes across Mumbai
        </p>

      </div>
    </section>
  )
}

export default Testimonials

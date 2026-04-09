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
    <section id="testimonials" className={`py-24 md:py-32 lg:py-40 relative overflow-hidden ${isDark ? 'bg-black' : 'bg-[#fafafa]'}`}>
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

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Minimal Section Label */}
        <p className={`text-[12px] font-bold tracking-[0.2em] uppercase mb-[40px] opacity-55 ${isDark ? 'text-white' : 'text-black'}`}>
          What Educators Are Saying
        </p>

        {/* Premium Floating Glass Panel */}
        <motion.div 
          initial={{ scale: 1, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          whileHover={!shouldReduceMotion ? { 
            scale: 1.01, 
            backdropFilter: 'blur(24px)', 
            WebkitBackdropFilter: 'blur(24px)',
            transition: { duration: 0.4, ease: "easeOut" }
          } : {}}
          className={`relative w-full max-w-[800px] flex flex-col items-center rounded-[28px] border p-[24px] sm:p-[32px] md:p-[48px] ${
            isDark 
              ? 'bg-black/40 border-[rgba(255,255,255,0.08)]' 
              : 'bg-black/[0.02] border-black/[0.04]'
          }`}
          style={{
            boxShadow: '0px 40px 80px rgba(0,0,0,0.25)'
          }}
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
                  className={`text-2xl md:text-[36px] font-serif max-w-[720px] leading-[1.25] tracking-tight ${
                    isDark ? 'text-white' : 'text-gray-950'
                  }`}
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {formatQuote(current.quote)}
                </h3>

                {/* Author Block */}
                <div className="mt-[32px] flex flex-col items-center">
                  <p className={`text-[16px] font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    — {current.name}
                  </p>
                  <p className={`text-[14px] mt-1 opacity-65 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {current.role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Institutional Scale Trust Line */}
        <p className={`text-[13px] mt-[40px] opacity-50 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Trusted by growing coaching institutes across Mumbai
        </p>

      </div>
    </section>
  )
}

export default Testimonials

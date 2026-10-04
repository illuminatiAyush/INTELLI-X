import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const PHOTO_STACK = [
  "/assets/classroom/classroom_teacher_whiteboard.png",
  "/assets/classroom/students_collaborating_lab.png",
  "/assets/classroom/whiteboard_discussion_moment.png",
  "/assets/classroom/students_laptops_collaboration.png",
  "/assets/classroom/teacher_individual_guidance.png"
]

const PhotoStack = () => {
  const { isDark } = useTheme()
  const [index, setIndex] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % PHOTO_STACK.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [shouldReduceMotion])

  // Get current 5 images in order of stack
  const getVisibleSlides = () => {
    const slides = []
    for (let i = 0; i < 5; i++) {
      slides.push(PHOTO_STACK[(index + i) % PHOTO_STACK.length])
    }
    return slides.reverse() // Reverse so top is last in DOM
  }

  const stackOffsets = [
    { x: -16, y: -8, rotate: -3 },
    { x: 14, y: 12, rotate: 4 },
    { x: 0, y: 0, rotate: 0 },
    { x: -12, y: 16, rotate: -2 },
    { x: 18, y: -4, rotate: 3 },
  ]

  return (
    <div className="relative w-full max-w-[420px] aspect-[4/3] md:aspect-square flex items-center justify-center">
      {/* Subtle Floating Motion Container */}
      <motion.div
        animate={!shouldReduceMotion ? { y: [0, -6, 0] } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-full h-full"
      >
        <AnimatePresence mode="popLayout">
          {getVisibleSlides().map((src, i) => {
            const stackPos = 4 - i // 0 is top, 4 is bottom
            return (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ 
                  opacity: 0.92, 
                  y: stackOffsets[stackPos].y, 
                  x: stackOffsets[stackPos].x,
                  rotate: stackOffsets[stackPos].rotate,
                  scale: 1,
                  zIndex: i
                }}
                exit={{ 
                  opacity: 0, 
                  y: 12, 
                  scale: 0.96,
                  zIndex: 10
                }}
                transition={{ duration: 0.48, ease: 'easeOut' }}
                whileHover={stackPos === 0 ? { scale: 1.02, y: stackOffsets[stackPos].y - 4, zIndex: 20 } : {}}
                className="absolute inset-0 cursor-pointer"
              >
                <div 
                  className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl relative border ${
                    isDark ? 'border-white/10' : 'border-black/5'
                  }`}
                  style={{
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  }}
                >
                  <img 
                    src={src} 
                    alt="Classroom reality" 
                    className="w-full h-full object-cover grayscale-[15%] contrast-[1.1]"
                  />
                  {/* Glass Highlight Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 80%)',
                      filter: 'blur(60px)'
                    }}
                  />
                  {/* Soft Dark Overlay */}
                  <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

const ValueClarity = () => {
  const { isDark } = useTheme()
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Parallax for the visual stack
  const stackParallax = useTransform(scrollYProgress, [0, 1], [0, 2])

  const fadeIn = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.19, 1, 0.22, 1]
      }
    }
  }

  return (
    <section
      ref={ref}
      id="value-clarity"
      className={`relative py-24 md:py-32 lg:py-[160px] overflow-hidden ${isDark ? 'bg-[#000000]' : 'bg-white'}`}
    >
      {/* Background Architectural Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px), 
                            linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          zIndex: 0
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Side: Literal Headline */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="flex flex-col gap-10"
          >
            <p
              className={`font-serif leading-[1.1] tracking-tight ${isDark ? 'text-white' : 'text-[#09090b]'}`}
              style={{ 
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 500
              }}
            >
              Learning needs more than tools.
              <br />
              It needs structure that adapts.
            </p>
            
            <p className={`text-lg md:text-xl leading-[1.6] max-w-[540px] ${isDark ? 'text-[#A1A1AA]' : 'text-[#71717a]'}`}>
              Structure allows learning environments to coordinate, evolve, and remain continuous across contexts. 
              IntelliX operates inside real classrooms — orchestrating flow where it matters most.
            </p>
          </motion.div>

          {/* Right Side: Photo Stack Slideshow */}
          <motion.div
            style={{ y: !shouldReduceMotion ? stackParallax : 0 }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <PhotoStack />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ValueClarity

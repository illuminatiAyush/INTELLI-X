import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useTransform, useScroll, useReducedMotion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const StatItem = ({ number, suffix, description, isStatic }) => {
  const { isDark } = useTheme()
  const ref = useRef(null)
  // Disable countup visibility trigger if reduced motion is enabled to simply show it fully
  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (isInView && !isStatic && !shouldReduceMotion) {
      const end = parseInt(number.replace(/,/g, ''))
      const duration = 900
      const startTime = performance.now()
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Ease out cubic
        const easedProgress = 1 - Math.pow(1 - progress, 3) 
        
        const currentCount = Math.floor(easedProgress * end)
        setCount(currentCount)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setCount(end)
        }
      }
      
      requestAnimationFrame(animate)
    } else if (isInView && (isStatic || shouldReduceMotion)) {
      if (!isStatic) setCount(parseInt(number.replace(/,/g, '')))
    }
  }, [isInView, number, isStatic, shouldReduceMotion])

  const formatNumber = (num) => {
    if (num >= 1000) return num.toLocaleString()
    return num
  }

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -4, transition: { duration: 0.160 } }}
      className="flex flex-col items-center justify-center py-6 px-4 text-center group cursor-default relative w-full"
    >
      {/* Center Glow Effect for '24' */}
      {number === '24' && (
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)',
            filter: 'blur(80px)'
          }}
        />
      )}

      <div className="relative z-10">
        <h3 
          className={`font-semibold tracking-tight transition-opacity duration-150 group-hover:opacity-100 ${
            isDark ? 'text-white' : 'text-gray-900'
          } text-[28px] md:text-[36px] lg:text-[56px] opacity-[0.85]`}
        >
          {isStatic ? (
            number
          ) : (
            <>
              {formatNumber(count)}
              {suffix}
            </>
          )}
        </h3>
      </div>
      <p 
        className={`text-[15px] leading-relaxed transition-opacity duration-150 group-hover:opacity-100 mt-[6px] opacity-70 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        {description}
      </p>
    </motion.div>
  )
}

const Statistics = () => {
  const { isDark } = useTheme()
  const sectionRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  
  // Grid parallax limited to small 2px max difference
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-2, 2])
  
  const rowRef = useRef(null)
  const isRowInView = useInView(rowRef, { once: true, margin: "-50px" })

  const stats = [
    { number: '10,000', suffix: '+', description: 'Coordinating learning moments' },
    { number: '120', suffix: '+', description: 'Supporting educator workflows' },
    { number: '24', suffix: '', description: 'Structuring pilot environments' },
    { number: '3', suffix: '×', description: 'Faster coordination across every batch' },
  ]

  // Vertical Separator animation (only on Desktop lg screens)
  const dividerVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: 60, 
      opacity: 0.12, 
      transition: { duration: 0.420, ease: "easeOut", delay: 0.520 } // wait for row fade-in (520ms)
    }
  }

  return (
    <section 
      ref={sectionRef}
      id="statistics-strip" 
      className={`py-20 md:py-32 lg:py-40 relative overflow-hidden ${isDark ? 'bg-[#000000]' : 'bg-gray-50'}`}
    >
      {/* Grid Parallax Depth */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{
          y: shouldReduceMotion ? 0 : parallaxY,
          backgroundImage: `linear-gradient(to right, ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px), 
                            linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          zIndex: 0
        }}
      />

      <div className="relative max-w-[1100px] mx-auto px-6 z-10 flex flex-col items-center">
        
        {/* System Coordination Signals Label */}
        <p className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-[24px] opacity-55 text-center ${isDark ? 'text-white' : 'text-gray-900'} w-full`}>
          System Coordination Signals
        </p>

        {/* Stats Row */}
        <motion.div
          ref={rowRef}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={isRowInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.520, ease: "easeOut" }}
          className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0 mt-2 relative"
        >
          {stats.map((stat, i) => (
            <div key={i} className="relative flex items-center justify-center">
              <StatItem {...stat} />
              
              {/* Vertical Dividers for Desktop */}
              {!shouldReduceMotion && i < stats.length - 1 && (
                <motion.div
                  variants={dividerVariants}
                  initial="hidden"
                  animate={isRowInView ? "visible" : "hidden"}
                  className={`hidden lg:block absolute right-0 w-px ${isDark ? 'bg-white' : 'bg-black'}`}
                />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Statistics

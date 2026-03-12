import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const stats = [
  { value: 70, suffix: '%', label: 'Less Manual Work', desc: 'Save hours every day', icon: '⚡', color: 'from-purple-500 to-violet-600' },
  { value: 3, suffix: 'X', label: 'Faster Operations', desc: 'Do more in less time', icon: '🚀', color: 'from-blue-500 to-cyan-500' },
  { value: 100, suffix: '%', label: 'Digital Management', desc: 'Zero paper required', icon: '📊', color: 'from-green-500 to-emerald-500' },
  { value: 2400, suffix: '+', label: 'Institutes Trust IntelliX', desc: 'And growing fast', icon: '🏫', color: 'from-orange-500 to-amber-500' },
]

const AnimatedCounter = ({ value, suffix, inView }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = value / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

const Statistics = () => {
  const { isDark } = useTheme()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="statistics" className={`section-padding relative overflow-hidden ${isDark ? 'bg-[#0B0B0F]' : 'bg-white'}`}>
      {/* Background gradient blobs */}
      {isDark && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="container-fluid relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">By the Numbers</p>
          <h2 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Results That{' '}
            <span className="text-gradient">Speak for Themselves</span>
          </h2>
        </motion.div>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ value, suffix, label, desc, icon, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`glass-card p-8 text-center group hover:border-purple-500/30 transition-all cursor-default ${
                isDark ? '' : 'bg-white shadow-sm hover:shadow-xl'
              }`}
            >
              <div className="text-4xl mb-4">{icon}</div>

              <div className={`text-5xl md:text-6xl font-black mb-2 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                <AnimatedCounter value={value} suffix={suffix} inView={inView} />
              </div>

              <p className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {label}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{desc}</p>

              {/* Bottom glow line */}
              <div className={`mt-6 h-0.5 rounded-full bg-gradient-to-r ${color} opacity-0 group-hover:opacity-60 transition-opacity`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Statistics

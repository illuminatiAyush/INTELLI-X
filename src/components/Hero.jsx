import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import ParticleBackground from '../animations/ParticleBackground'
import { Play, ArrowRight, TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react'

const FloatingCard = ({ children, className, delay = 0, animClass = 'animate-float-1' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.8, delay }}
    className={`glass-card p-4 ${animClass} ${className}`}
  >
    {children}
  </motion.div>
)

const MiniChart = ({ values, color }) => {
  const max = Math.max(...values)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm opacity-80"
          style={{
            height: `${(v / max) * 100}%`,
            background: `linear-gradient(180deg, ${color}, ${color}88)`,
            minWidth: 3
          }}
        />
      ))}
    </div>
  )
}

const Hero = () => {
  const { isDark } = useTheme()

  return (
    <section className={`relative min-h-screen flex items-center overflow-hidden ${isDark ? 'bg-[#0B0B0F]' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
      {/* Particle Background */}
      {isDark && <ParticleBackground />}

      {/* Gradient blobs */}
      {isDark && (
        <>
          <div className="hero-blob-1 top-[-100px] left-[-100px]" style={{ zIndex: 1 }} />
          <div className="hero-blob-2 bottom-[-100px] right-[-100px]" style={{ zIndex: 1 }} />
          <div className="hero-blob-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 1 }} />
        </>
      )}

      <div className="container-fluid relative w-full" style={{ zIndex: 2 }}>
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen py-32">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                AI-Powered Institute OS — Now Live
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Run Your Entire{' '}
              <span className="text-gradient">Coaching Institute</span>{' '}
              Like an AI-Powered{' '}
              <span className={`relative inline-block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Operating System.
                <motion.div
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 1 }}
                />
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              IntelliX transforms traditional coaching institutes into{' '}
              <strong className={isDark ? 'text-gray-200' : 'text-gray-800'}>intelligent digital ecosystems</strong>{' '}
              powered by automation, analytics, and AI.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.a
                id="hero-trial-btn"
                href="#cta"
                whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(191,95,255,0.5)' }}
                whileTap={{ scale: 0.96 }}
                className="glow-button text-white font-bold px-8 py-4 rounded-2xl text-base flex items-center justify-center gap-2"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </motion.a>
              <motion.button
                id="hero-demo-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center justify-center gap-3 font-semibold px-8 py-4 rounded-2xl text-base border transition-all ${
                  isDark
                    ? 'border-white/10 text-white hover:bg-white/5'
                    : 'border-gray-200 text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Play className="w-3 h-3 text-white ml-0.5" />
                </div>
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['bg-purple-500', 'bg-blue-500', 'bg-cyan-500', 'bg-pink-500'].map((c, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-[#0B0B0F] flex items-center justify-center text-xs font-bold text-white`}>
                      {['R','S','P','M'][i]}
                    </div>
                  ))}
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong className={isDark ? 'text-white' : 'text-gray-900'}>2,400+</strong> institutes trust IntelliX
                </span>
              </div>
              <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {'⭐⭐⭐⭐⭐'}
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </motion.div>
          </div>

          {/* Right: floating dashboard cards */}
          <div className="relative hidden lg:flex lg:items-center lg:justify-center h-[600px]">
            {/* Main dashboard card */}
            <FloatingCard
              className="absolute w-80 top-8 left-4 z-20"
              delay={0.5}
              animClass="animate-float-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-xs font-medium mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Live Dashboard</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>IntelliX OS</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img src="/intellix-icon.svg" alt="IntelliX Logo" className="w-8 h-8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Students', value: '1,248', icon: Users, change: '+12%', color: 'text-green-400' },
                  { label: 'Revenue', value: '₹4.8L', icon: DollarSign, change: '+8%', color: 'text-green-400' },
                  { label: 'Attendance', value: '94.2%', icon: BookOpen, change: '-1%', color: 'text-red-400' },
                  { label: 'Avg Score', value: '87.3', icon: TrendingUp, change: '+5%', color: 'text-green-400' },
                ].map(({ label, value, icon: Icon, change, color }, i) => (
                  <div key={i} className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
                      <Icon className="w-3 h-3 text-purple-400" />
                    </div>
                    <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                    <p className={`text-xs ${color}`}>{change} this week</p>
                  </div>
                ))}
              </div>
            </FloatingCard>

            {/* Revenue chart card */}
            <FloatingCard
              className="absolute w-64 bottom-12 right-0 z-20"
              delay={0.7}
              animClass="animate-float-2"
            >
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Monthly Revenue</p>
                <span className="text-green-400 text-xs font-bold">+24%</span>
              </div>
              <p className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>₹14.2L</p>
              <MiniChart values={[45, 62, 48, 71, 58, 85, 92, 78, 96, 88, 100, 94]} color="#BF5FFF" />
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Last 12 months</p>
            </FloatingCard>

            {/* Attendance card */}
            <FloatingCard
              className="absolute w-52 top-32 right-4 z-20"
              delay={0.9}
              animClass="animate-float-3"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Today's Attendance</p>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>286 / 304 Present</p>
                </div>
              </div>
              <div className={`w-full h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: '94%' }} />
              </div>
              <p className="text-xs text-cyan-400 mt-1.5 font-medium">94% attendance rate</p>
            </FloatingCard>

            {/* AI insight card */}
            <FloatingCard
              className="absolute bottom-24 left-0 w-60 z-20"
              delay={1.1}
              animClass="animate-float-1"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">🤖</span>
                </div>
                <div>
                  <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>AI Insight</p>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    3 students at risk of dropping out. Recommend intervention call today.
                  </p>
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ zIndex: 2 }}
      >
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Scroll to explore</span>
        <div className={`w-5 h-8 rounded-full border flex items-start justify-center pt-1.5 ${isDark ? 'border-white/20' : 'border-gray-300'}`}>
          <motion.div
            className="w-1 h-2 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}

export default Hero

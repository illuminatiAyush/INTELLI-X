import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { ArrowRight, Calendar } from 'lucide-react'

const CTA = () => {
  const { isDark } = useTheme()

  return (
    <section
      id="cta"
      className={`section-padding relative overflow-hidden ${isDark ? 'bg-[#0B0B0F]' : 'bg-white'}`}
    >
      {/* Animated gradient background */}
      {isDark && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(191,95,255,0.12) 0%, rgba(0,102,255,0.08) 50%, transparent 80%)',
              animation: 'gradient 6s ease infinite',
              backgroundSize: '200% 200%',
            }}
          />
        </>
      )}

      <div className="container-fluid relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`text-center max-w-4xl mx-auto rounded-3xl p-12 md:p-20 border ${
            isDark
              ? 'bg-gradient-to-b from-purple-500/8 to-blue-500/5 border-purple-500/20'
              : 'bg-gradient-to-b from-purple-50 to-blue-50 border-purple-200 shadow-xl'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full mb-8"
          >
            <span className="text-purple-400 text-sm font-semibold">🚀 Start Your Free 30-Day Trial Today</span>
          </motion.div>

          <h2 className={`text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Upgrade Your Coaching Institute{' '}
            <span className="text-gradient">to IntelliX OS.</span>
          </h2>

          <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Join 2,400+ coaching institutes that have already made the switch. 
            Setup in 24 hours. ROI in 30 days. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              id="cta-trial-btn"
              href="#"
              whileHover={{ scale: 1.05, boxShadow: '0 0 80px rgba(191,95,255,0.5)' }}
              whileTap={{ scale: 0.96 }}
              className="glow-button text-white font-bold px-10 py-5 rounded-2xl text-lg flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              id="cta-demo-btn"
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className={`font-bold px-10 py-5 rounded-2xl text-lg flex items-center justify-center gap-2 border transition-all ${
                isDark
                  ? 'border-white/10 text-white hover:bg-white/5'
                  : 'border-gray-200 text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-5 h-5" /> Book Live Demo
            </motion.a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            {[
              '✅ 30-day free trial',
              '✅ No credit card',
              '✅ Setup in 24 hours',
              '✅ Cancel anytime',
            ].map((item) => (
              <span key={item} className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA

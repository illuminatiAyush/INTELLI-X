import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const ScrollStory = () => {
  const { isDark } = useTheme()

  const ref1 = useRef(null)
  const ref2 = useRef(null)
  const ref3 = useRef(null)

  const inView1 = useInView(ref1, { once: true, margin: '-100px' })
  const inView2 = useInView(ref2, { once: true, margin: '-100px' })
  const inView3 = useInView(ref3, { once: true, margin: '-100px' })

  const bgClass = isDark ? 'bg-[#000000]' : 'bg-gray-50'
  const cardBg = isDark ? 'bg-white/3 border-white/8' : 'bg-white border-gray-200'
  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600'

  return (
    <section className={`${bgClass} py-32 overflow-hidden`} id="story">
      <div className="container-fluid">
        {/* Section header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-white/40 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">The Transformation</p>
          <h2 className={`text-4xl md:text-5xl font-black ${textPrimary}`}>
            The Problem.{' '}
            <span className="text-gradient">The Solution.</span>
          </h2>
        </motion.div>

        <div className="space-y-32">
          {/* Section 1: The Problem */}
          <div ref={ref1} className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={inView1 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full mb-6">
                <span className="text-red-400 text-sm font-semibold">😩 Before IntelliX</span>
              </div>
              <h3 className={`text-3xl md:text-4xl font-black mb-4 ${textPrimary}`}>
                Death by Spreadsheets
              </h3>
              <p className={`text-lg ${textSecondary} mb-8 leading-relaxed`}>
                Traditional institutes drown in manual work — attendance registers, fee ledgers, handwritten reports, 
                missed follow-ups, and zero visibility into student performance.
              </p>
              <div className="space-y-3">
                {[
                  '📋 Manual attendance registers & paper roll-calls',
                  '💸 Fee tracking in Excel with constant errors',
                  '📞 No automated communication with parents',
                  '🎯 No AI insights into student performance',
                  '⏰ 4+ hours/day wasted on admin tasks',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView1 ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? 'bg-red-500/5 border border-red-500/10' : 'bg-red-50 border border-red-100'}`}
                  >
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={inView1 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Messy spreadsheet mockup */}
              <div className={`rounded-2xl border p-6 font-mono text-xs overflow-hidden relative ${isDark ? 'bg-gray-900/50 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className={`ml-2 text-xs ${textSecondary}`}>attendance_register_final_FINAL_v3.xlsx</span>
                </div>
                <div className={`grid grid-cols-5 gap-px text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {['Name','Mon','Tue','Wed','Fees'].map((h) => (
                    <div key={h} className={`py-1 px-2 text-xs font-bold ${isDark ? 'bg-gray-700' : 'bg-gray-300'} text-gray-200`}>{h}</div>
                  ))}
                  {[
                    ['Rahul S.','P','A','P','❌ PEND'],
                    ['Priya K.','A','A','A','✅ PAID'],
                    ['Ankit M.','P','P','?','❌ PEND'],
                    ['Sneha R.','A','P','P','⚠️ PART'],
                    ['Ravi T.','?','?','A','❌ PEND'],
                    ['Mohit D.','P','A','A','✅ PAID'],
                  ].map((row, ri) => (
                    row.map((cell, ci) => (
                      <div
                        key={`${ri}-${ci}`}
                        className={`py-1 px-1 text-xs border-b ${ isDark ? 'border-gray-800' : 'border-gray-200'
                        } ${
                          cell === 'A' ? 'text-red-400 font-bold' :
                          cell === 'P' ? 'text-green-400' :
                          cell === '?' ? 'text-yellow-400 animate-pulse' :
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {cell}
                      </div>
                    ))
                  ))}
                </div>
                <div className="absolute top-2 right-2">
                  <div className="bg-red-500/20 border border-red-500/40 text-red-400 text-xs px-2 py-1 rounded">
                    156 errors found
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Section 2: Enter IntelliX */}
          <div ref={ref2} className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={inView2 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="order-2 md:order-1 relative"
            >
              {/* Futuristic dashboard mockup */}
              <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#0d0d14] border-purple-500/20' : 'bg-white border-purple-200 shadow-xl'}`}>
                <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>IntelliX AI Dashboard — Live</span>
                </div>
                <div className="p-4 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Students', value: '1,248', color: 'from-purple-500 to-blue-500', up: true },
                    { label: 'Attendance', value: '94.2%', color: 'from-cyan-500 to-blue-500', up: true },
                    { label: 'Revenue', value: '₹14.2L', color: 'from-green-500 to-emerald-500', up: true },
                  ].map(({ label, value, color, up }, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView2 ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.3 + i * 0.15 }}
                      className={`rounded-xl p-3 bg-gradient-to-br ${color} bg-opacity-10 ${isDark ? '' : 'shadow-sm'}`}
                      style={{ background: isDark ? undefined : `linear-gradient(135deg, rgba(191,95,255,0.08), rgba(0,102,255,0.05))` }}
                    >
                      <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                      <p className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                      <p className="text-xs text-green-400">{up ? '↑' : '↓'} Real-time</p>
                    </motion.div>
                  ))}
                </div>
                <div className={`mx-4 mb-4 rounded-xl p-3 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-tight mb-2 ${isDark ? 'text-white/60' : 'text-gray-900/60'}`}>🤖 AI Recommendations</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>✅ Fee reminder sent up automatically</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>📊 Risk flags analyzed — actions surfacing</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>🎯 Performance reports generated</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={inView2 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 md:order-2"
            >
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full mb-6">
                <span className="text-green-400 text-sm font-semibold">✨ After IntelliX</span>
              </div>
              <h3 className={`text-3xl md:text-4xl font-black mb-4 ${textPrimary}`}>
                Your Institute, Fully Automated
              </h3>
              <p className={`text-lg ${textSecondary} mb-8 leading-relaxed`}>
                IntelliX replaces chaos with clarity. Every process — attendance, fees, communication, 
                performance analytics — runs on autopilot powered by AI.
              </p>
              <div className="space-y-3">
                {[
                  '✅ AI-based auto attendance with smart detection',
                  '💰 Automated fee collection & reminders',
                  '📱 Instant parent notifications via WhatsApp',
                  '🧠 AI performance predictor & risk alerts',
                  '⚡ Save 4+ hours every single day',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView2 ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? 'bg-green-500/5 border border-green-500/10' : 'bg-green-50 border border-green-100'}`}
                  >
                    <span className="text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Section 3: AI & Automation */}
          <div ref={ref3}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView3 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6">
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Neural Engine</span>
              </div>
              <h3 className={`text-3xl md:text-4xl font-black mb-4 ${textPrimary}`}>
                Automation & Intelligence{' '}
                <span className="text-gradient">at Scale</span>
              </h3>
              <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>
                IntelliX AI continuously learns from your institute's data to predict outcomes, 
                automate workflows, and give you insights you never had before.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[
                { icon: '🤖', title: 'Predictive AI Engine', desc: 'Forecasts student drop-off risk, fee defaults, and performance trends before they happen.' },
                { icon: '⚡', title: 'Zero-touch Automation', desc: 'Attendance, reminders, reports, and communications run automatically without any manual input.' },
                { icon: '📊', title: 'Real-time Analytics', desc: 'Live dashboards show you exactly what\'s happening across all batches, teachers, and students.' },
              ].map(({ icon, title, desc }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView3 ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                  className={`glass-card p-6 text-center hover:border-white/20 transition-all`}
                >
                  <div className="text-4xl mb-4">{icon}</div>
                  <h4 className={`text-lg font-bold mb-2 ${textPrimary}`}>{title}</h4>
                  <p className={`text-sm ${textSecondary}`}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ScrollStory

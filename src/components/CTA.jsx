import { motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { ArrowRight } from 'lucide-react'

const CTA = () => {
  const { isDark } = useTheme()
  const shouldReduceMotion = useReducedMotion()

  const bgClass = isDark ? 'bg-black' : 'bg-white'
  const textColor = isDark ? 'text-gray-400' : 'text-gray-500'

  return (
    <section
      id="cta"
      className={`relative py-24 md:py-32 lg:py-[160px] overflow-hidden flex flex-col items-center justify-center min-h-[70vh] sm:min-h-[80vh] ${bgClass}`}
    >
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
        
        {/* Premium Floating Glass Panel */}
        <motion.div
           initial={{ opacity: 0, y: 30, scale: 1, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
           whileHover={!shouldReduceMotion ? { 
            scale: 1.01, 
            backdropFilter: 'blur(24px)', 
            WebkitBackdropFilter: 'blur(24px)',
            transition: { duration: 0.4, ease: "easeOut" }
          } : {}}
           className={`relative w-full max-w-[800px] flex flex-col items-center rounded-[40px] border p-8 md:p-20 ${
            isDark 
              ? 'bg-black/40 border-[rgba(255,255,255,0.08)]' 
              : 'bg-black/[0.02] border-black/[0.04]'
          }`}
          style={{
            boxShadow: '0px 40px 80px rgba(0,0,0,0.25)'
          }}
        >
          <p className={`text-[12px] font-bold tracking-[0.3em] uppercase mb-[40px] opacity-55 ${isDark ? 'text-white' : 'text-black'}`}>
            Next Phase: Opening Spring 2026
          </p>

          <h2 
            className={`font-serif leading-[1.1] tracking-tight mb-10 max-w-[640px] ${isDark ? 'text-white' : 'text-gray-950'}`}
            style={{ 
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}
          >
            Join the waitlist for
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>early entry.</span>
          </h2>

          <p className={`text-[16px] leading-[1.6] max-w-xl mx-auto mb-14 ${isDark ? 'text-white/70' : 'text-gray-900/70'}`}>
            IntelliX is being built in collaboration with a selective group of institutes. 
            Join the waitlist to receive updates and secure your place in the next sequence.
          </p>

          <div className="flex flex-col items-center gap-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-md relative group"
            >
              <input 
                type="email" 
                placeholder="email@address.com"
                className={`w-full bg-transparent border-b border-solid ${isDark ? 'border-white/20 focus:border-white/60' : 'border-black/20 focus:border-black/60'} py-4 px-2 outline-none transition-all text-lg tracking-wide ${isDark ? 'text-white' : 'text-black'}`}
              />
              <button className={`absolute right-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity ${isDark ? 'text-white' : 'text-black'}`}>
                <ArrowRight size={24} strokeWidth={1} />
              </button>
            </motion.div>
            
            <p className={`text-[11px] uppercase tracking-[0.2em] opacity-40 mt-2 ${isDark ? 'text-white' : 'text-black'}`}>
              Private access. No automated spam.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA

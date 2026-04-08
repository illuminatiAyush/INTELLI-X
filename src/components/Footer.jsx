import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Twitter, Linkedin, Instagram, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const footerLinks = {
  Product: ['Features', 'Pricing', 'Changelog', 'Documentation'],
  Platform: ['Student Management', 'Analytics', 'Security', 'Integrations'],
  Company: ['About Us', 'Careers', 'Blog', 'Contact'],
}

const Footer = () => {
  const { isDark } = useTheme()
  const [hoveredLetter, setHoveredLetter] = useState(null)

  const textColor = isDark ? 'text-gray-500' : 'text-gray-400'
  const headingColor = isDark ? 'text-gray-200' : 'text-gray-900'
  const borderColor = isDark ? 'border-white/5' : 'border-gray-100'

  return (
    <footer className={`py-20 relative overflow-hidden ${isDark ? 'bg-black border-t border-white/5' : 'bg-[#fafafa] border-t border-black/5'}`}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-16 md:gap-8 relative z-10">
          
          {/* Brand Section */}
          <div className="md:col-span-2 space-y-8">
            <Link to="/" className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>
              IntelliX
            </Link>
            
            <p className={`text-sm leading-relaxed max-w-xs ${textColor}`}>
              Architecting the future of educational infrastructure. 
              Engineering clarity for modern institutes through intelligent systems.
            </p>

            <div className="flex gap-5">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Mail, label: 'Email' }
              ].map(({ icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href="#"
                  whileHover={{ y: -2, opacity: 1 }}
                  className={`opacity-50 transition-all ${isDark ? 'text-white' : 'text-gray-950'}`}
                  aria-label={label}
                >
                  <Icon size={18} strokeWidth={1.5} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-6">
              <h4 className={`text-xs font-bold tracking-[0.2em] uppercase ${headingColor}`}>
                {category}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className={`text-sm transition-colors hover:opacity-100 opacity-60 ${isDark ? 'text-white' : 'text-gray-950'}`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Massive Brand Text Effect */}
        <div className="w-full mt-24 mb-12 flex justify-center items-center overflow-hidden select-none relative h-[12rem] md:h-[20rem]">
          <div className="flex pointer-events-auto h-full items-center relative">
            
            {/* Shimmer Overlay Layer (Optional based on implementation, here we'll use a globally moving gradient mask) */}
            <motion.div 
               animate={{ x: ['-100%', '100%'] }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-20deg]"
               style={{ mixBlendMode: 'overlay', zIndex: 1 }}
            />

            {"intellix".split("").map((char, idx) => {
              const isHovered = hoveredLetter === idx;
              const isNeighbor = hoveredLetter !== null && Math.abs(hoveredLetter - idx) === 1;
              
              return (
                <motion.span
                  key={idx}
                  onMouseEnter={() => setHoveredLetter(idx)}
                  onMouseLeave={() => setHoveredLetter(null)}
                  animate={{
                    opacity: isHovered ? 1 : isNeighbor ? 0.45 : 0.25,
                    scale: isHovered ? 1.08 : 1,
                    textShadow: isHovered 
                      ? '0px 0px 12px rgba(255,255,255,0.45)' 
                      : '0px 0px 0px rgba(255,255,255,0)',
                  }}
                  transition={{
                    duration: isHovered ? 0.25 : 0.3,
                    ease: "easeOut"
                  }}
                  className="font-bold tracking-tighter whitespace-nowrap inline-block cursor-default relative"
                  style={{
                    fontSize: 'clamp(4rem, 16vw, 20rem)',
                    lineHeight: 0.8,
                    color: isDark ? '#fff' : '#000',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
                    maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 border-t ${borderColor} flex flex-col md:flex-row justify-between items-center gap-6 relative z-10`}>
          <p className={`text-xs tracking-wide ${textColor}`}>
            © 2026 IntelliX. All rights reserved.
          </p>
          
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Security'].map((item) => (
              <a
                key={item}
                href="#"
                className={`text-xs tracking-wide transition-colors hover:opacity-100 opacity-40 ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

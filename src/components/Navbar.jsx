import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
]

const NavLink = ({ link, isActive, isDark, shouldReduceMotion }) => {
  return (
    <motion.a
      href={link.href}
      initial={false}
      animate={{ opacity: isActive ? 1 : 0.7 }}
      whileHover={{ opacity: 1 }}
      className={`relative text-xs font-semibold tracking-widest uppercase transition-opacity duration-200 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}
    >
      {link.label}
      <motion.div
        initial={false}
        animate={{ width: isActive ? '100%' : '0%' }}
        whileHover={!shouldReduceMotion ? { width: '100%' } : {}}
        className={`absolute -bottom-1 left-0 h-[1px] ${isDark ? 'bg-white' : 'bg-black'}`}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />
    </motion.a>
  )
}

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme()
  const { scrollY } = useScroll()
  const shouldReduceMotion = useReducedMotion()
  
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  const navbarY = useTransform(scrollY, [0, 40], [0, 1])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = ['features', 'pricing']
      const current = sections.find(id => {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })
      if (current) setActiveSection(`#${current}`)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.42, ease: 'easeOut' }}
      style={{
        y: shouldReduceMotion ? 0 : navbarY,
        left: '50%',
        translateX: '-50%',
        top: '16px',
        width: 'calc(100% - 32px)',
        zIndex: 100
      }}
      className={`fixed max-w-[1240px] px-6 transition-all duration-240 ease-out flex items-center justify-between ${
        scrolled
          ? `rounded-[14px] py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border ${
              isDark 
                ? 'bg-black/80 border-white/[0.08] backdrop-blur-[12px]' 
                : 'bg-white/80 border-black/[0.08] backdrop-blur-[12px]'
            }`
          : 'bg-transparent py-5 border-transparent'
      }`}
    >
      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0.85 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.16 }}
      >
        <Link to="/" className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
          IntelliX
        </Link>
      </motion.div>

      {/* Desktop Navigation Group */}
      <div className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-6 mr-4 border-r border-white/10 pr-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              link={link}
              isActive={activeSection === link.href}
              isDark={isDark}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-6 font-semibold tracking-widest text-[10px] uppercase">
          <button 
            onClick={toggleTheme}
            className={`transition-colors duration-200 ${isDark ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'}`}
          >
            {isDark ? 'Light' : 'Dark'} Mode
          </button>
          
          <Link
            to="/login"
            className={`px-6 py-2.5 rounded-full border transition-all duration-180 ease-out ${
              isDark
                ? 'border-white text-white hover:bg-white hover:text-black'
                : 'border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            Login
          </Link>
        </div>
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`md:hidden p-2 ${isDark ? 'text-white' : 'text-black'}`}
      >
        {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`absolute top-[full] left-0 right-0 mt-2 p-6 rounded-[14px] border ${
              isDark ? 'bg-[rgba(8,8,8,0.92)] border-white/[0.08] backdrop-blur-xl' : 'bg-white/95 border-black/[0.08] backdrop-blur-xl'
            }`}
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-xs font-bold tracking-widest uppercase ${isDark ? 'text-white/70' : 'text-black/70'}`}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
                <button onClick={() => {toggleTheme(); setMenuOpen(false)}} className={`text-[10px] font-bold tracking-widest uppercase text-left ${isDark ? 'text-white/40' : 'text-black/40'}`}>
                  Toggle {isDark ? 'Light' : 'Dark'} Mode
                </button>
                <Link to="/login" onClick={() => setMenuOpen(false)} className={`w-full py-4 rounded-full border text-center text-xs font-bold uppercase tracking-widest ${isDark ? 'border-white text-white' : 'border-black text-black'}`}>
                  Login
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar

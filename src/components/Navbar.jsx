import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'AI Engine', href: '#ai' },
  { label: 'Statistics', href: '#statistics' },
  { label: 'Pricing', href: '#pricing' },
]

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? isDark
            ? 'bg-black/70 backdrop-blur-xl border-b border-white/5'
            : 'bg-white/70 backdrop-blur-xl border-b border-black/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container-fluid">
        <div className="flex items-center justify-between h-20">
          <motion.div whileHover={{ scale: 1.02 }}>
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/intellix-icon.svg" alt="IntelliX Logo" className="w-9 h-9" />
              <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Intelli<span className="text-gradient">X</span>
              </span>
            </Link>
          </motion.div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                  : 'bg-black/5 hover:bg-black/10 text-gray-600'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block"
            >
              <Link
                to="/login"
                id="nav-login-btn"
                className={`text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all ${
                  isDark
                    ? 'border-white/10 text-gray-300 hover:bg-white/5'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Log In
              </Link>
            </motion.div>

            <motion.a
              href="#cta"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block glow-button text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
              id="nav-trial-btn"
            >
              Start Free Trial
            </motion.a>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-xl ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`md:hidden border-t ${
              isDark
                ? 'bg-black/90 backdrop-blur-xl border-white/5'
                : 'bg-white/90 backdrop-blur-xl border-black/10'
            }`}
          >
            <div className="container-fluid py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-medium py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-semibold py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Log In
              </Link>
              <a href="#cta" className="glow-button text-white text-sm font-semibold px-5 py-3 rounded-xl text-center">
                Start Free Trial
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar

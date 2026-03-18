import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Twitter, Linkedin, Instagram, Youtube, Mail, Phone } from 'lucide-react'

const footerLinks = {
  Product: ['Features', 'Dashboard', 'AI Engine', 'Analytics', 'Pricing', 'Changelog'],
  Solutions: ['Student Management', 'Fee Automation', 'Attendance System', 'Parent Portal', 'Faculty Tools'],
  Company: ['About Us', 'Careers', 'Blog', 'Press Kit', 'Partners'],
  Support: ['Help Center', 'Documentation', 'Community', 'Contact Us', 'Live Demo'],
}

const socials = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
]

const Footer = () => {
  const { isDark } = useTheme()

  return (
    <footer className={`border-t ${isDark ? 'bg-[#080810] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
      <div className="container-fluid py-20">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <img src="/intellix-icon.svg" alt="IntelliX Logo" className="w-9 h-9" />
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Intelli<span className="text-gradient">X</span>
              </span>
            </div>
            <p className={`text-sm leading-relaxed mb-6 max-w-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              The Digital Operating System for Modern Coaching Institutes. 
              Powered by AI, built for growth.
            </p>

            {/* Contact */}
            <div className="space-y-2 mb-6">
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                <Mail className="w-4 h-4" />
                hello@intellix.ai
              </div>
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                <Phone className="w-4 h-4" />
                +91 98765 43210
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ y: -3, scale: 1.1 }}
                  aria-label={label}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-purple-500/20 hover:border-purple-500/30 hover:text-purple-400'
                      : 'bg-white border border-gray-200 text-gray-500 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 shadow-sm'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{category}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className={`text-sm transition-colors ${
                        isDark ? 'text-gray-500 hover:text-purple-400' : 'text-gray-500 hover:text-purple-600'
                      }`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mt-16 pt-8 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            © 2026 IntelliX Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a
                key={item}
                href="#"
                className={`text-sm transition-colors ${isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
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

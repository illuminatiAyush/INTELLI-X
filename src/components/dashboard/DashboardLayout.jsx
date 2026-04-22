import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import IconWrapper from '../ui/IconWrapper'
import navConfig from '../../config/navConfig'
import {
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react'
import NotificationsMenu from '../NotificationsMenu'
import AIChatbot from './AIChatbot'
import { DashboardSkeleton } from '../ui/Skeletons'

const DashboardLayout = () => {
  const { user, role, profile, logOut, loading } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navItems = role ? (navConfig[role] || []) : []
  const currentPath = location.pathname
  const currentNavItem = (navItems || []).find((item) => item.path === currentPath) || { label: 'Overview' }

  const handleLogout = async () => {
    await logOut()
    navigate('/')
  }

  const roleLabels = {
    admin: 'Admin',
    master_admin: 'Master',
    teacher: 'Faculty',
    student: 'Student',
  }

  const roleLabel = roleLabels[role] || 'User'

  let displayName = profile?.name ||
    profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() :
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User'

  if (role === 'master_admin' && (displayName.toLowerCase() === 'admin' || displayName === 'User')) {
    displayName = 'Master'
  }

  const SidebarContent = ({ isExpanded }) => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border-subtle)] flex-shrink-0">
        <img src={isDark ? "/intellix-icon-white.svg" : "/intellix-icon-black.svg"} alt="IntelliX Logo" className="w-8 h-8" />
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-lg font-bold text-[var(--text-primary)] whitespace-nowrap"
            >
              Intelli<span className="opacity-50">X</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className={`flex-1 py-6 space-y-2 overflow-y-auto custom-scrollbar ${isExpanded ? 'px-4' : 'px-3'}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 w-full group relative"
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Line on far left edge of sidebar */}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className={`absolute top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full ${isExpanded ? '-left-4' : '-left-3'} ${
                      isDark ? 'bg-white' : 'bg-gradient-to-b from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                    }`}
                  />
                )}
                
                <IconWrapper icon={item.icon} active={isActive} wrapperSize={48} />

                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      className={`whitespace-nowrap font-bold text-sm transition-colors ${
                        isActive 
                          ? isDark ? 'text-white' : 'text-indigo-600' 
                          : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-[var(--border-subtle)] p-4 space-y-3 flex-shrink-0">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3 px-2 mb-3"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--border-subtle)] text-[var(--text-primary)] flex items-center justify-center text-sm font-bold flex-shrink-0 border border-[var(--border-subtle)]">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{displayName}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">{roleLabel}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            {isExpanded && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">
      <motion.aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-[var(--bg-app)] border-r border-[var(--border-subtle)] overflow-hidden ${sidebarOpen ? 'shadow-2xl shadow-black/50' : ''}`}
      >
        <SidebarContent isExpanded={sidebarOpen} />
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] z-50 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]"
            >
              <SidebarContent isExpanded={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-[72px]">
        {/* Top Bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/80 backdrop-blur-2xl sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]"
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="flex items-center gap-1">
            <NotificationsMenu />
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Top Bar (desktop) */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/80 backdrop-blur-xl sticky top-0 z-20">
          <div>
            <div className="text-sm font-medium text-[var(--text-secondary)] mb-1 flex items-center gap-2">
              <span className="hover:text-[var(--text-primary)] cursor-pointer">IntelliX</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className={currentPath === '/dashboard' ? 'text-[var(--text-primary)] font-semibold' : ''}>Dashboard</span>
              {currentPath !== '/dashboard' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-[var(--text-primary)] font-semibold">{currentNavItem.label}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <NotificationsMenu />
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm"
              >
                {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>
            </div>
            <div className="h-6 w-px bg-[var(--border-subtle)]"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] flex items-center justify-center text-sm font-bold border border-[var(--border-strong)] shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} className="p-2.5 rounded-xl border border-transparent hover:border-red-500/20 hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all">
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 relative">
          <div className="p-6 md:p-8 lg:p-10 transition-all duration-300 ease-in-out max-w-[1600px] mx-auto w-full">
            {loading ? (
              <div className="min-h-screen">
                <DashboardSkeleton />
              </div>
            ) : (
              <div className="flex flex-col gap-8 lg:gap-10">
                <Outlet />
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Global AI Assistant */}
      <AIChatbot />
    </div>
  )
}

export default DashboardLayout

import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import navConfig from '../../config/navConfig'
import { LogOut, Menu, Bell, Sun, Moon, ChevronRight } from 'lucide-react'
import NotificationsMenu from '../NotificationsMenu'
import AIChatbot from './AIChatbot'
import { DashboardSkeleton } from '../ui/Skeletons'

const DashboardLayout = () => {
  const { user, role, profile, logOut, loading } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = role ? (navConfig[role] || []) : []
  const currentPath = location.pathname

  const handleLogout = async () => {
    await logOut()
    navigate('/')
  }

  const roleLabels = { admin: 'Admin', master_admin: 'Master', teacher: 'Teacher', student: 'Student' }
  const roleLabel = roleLabels[role] || 'User'

  let displayName =
    profile?.name ||
    (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : null) ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User'
  if (role === 'master_admin' && ['admin', 'user'].includes(displayName.toLowerCase())) displayName = 'Master'

  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  /* ── Sidebar ── */
  const SidebarContent = () => (
    <div className="dashboard-sidebar">
      {/* Logo row */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-dashboard-border">
        <div className="w-8 h-8 bg-dashboard-text rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">iX</span>
        </div>
        <span className="text-dashboard-text font-bold text-base whitespace-nowrap">
          IntelliX
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? currentPath === '/dashboard'
                : currentPath.startsWith(item.path)
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setMobileOpen(false)}
              >
                <div className={`dashboard-nav-item ${isActive ? 'active' : ''}`}>
                  <Icon size={18} strokeWidth={2} />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-dashboard-border">
        {/* Avatar */}
        <div className="flex items-center gap-3 p-2">
          <div className="dashboard-avatar">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dashboard-text truncate">{displayName}</p>
            <p className="text-xs text-dashboard-text-secondary">{roleLabel}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 mt-2 text-dashboard-text-secondary hover:bg-dashboard-border-light transition-colors text-sm font-medium"
        >
          <LogOut size={16} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  /* ── Breadcrumb ── */
  const currentItem = navItems.find((item) =>
    item.path === '/dashboard'
      ? currentPath === '/dashboard'
      : currentPath.startsWith(item.path)
  )

  return (
    <div className="min-h-screen bg-dashboard-bg flex dashboard-layout">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-dashboard-border" style={{ width: 240 }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 bg-white border-r border-dashboard-border"
              style={{ width: 240 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
              style={{ width: 240 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col lg:ml-[240px]">
        {/* Top Header */}
        <header className="dashboard-header">
          {/* Left: mobile hamburger + breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-dashboard-text-secondary hover:text-dashboard-text rounded-lg hover:bg-dashboard-border-light transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-dashboard-text-secondary">IntelliX</span>
              <ChevronRight size={16} className="text-dashboard-text-muted" />
              <span className="text-dashboard-text-secondary">Dashboard</span>
              {currentItem && currentItem.path !== '/dashboard' && (
                <>
                  <ChevronRight size={16} className="text-dashboard-text-muted" />
                  <span className="text-dashboard-text font-semibold">{currentItem.label}</span>
                </>
              )}
            </div>
          </div>

          {/* Right: notifications + theme + user */}
          <div className="flex items-center gap-2">
            <NotificationsMenu />
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {loading ? <DashboardSkeleton /> : <Outlet />}
          </div>
        </main>
      </div>

      {/* Global AI Assistant */}
      <AIChatbot />
    </div>
  )
}

export default DashboardLayout

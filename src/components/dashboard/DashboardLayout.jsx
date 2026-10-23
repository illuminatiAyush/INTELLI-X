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
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start hidden
  const [sidebarHovered, setSidebarHovered] = useState(false)

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
  const SidebarContent = ({ collapsed = false, isDesktop = false }) => (
    <div className="dashboard-sidebar h-full flex flex-col">
      {/* Logo row */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-dashboard-border">
        <div className="w-8 h-8 bg-dashboard-text rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">iX</span>
        </div>
        {!collapsed && (
          <span className="text-dashboard-text font-bold text-base whitespace-nowrap">
            IntelliX
          </span>
        )}
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
                title={collapsed && isDesktop ? item.label : ''}
              >
                <div className={`dashboard-nav-item ${isActive ? 'active' : ''} ${collapsed && isDesktop ? 'justify-center' : ''}`}>
                  <Icon size={18} strokeWidth={2} />
                  {!collapsed && <span>{item.label}</span>}
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
          <div className="dashboard-avatar flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dashboard-text truncate">{displayName}</p>
              <p className="text-xs text-dashboard-text-secondary">{roleLabel}</p>
            </div>
          )}
        </div>

        {/* Logout */}
        {!collapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 mt-2 text-dashboard-text-secondary hover:bg-dashboard-border-light transition-colors text-sm font-medium"
          >
            <LogOut size={16} strokeWidth={2} />
            <span>Logout</span>
          </button>
        )}
        {collapsed && (
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-full flex items-center justify-center rounded-lg px-3 py-2 mt-2 text-dashboard-text-secondary hover:bg-dashboard-border-light transition-colors"
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        )}
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
      <motion.aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => {
          setSidebarHovered(false)
          setSidebarOpen(false) // Close on mouse leave unless clicked
        }}
        animate={{
          width: sidebarOpen || sidebarHovered ? 240 : 60,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-dashboard-border overflow-hidden"
      >
        {/* Toggle Button */}
        {!(sidebarOpen || sidebarHovered) && (
          <div className="flex items-center justify-center p-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-dashboard-text-secondary hover:text-dashboard-text rounded-lg hover:bg-dashboard-border-light transition-colors"
              title="Open sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        {/* Full Sidebar Content - only visible when open/hovered */}
        {(sidebarOpen || sidebarHovered) && (
          <SidebarContent collapsed={false} isDesktop={true} />
        )}
      </motion.aside>

      {/* ── Mobile Sidebar ── */}
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
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 bg-white border-r border-dashboard-border"
              style={{ width: 240 }}
            >
              <SidebarContent collapsed={false} isDesktop={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ── */}
      <motion.div
        animate={{
          marginLeft: sidebarOpen || sidebarHovered ? 240 : 60,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="flex-1 flex flex-col hidden lg:flex"
      >
        {/* Top Header */}
        <header className="dashboard-header">
          {/* Left: breadcrumb */}
          <div className="flex items-center gap-4">
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
      </motion.div>

      {/* ── Mobile Content Area ── */}
      <div className="flex-1 flex flex-col lg:hidden">
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

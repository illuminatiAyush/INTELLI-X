import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import IconWrapper from '../ui/IconWrapper'
import navConfig from '../../config/navConfig'
import {
  LogOut,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react'
import NotificationsMenu from '../NotificationsMenu'
import { DashboardSkeleton } from '../ui/Skeletons'

const DashboardLayout = () => {
  const { user, role, profile, logOut, loading } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-[var(--border-subtle)] w-[260px]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-[64px] border-b border-[var(--border-subtle)] flex-shrink-0">
        <img src="/intellix-icon-black.svg" alt="IntelliX Logo" className="w-8 h-8" />
        <span className="text-lg font-semibold text-gray-900 whitespace-nowrap">
          IntelliX
        </span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `
              flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-[var(--border-subtle)] p-4 flex-shrink-0 bg-gray-50/50">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  const MobileBottomNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-subtle)] flex items-center justify-around px-2 py-2 z-50 safe-area-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.slice(0, 5).map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/dashboard'}
          className={({ isActive }) => `
            flex flex-col items-center gap-1 min-w-[64px] p-2 rounded-xl transition-colors
            ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}
          `}
        >
          {({ isActive }) => (
            <>
              <item.icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-[260px] pb-[72px] lg:pb-0">
        {/* Top Header (Desktop & Mobile) */}
        <header className="h-[64px] flex items-center justify-between px-6 border-b border-[var(--border-subtle)] bg-white sticky top-0 z-20">
          <div className="flex items-center">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 mr-4">
               <img src="/intellix-icon-black.svg" alt="IntelliX" className="w-6 h-6" />
            </div>
            
            {/* Breadcrumb */}
            <div className="hidden sm:flex text-sm font-medium text-gray-500 items-center gap-2">
              <span className="hover:text-gray-900 cursor-pointer">IntelliX</span>
              <ChevronRight className="w-4 h-4" />
              <span className={currentPath === '/dashboard' ? 'text-gray-900 font-semibold' : ''}>Dashboard</span>
              {currentPath !== '/dashboard' && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-900 font-semibold">{currentNavItem.label}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationsMenu />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-transparent hover:bg-gray-50 text-gray-500 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative">
          <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full">
            {loading ? (
              <div className="min-h-screen">
                <DashboardSkeleton />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <Outlet />
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}

export default DashboardLayout

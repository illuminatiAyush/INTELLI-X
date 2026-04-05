import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Info } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

const NotificationsMenu = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!user) return

    fetchNotifications()

    // Realtime subscription
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-[#1A1C23] shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Bell className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{payload.new.title}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{payload.new.message}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200 dark:border-white/10">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-purple-500 hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Close
              </button>
            </div>
          </div>
        ))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
        setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n))
        fetchUnreadCount() // trigger re-calc safely
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  const fetchUnreadCount = async () => {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false)
    setUnreadCount(count || 0)
  }

  const markAsRead = async (id) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    if (unreadCount === 0) return
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm relative"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[var(--bg-surface)] animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden flex flex-col ${isDark ? 'bg-[#0B0B0F] border-white/10' : 'bg-white border-gray-200'}`}
            style={{ maxHeight: '450px' }}
          >
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </h3>
              <button onClick={markAllAsRead} className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium">Mark all as read</button>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center ${isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>You're all caught up!</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => !n.is_read && markAsRead(n.id)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex gap-3 group relative ${n.is_read ? (isDark ? 'hover:bg-white/5 opacity-70' : 'hover:bg-gray-50 opacity-70') : (isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-purple-50/50 hover:bg-purple-50')} border border-transparent ${!n.is_read ? (isDark ? 'hover:border-white/10' : 'hover:border-purple-100') : ''}`}
                  >
                    {!n.is_read && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-purple-500 rounded-r-md" />}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold mb-0.5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{n.title}</h4>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>{n.message}</p>
                      <span className={`text-[10px] uppercase font-bold tracking-wider mt-2 inline-block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationsMenu

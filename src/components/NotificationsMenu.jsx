import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Info } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NotificationsMenu = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const menuRef = useRef(null)
  const shownNotificationsRef = useRef(new Set()) // Track notifications that have already been shown as toasts

  useEffect(() => {
    if (!user) return

    fetchNotifications()

    const checkForNew = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!data) return

      // Filter notifications that haven't been shown as toasts yet
      const newOnes = data.filter(n => !shownNotificationsRef.current.has(n.id))

      if (newOnes.length > 0) {
        // Update state
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)

        // Show toast for truly new notifications and mark them as shown
        newOnes.forEach(n => {
          shownNotificationsRef.current.add(n.id) // Mark as shown
          
          toast.custom((t) => (
            <div
              className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full border shadow-xl rounded-2xl pointer-events-auto flex`}
              style={{ 
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <div className="flex-1 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ background: 'var(--accent-muted)' }}>
                    <Bell className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-4 border-l text-xs font-bold transition-colors"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                  ':hover': { color: 'var(--text-secondary)' }
                }}
              >
                ✕
              </button>
            </div>
          ), { duration: 5000 })
        })
      }
    }

    const poll = setInterval(checkForNew, 5000)

    const subscription = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        const newNotification = payload.new
        
        // Update state
        setNotifications(prev => [newNotification, ...prev])
        setUnreadCount(prev => prev + 1)
        
        // Show toast only if not already shown
        if (!shownNotificationsRef.current.has(newNotification.id)) {
          shownNotificationsRef.current.add(newNotification.id)
          
          toast.custom((t) => (
            <div
              className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full border shadow-xl rounded-2xl pointer-events-auto flex`}
              style={{ 
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <div className="flex-1 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ background: 'var(--accent-muted)' }}>
                    <Bell className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{newNotification.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{newNotification.message}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-4 border-l text-xs font-bold transition-colors"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                  ':hover': { color: 'var(--text-secondary)' }
                }}
              >
                ✕
              </button>
            </div>
          ), { duration: 5000 })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
      clearInterval(poll)
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
      setUnreadCount(data.filter(n => !n.read).length)
      
      // Mark all existing notifications as "already shown" to prevent toast spam on initial load
      data.forEach(notification => {
        shownNotificationsRef.current.add(notification.id)
      })
    }
  }

  const markAsRead = async (id) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // Optional: Remove from shown notifications set since it's now read
      // This helps prevent memory accumulation over time
      shownNotificationsRef.current.delete(id)
    }
  }

  const markAllAsRead = async () => {
    if (unreadCount === 0) return
    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      
      // Clear the shown notifications set since all are now read
      shownNotificationsRef.current.clear()
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-all"
        style={{
          color: 'var(--text-muted)',
          ':hover': { 
            background: 'var(--bg-hover)',
            color: 'var(--text-secondary)'
          }
        }}
      >
        <div className="relative">
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col"
            style={{ 
              maxHeight: '450px',
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between" 
                 style={{ 
                   background: 'var(--bg-muted)',
                   borderColor: 'var(--border-subtle)'
                 }}>
              <h3 className="font-semibold flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}>
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium transition-colors"
                style={{
                  color: 'var(--text-muted)',
                  ':hover': { color: 'var(--text-primary)' }
                }}
              >
                Mark all as read
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                       style={{ background: 'var(--bg-muted)' }}>
                    <Bell className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>You're all caught up!</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markAsRead(n.id)}
                    className="p-3 rounded-xl transition-all cursor-pointer flex gap-3 relative"
                    style={{
                      background: n.read ? 'transparent' : 'var(--accent-muted)',
                      border: n.read ? 'none' : '1px solid var(--border-accent)',
                      opacity: n.read ? 0.7 : 1,
                      ':hover': {
                        background: n.read ? 'var(--bg-hover)' : 'var(--accent-muted)'
                      }
                    }}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 rounded-r-md bg-blue-600" />
                    )}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                         style={{ 
                           background: 'var(--bg-muted)',
                           color: 'var(--text-secondary)'
                         }}>
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-0.5" 
                          style={{ color: 'var(--text-primary)' }}>{n.title}</h4>
                      <p className="text-xs leading-relaxed" 
                         style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                      <span className="text-[10px] uppercase font-bold tracking-wider mt-1 inline-block"
                            style={{ color: 'var(--text-muted)' }}>
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

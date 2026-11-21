import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

const getInitialTheme = () => {
  if (typeof window === 'undefined') return true
  try {
    const saved = localStorage.getItem('theme') || localStorage.getItem('intellix_theme')
    if (saved === 'dark') return true
    if (saved === 'light') return false
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? true
  } catch (e) {
    return true
  }
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(getInitialTheme)

  const applyTheme = useCallback((dark) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      root.classList.remove('light-mode', 'light')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.classList.add('light-mode', 'light')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
    }
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
      localStorage.setItem('intellix_theme', dark ? 'dark' : 'light')
    } catch (e) {
      console.warn('Unable to persist theme to localStorage', e)
    }
  }, [])

  useEffect(() => {
    applyTheme(isDark)
  }, [isDark, applyTheme])

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'theme' || e.key === 'intellix_theme') {
        const nextIsDark = e.newValue !== 'light'
        setIsDark(nextIsDark)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      applyTheme(next)
      return next
    })
  }, [applyTheme])

  const setTheme = useCallback((theme) => {
    const next = theme === 'dark'
    setIsDark(next)
    applyTheme(next)
  }, [applyTheme])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme, theme: isDark ? 'dark' : 'light' }}>
      {children}
    </ThemeContext.Provider>
  )
}

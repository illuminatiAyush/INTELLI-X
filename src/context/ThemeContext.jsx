import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  // Always default to dark — user can toggle to light
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light-mode', 'dark')
    if (isDark) {
      root.classList.add('dark')
      root.style.backgroundColor = '#2C2C2C'
      root.style.color = '#E4E4E4'
      document.body.style.backgroundColor = '#2C2C2C'
      document.body.style.color = '#E4E4E4'
    } else {
      root.classList.add('light-mode')
      root.style.backgroundColor = '#E8F4F5'
      root.style.color = '#1A2E30'
      document.body.style.backgroundColor = '#E8F4F5'
      document.body.style.color = '#1A2E30'
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

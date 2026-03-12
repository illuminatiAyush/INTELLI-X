import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ScrollStory from './components/ScrollStory'
import Features from './sections/Features'
import DashboardPreview from './components/DashboardPreview'
import AIVisualization from './components/AIVisualization'
import Statistics from './sections/Statistics'
import Testimonials from './sections/Testimonials'
import Pricing from './sections/Pricing'
import CTA from './components/CTA'
import AIChatbot from './components/AIChatbot'
import Footer from './components/Footer'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

const HomePage = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <ScrollStory />
      <Features />
      <DashboardPreview />
      <AIVisualization />
      <Statistics />
      <Testimonials />
      <Pricing />
      <CTA />
    </main>
    <Footer />
    <AIChatbot />
  </>
)

const AppContent = () => {
  const { isDark } = useTheme()

  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light-mode')
      document.documentElement.style.backgroundColor = '#0B0B0F'
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light-mode')
      document.documentElement.style.backgroundColor = '#f8f9ff'
    }
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

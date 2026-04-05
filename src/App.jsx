import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ValueClarity from './sections/ValueClarity'
import Features from './sections/Features'
import Testimonials from './sections/Testimonials'
import Statistics from './sections/Statistics'
import Pricing from './sections/Pricing'
import CTA from './components/CTA'
import FAQ from './sections/FAQ'
import AIChatbot from './components/AIChatbot'
import Footer from './components/Footer'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Toast from './components/ui/Toast'

import DashboardLayout from './components/dashboard/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import InstitutesPage from './pages/dashboard/InstitutesPage'
import TeachersPage from './pages/dashboard/TeachersPage'
import StudentsPage from './pages/dashboard/StudentsPage'
import BatchesPage from './pages/dashboard/BatchesPage'
import AttendancePage from './pages/dashboard/AttendancePage'
import TestsPage from './pages/dashboard/TestsPage'
import ResultsPage from './pages/dashboard/ResultsPage'
import LeaderboardPage from './pages/dashboard/LeaderboardPage'
import MaterialsPage from './pages/dashboard/MaterialsPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import SubscriptionsPage from './pages/dashboard/SubscriptionsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import LogsPage from './pages/dashboard/LogsPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import JoinBatch from './pages/dashboard/JoinBatch'
import ActiveTestsPage from './pages/dashboard/ActiveTestsPage'
import TestAttemptPage from './pages/dashboard/TestAttemptPage'

const JoinRedirect = () => {
  const { code } = useParams()
  useEffect(() => {
    if (code) {
      sessionStorage.setItem('pendingJoinCode', code)
      window.location.href = '/dashboard'
    }
  }, [code])
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  )
}

const HomePage = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <ValueClarity />
      <Statistics />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
    <Footer />
    <AIChatbot />
  </>
)

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="institutes" element={<InstitutesPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="batches" element={<BatchesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="tests" element={<TestsPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="join" element={<JoinBatch />} />
        <Route path="join/:code" element={<JoinBatch />} />
        <Route path="active-tests" element={<ActiveTestsPage />} />
        <Route path="test-attempt/:testId" element={<TestAttemptPage />} />
      </Route>
      <Route path="/join/:code" element={<JoinRedirect />} />
      {/* Fallback route - unknown routes go to index or login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <Toast />
          <AppContent />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

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
import AuthPage from './pages/AuthPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Toast from './components/ui/Toast'
import ErrorBoundary from './components/ErrorBoundary'

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-app)] gap-4 px-6 text-center">
      <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      <p className="text-sm font-medium text-[var(--text-secondary)] animate-pulse tracking-wide">
        Verifying your invitation code...
      </p>
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
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />

        {/* Protected Admin Routes */}
        <Route path="institutes" element={<ProtectedRoute allowedRoles={['master_admin']}><InstitutesPage /></ProtectedRoute>} />
        <Route path="teachers" element={<ProtectedRoute allowedRoles={['admin', 'master_admin']}><TeachersPage /></ProtectedRoute>} />
        <Route path="subscriptions" element={<ProtectedRoute allowedRoles={['admin', 'master_admin']}><SubscriptionsPage /></ProtectedRoute>} />
        <Route path="logs" element={<ProtectedRoute allowedRoles={['master_admin']}><LogsPage /></ProtectedRoute>} />
        
        {/* Common Dashboard Routes */}
        <Route path="students" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'master_admin']}><StudentsPage /></ProtectedRoute>} />
        <Route path="batches" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'master_admin']}><BatchesPage /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><AttendancePage /></ProtectedRoute>} />
        <Route path="tests" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><TestsPage /></ProtectedRoute>} />
        <Route path="results" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><ResultsPage /></ProtectedRoute>} />
        <Route path="leaderboard" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><LeaderboardPage /></ProtectedRoute>} />
        <Route path="materials" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><MaterialsPage /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'master_admin']}><AnalyticsPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><SettingsPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><ProfilePage /></ProtectedRoute>} />
        
        {/* Student Specific Routes */}
        <Route path="join" element={<ProtectedRoute allowedRoles={['student']}><JoinBatch /></ProtectedRoute>} />
        <Route path="join/:code" element={<ProtectedRoute allowedRoles={['student']}><JoinBatch /></ProtectedRoute>} />
        <Route path="active-tests" element={<ProtectedRoute allowedRoles={['student']}><ActiveTestsPage /></ProtectedRoute>} />
        <Route path="test-attempt/:testId" element={<ProtectedRoute allowedRoles={['student']}><TestAttemptPage /></ProtectedRoute>} />

      </Route>
      <Route path="/join/:code" element={<JoinRedirect />} />
      {/* Fallback route - unknown routes go to index or login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ThemeProvider>
            <Toast />
            <AppContent />
          </ThemeProvider>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

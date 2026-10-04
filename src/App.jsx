import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
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
import LandingPage from './pages/LandingPage'
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
import LecturesPage from './pages/dashboard/LecturesPage'

const Preloader = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white text-black"
      initial={{ y: 0 }}
      exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="overflow-hidden">
        <motion.h1
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
          className="text-5xl md:text-7xl font-light tracking-tighter"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          INTELLI-X<span className="text-blue-500">.</span>
        </motion.h1>
      </div>
    </motion.div>
  );
};

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = (e) => {
      if (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'a' || e.target.closest('button') || e.target.closest('a')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div className="hidden md:block pointer-events-none z-[9999]">
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-black rounded-full mix-blend-difference"
        animate={{ x: mousePosition.x - 6, y: mousePosition.y - 6, scale: isHovering ? 2 : 1 }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.15 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-black/30 rounded-full"
        animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16, scale: isHovering ? 1.5 : 1 }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
      />
    </div>
  );
};

const JoinRedirect = () => {
  const { code } = useParams()
  useEffect(() => {
    if (code) {
      sessionStorage.setItem('pendingJoinCode', code)
      window.location.href = '/dashboard'
    }
  }, [code])
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 px-6 text-center">
      <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-500 animate-pulse tracking-wide">
        Verifying your invitation code...
      </p>
    </div>
  )
}

const HomePageWrapper = () => {
  const [loading, setLoading] = useState(true);

  // Force Light mode globally
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    localStorage.setItem('theme', 'light');
  }, []);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [loading]);

  return (
    <div className="bg-white min-h-screen text-black premium-font selection:bg-blue-500/30">
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      {!loading && <CustomCursor />}
      
      <div className={loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}>
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
      </div>
    </div>
  )
}

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
        <Route path="batches" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><BatchesPage /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><AttendancePage /></ProtectedRoute>} />
        <Route path="lectures" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><LecturesPage /></ProtectedRoute>} />
        <Route path="tests" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><TestsPage /></ProtectedRoute>} />
        <Route path="results" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><ResultsPage /></ProtectedRoute>} />
        <Route path="leaderboard" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><LeaderboardPage /></ProtectedRoute>} />
        <Route path="materials" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><MaterialsPage /></ProtectedRoute>} />
        <Route path="analytics" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><AnalyticsPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><SettingsPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'master_admin']}><ProfilePage /></ProtectedRoute>} />
        
        {/* Student Specific Routes */}
        <Route path="join" element={<ProtectedRoute allowedRoles={['student']}><JoinBatch /></ProtectedRoute>} />
        <Route path="join/:code" element={<ProtectedRoute allowedRoles={['student']}><JoinBatch /></ProtectedRoute>} />
        <Route path="active-tests" element={<ProtectedRoute allowedRoles={['student']}><ActiveTestsPage /></ProtectedRoute>} />
        <Route path="test-attempt/:testId" element={<ProtectedRoute allowedRoles={['student']}><TestAttemptPage /></ProtectedRoute>} />

      </Route>
      <Route path="/join/:code" element={<JoinRedirect />} />
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

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
)

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(11,11,15,0.9)',
      borderColor: 'rgba(191,95,255,0.3)',
      borderWidth: 1,
      padding: 10,
      titleColor: '#fff',
      bodyColor: '#9ca3af',
    }
  },
  animation: { duration: 1500, easing: 'easeInOutQuart' },
}

const DashboardPreview = () => {
  const { isDark } = useTheme()

  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

  const revenueData = {
    labels: months,
    datasets: [{
      label: 'Revenue (₹L)',
      data: [8.2, 9.1, 10.4, 11.8, 10.2, 12.6, 13.1, 14.0, 14.2],
      borderColor: '#BF5FFF',
      backgroundColor: 'rgba(191,95,255,0.08)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#BF5FFF',
      pointRadius: 4,
      borderWidth: 2,
    }]
  }

  const attendanceData = {
    labels: months,
    datasets: [{
      label: 'Attendance %',
      data: [88, 91, 93, 89, 95, 92, 94, 96, 94],
      borderColor: '#00F5FF',
      backgroundColor: 'rgba(0,245,255,0.08)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#00F5FF',
      pointRadius: 4,
      borderWidth: 2,
    }]
  }

  const feeData = {
    labels: months,
    datasets: [{
      label: 'Fees Collected',
      data: [72, 85, 91, 88, 95, 89, 94, 97, 99],
      backgroundColor: months.map((_, i) =>
        i === months.length - 1 ? 'rgba(191,95,255,0.8)' : 'rgba(0,102,255,0.4)'
      ),
      borderRadius: 6,
      borderSkipped: false,
    }]
  }

  const enrollmentData = {
    labels: ['Physics', 'Chemistry', 'Math', 'Biology', 'English'],
    datasets: [{
      data: [280, 210, 320, 190, 150],
      backgroundColor: [
        'rgba(191,95,255,0.8)',
        'rgba(0,102,255,0.8)',
        'rgba(0,245,255,0.6)',
        'rgba(16,185,129,0.8)',
        'rgba(245,158,11,0.8)',
      ],
      borderWidth: 0,
    }]
  }

  const lineOpts = {
    ...chartDefaults,
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)', drawBorder: false },
        ticks: { color: isDark ? '#6b7280' : '#9ca3af', font: { size: 10 } },
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)', drawBorder: false },
        ticks: { color: isDark ? '#6b7280' : '#9ca3af', font: { size: 10 } },
      }
    }
  }

  const barOpts = {
    ...chartDefaults,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#6b7280' : '#9ca3af', font: { size: 10 } },
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)', drawBorder: false },
        ticks: { color: isDark ? '#6b7280' : '#9ca3af', font: { size: 10 } },
        max: 100,
      }
    }
  }

  const doughnutOpts = {
    ...chartDefaults,
    cutout: '65%',
    plugins: {
      ...chartDefaults.plugins,
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { size: 10 },
          boxWidth: 10,
          padding: 8,
        }
      }
    }
  }

  const panelBg = isDark ? 'bg-[#0d0d16] border-white/5' : 'bg-white border-gray-200 shadow-sm'
  const labelColor = isDark ? 'text-gray-400' : 'text-gray-500'
  const headingColor = isDark ? 'text-white' : 'text-gray-900'

  return (
    <section id="dashboard" className={`section-padding ${isDark ? 'bg-[#0B0B0F]' : 'bg-gray-50'}`}>
      <div className="container-fluid">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">Live Product Preview</p>
          <h2 className={`text-4xl md:text-5xl font-black mb-6 ${headingColor}`}>
            The IntelliX{' '}
            <span className="text-gradient">Analytics Dashboard</span>
          </h2>
          <p className={`text-lg max-w-xl mx-auto ${labelColor}`}>
            Every data point about your institute — live, beautiful, and actionable.
          </p>
        </motion.div>

        {/* Dashboard UI Frame */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#0a0a12] border-white/8' : 'bg-white border-gray-200 shadow-2xl'}`}
        >
          {/* Window chrome */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/5 bg-[#0d0d16]' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className={`text-xs font-semibold ${labelColor}`}>IntelliX Analytics — FY 2025-26</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className={`text-xs ${labelColor}`}>Live</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KPI Cards */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: '1,248', change: '+12%', color: 'text-green-400', icon: '👥' },
                { label: 'Monthly Revenue', value: '₹14.2L', change: '+8%', color: 'text-green-400', icon: '💰' },
                { label: 'Avg Attendance', value: '94.2%', change: '-1.2%', color: 'text-red-400', icon: '✅' },
                { label: 'Fees Collected', value: '99%', change: '+4%', color: 'text-green-400', icon: '🎯' },
              ].map(({ label, value, change, color, icon }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`border rounded-2xl p-4 ${panelBg}`}
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <p className={`text-xs mb-1 ${labelColor}`}>{label}</p>
                  <p className={`text-xl font-black ${headingColor}`}>{value}</p>
                  <p className={`text-xs font-medium mt-1 ${color}`}>{change} vs last month</p>
                </motion.div>
              ))}
            </div>

            {/* Revenue Line Chart */}
            <div className={`lg:col-span-2 border rounded-2xl p-5 ${panelBg}`}>
              <p className={`text-sm font-semibold mb-1 ${headingColor}`}>Revenue Trend</p>
              <p className={`text-xs mb-4 ${labelColor}`}>Monthly revenue (₹ Lakhs) — last 9 months</p>
              <div style={{ height: 200 }}>
                <Line data={revenueData} options={lineOpts} />
              </div>
            </div>

            {/* Enrollment Donut */}
            <div className={`border rounded-2xl p-5 ${panelBg}`}>
              <p className={`text-sm font-semibold mb-1 ${headingColor}`}>Enrollment by Subject</p>
              <p className={`text-xs mb-4 ${labelColor}`}>Active students per subject</p>
              <div style={{ height: 200 }}>
                <Doughnut data={enrollmentData} options={doughnutOpts} />
              </div>
            </div>

            {/* Attendance Line Chart */}
            <div className={`border rounded-2xl p-5 ${panelBg}`}>
              <p className={`text-sm font-semibold mb-1 ${headingColor}`}>Attendance Trend</p>
              <p className={`text-xs mb-4 ${labelColor}`}>Monthly average attendance %</p>
              <div style={{ height: 180 }}>
                <Line data={attendanceData} options={lineOpts} />
              </div>
            </div>

            {/* Fee Collection Bar Chart */}
            <div className={`lg:col-span-2 border rounded-2xl p-5 ${panelBg}`}>
              <p className={`text-sm font-semibold mb-1 ${headingColor}`}>Fee Collection Rate</p>
              <p className={`text-xs mb-4 ${labelColor}`}>Percentage of total fees collected each month</p>
              <div style={{ height: 180 }}>
                <Bar data={feeData} options={barOpts} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default DashboardPreview

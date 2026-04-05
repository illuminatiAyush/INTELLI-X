import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { TrendingUp } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const Skeleton = () => (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 animate-pulse">
    <div className="h-5 w-48 rounded bg-[var(--border-subtle)] mb-6" />
    <div className="h-52 w-full rounded-xl bg-[var(--border-subtle)]" />
  </div>
)

const PerformanceChart = ({ testScores, loading }) => {
  const chartData = useMemo(() => {
    if (!testScores) return null
    return {
      labels: testScores.labels,
      datasets: [
        {
          label: 'Score',
          data: testScores.scores,
          borderColor: '#9333ea',
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height)
            gradient.addColorStop(0, 'rgba(147, 51, 234, 0.3)')
            gradient.addColorStop(1, 'rgba(147, 51, 234, 0.0)')
            return gradient
          },
          borderWidth: 3,
          pointBackgroundColor: '#9333ea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }, [testScores])

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#fff',
          bodyColor: '#d4d4d8',
          borderColor: 'rgba(147,51,234,0.3)',
          borderWidth: 1,
          cornerRadius: 12,
          padding: 12,
          callbacks: {
            label: (ctx) => `Score: ${ctx.parsed.y}%`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#a1a1aa', font: { size: 12, weight: 500 } },
          border: { display: false },
        },
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#a1a1aa',
            font: { size: 12, weight: 500 },
            callback: (v) => `${v}%`,
            stepSize: 20,
          },
          border: { display: false },
        },
      },
      interaction: { intersect: false, mode: 'index' },
    }),
    []
  )

  if (loading) return <Skeleton />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Performance Trend</h3>
      </div>
      <div className="h-56">
        {chartData && <Line data={chartData} options={options} />}
      </div>
    </motion.div>
  )
}

export default PerformanceChart

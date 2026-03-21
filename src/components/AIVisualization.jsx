import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const AIVisualization = () => {
  const { isDark } = useTheme()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight

    const nodeColors = ['#BF5FFF', '#0066FF', '#00F5FF', '#7C3AED', '#06B6D4']

    const layers = [
      { x: 0.1, count: 4 },
      { x: 0.3, count: 6 },
      { x: 0.5, count: 8 },
      { x: 0.7, count: 6 },
      { x: 0.9, count: 4 },
    ]

    const nodes = []

    layers.forEach((layer, li) => {
      const spacing = H / (layer.count + 1)
      for (let i = 0; i < layer.count; i++) {
        nodes.push({
          x: layer.x * W,
          y: spacing * (i + 1),
          layer: li,
          radius: 4 + Math.random() * 3,
          color: nodeColors[li % nodeColors.length],
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.02,
          active: false,
          activeCooldown: 0,
        })
      }
    })

    const connections = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].layer === nodes[i].layer + 1) {
          connections.push({ from: i, to: j, progress: 0, active: false, speed: 0.005 + Math.random() * 0.01 })
        }
      }
    }

    let tick = 0
    const signals = []

    const fireRandomSignal = () => {
      const fromNodes = nodes.filter(n => n.layer === 0)
      const fromNode = fromNodes[Math.floor(Math.random() * fromNodes.length)]
      const fromIdx = nodes.indexOf(fromNode)
      const conns = connections.filter(c => c.from === fromIdx)
      if (conns.length) {
        const conn = conns[Math.floor(Math.random() * conns.length)]
        signals.push({ conn, progress: 0, color: fromNode.color })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H)
      tick++

      if (tick % 60 === 0) fireRandomSignal()

      // Update signals
      for (let i = signals.length - 1; i >= 0; i--) {
        signals[i].progress += 0.015
        if (signals[i].progress >= 1) {
          // Activate destination node and propagate
          const destIdx = signals[i].conn.to
          nodes[destIdx].active = true
          nodes[destIdx].activeCooldown = 20

          if (nodes[destIdx].layer < 4) {
            const nextConns = connections.filter(c => c.from === destIdx)
            if (nextConns.length) {
              const nextConn = nextConns[Math.floor(Math.random() * nextConns.length)]
              signals.push({ conn: nextConn, progress: 0, color: signals[i].color })
            }
          }
          signals.splice(i, 1)
        }
      }

      // Draw connections
      connections.forEach(conn => {
        const from = nodes[conn.from]
        const to = nodes[conn.to]
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      // Draw signal particles
      signals.forEach(sig => {
        const from = nodes[sig.conn.from]
        const to = nodes[sig.conn.to]
        const x = from.x + (to.x - from.x) * sig.progress
        const y = from.y + (to.y - from.y) * sig.progress

        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = sig.color
        ctx.fill()
        ctx.shadowBlur = 15
        ctx.shadowColor = sig.color
      })

      // Draw nodes
      nodes.forEach(node => {
        node.pulse += node.pulseSpeed
        const pulseFactor = 0.8 + 0.2 * Math.sin(node.pulse)
        const r = node.radius * pulseFactor

        if (node.activeCooldown > 0) {
          node.activeCooldown--
          if (node.activeCooldown === 0) node.active = false
        }

        // Glow
        if (node.active) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2)
          const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3)
          grad.addColorStop(0, node.color + '60')
          grad.addColorStop(1, 'transparent')
          ctx.fillStyle = grad
          ctx.fill()
        }

        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
        ctx.fillStyle = node.active ? node.color : node.color + '80'
        ctx.fill()
        ctx.shadowBlur = node.active ? 20 : 8
        ctx.shadowColor = node.color
      })

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animId)
  }, [isDark])

  return (
    <section id="ai" className={`section-padding ${isDark ? 'bg-[#080810]' : 'bg-gray-50'}`}>
      <div className="container-fluid">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full mb-6">
              <span className="text-purple-400 text-sm font-semibold">🧠 Neural AI Engine</span>
            </div>
            <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              IntelliX AI Thinks{' '}
              <span className="text-gradient">Like Your Best Analyst</span>
            </h2>
            <p className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Our neural AI engine continuously analyzes thousands of data points 
              from your institute — attendance patterns, test scores, payment behavior, 
              class engagement — and surfaces the insights that matter most.
            </p>

            <div className="space-y-4">
              {[
                { icon: '🎯', title: 'Dropout Risk Detection', desc: 'Identifies students likely to drop out 2 weeks before it happens.' },
                { icon: '💡', title: 'Smart Recommendations', desc: 'Suggests interventions, calls, and actions for every risk flag.' },
                { icon: '📈', title: 'Performance Forecasting', desc: 'Predicts exam scores based on attendance + engagement patterns.' },
                { icon: '🔄', title: 'Continuous Learning', desc: 'AI gets smarter with your data — more accurate every month.' },
              ].map(({ icon, title, desc }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-xl glass-card`}
                >
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Neural network canvas */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`relative rounded-3xl overflow-hidden border ${isDark ? 'border-purple-500/20 bg-[#0a0a12]' : 'border-purple-100 bg-white shadow-xl'}`}
            style={{ height: 400 }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className={`glass-card px-3 py-2 text-xs font-semibold ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                🟢 AI Engine Active
              </div>
              <div className={`glass-card px-3 py-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Analyzing 1,248 students
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AIVisualization

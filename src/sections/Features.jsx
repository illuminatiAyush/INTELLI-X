import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import {
  Users, Zap, DollarSign, BarChart2, Brain, MessageSquare,
  ChevronRight, BookOpen, Clock, Target, ShieldCheck, Video, CheckCircle
} from 'lucide-react'

const featuresData = {
  Institute: [
    {
      icon: Users,
      title: 'Smart Student Management',
      desc: 'Complete student lifecycle management with profiles, batch tracking, performance history, and parent portal.',
      gradient: 'from-purple-500 to-violet-600',
      glow: 'rgba(139,92,246,0.3)',
      tags: ['CRM', 'Batch Mgmt', 'Profiles'],
    },
    {
      icon: Zap,
      title: 'AI Attendance System',
      desc: 'Face-recognition or biometric AI attendance — instant, accurate, and automatic. Parents notified instantly.',
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'rgba(6,182,212,0.3)',
      tags: ['AI', 'Real-time', 'Biometric'],
    },
    {
      icon: DollarSign,
      title: 'Automated Fee Management',
      desc: 'Smart fee collection, automated reminders, partial payment tracking, and instant receipts. Zero chaos.',
      gradient: 'from-green-500 to-emerald-500',
      glow: 'rgba(16,185,129,0.3)',
      tags: ['Payments', 'Automation', 'Reminders'],
    },
    {
      icon: BarChart2,
      title: 'Faculty Productivity Dashboard',
      desc: 'Track teacher performance, class ratings, topic coverage, and student outcomes with data-driven insights.',
      gradient: 'from-orange-500 to-amber-500',
      glow: 'rgba(245,158,11,0.3)',
      tags: ['Analytics', 'KPIs', 'Reports'],
    },
    {
      icon: Brain,
      title: 'AI Performance Predictor',
      desc: 'IntelliX AI analyzes 50+ data points per student to predict exam scores and identify at-risk learners.',
      gradient: 'from-pink-500 to-purple-500',
      glow: 'rgba(236,72,153,0.3)',
      tags: ['ML', 'Predictions', 'Insights'],
    },
    {
      icon: MessageSquare,
      title: 'Smart Communication System',
      desc: 'Automated WhatsApp, SMS, and email campaigns. Send bulk messages and scheduled reports from one hub.',
      gradient: 'from-indigo-500 to-blue-500',
      glow: 'rgba(99,102,241,0.3)',
      tags: ['WhatsApp', 'SMS', 'Alerts'],
    },
  ],
  Teachers: [
    {
      icon: BookOpen,
      title: 'Intelligent Lesson Planner',
      desc: 'Auto-generate lesson plans aligned with curriculum standards. Attach resources, quizzes, and slide decks instantly.',
      gradient: 'from-amber-400 to-orange-500',
      glow: 'rgba(245,158,11,0.3)',
      tags: ['Planning', 'Syllabus', 'AI'],
    },
    {
      icon: CheckCircle,
      title: 'Automated Grading & Assessment',
      desc: 'AI-assisted grading for objective and subjective tests. Saves 15+ hours per week on manual evaluation.',
      gradient: 'from-emerald-400 to-teal-500',
      glow: 'rgba(16,185,129,0.3)',
      tags: ['Grading', 'Exams', 'Time-saver'],
    },
    {
      icon: Video,
      title: 'Live Class Integration',
      desc: 'One-click launch for Zoom/Meet classes directly from the dashboard. Auto-recordings and auto-attendance tracking.',
      gradient: 'from-blue-500 to-indigo-600',
      glow: 'rgba(59,130,246,0.3)',
      tags: ['Zoom', 'Meet', 'Virtual'],
    },
    {
      icon: Target,
      title: 'Real-time Class Analytics',
      desc: 'Monitor student attention and participation metrics during live sessions or physical classes using AI tracking.',
      gradient: 'from-purple-500 to-pink-500',
      glow: 'rgba(168,85,247,0.3)',
      tags: ['Attention', 'Metrics', 'Live'],
    },
  ],
  Students: [
    {
      icon: Target,
      title: 'Personalized Learning Paths',
      desc: 'AI adapts to your learning pace. Generates custom practice sets focusing purely on your weak areas.',
      gradient: 'from-cyan-400 to-blue-500',
      glow: 'rgba(6,182,212,0.3)',
      tags: ['Adaptive', 'Practice', 'AI'],
    },
    {
      icon: ShieldCheck,
      title: 'Gamified Achievements',
      desc: 'Earn badges, level up, and compete on institute leaderboards. Turn daily assignments into engaging quests.',
      gradient: 'from-yellow-400 to-orange-500',
      glow: 'rgba(250,204,21,0.3)',
      tags: ['Badges', 'Leaderboard', 'Fun'],
    },
    {
      icon: MessageSquare,
      title: '24/7 AI Doubt Resolution',
      desc: 'Stuck on a problem at 2 AM? Our AI tutor explains concepts step-by-step without giving away the direct answer.',
      gradient: 'from-purple-500 to-indigo-500',
      glow: 'rgba(139,92,246,0.3)',
      tags: ['Chatbot', 'Tutor', 'Help'],
    },
    {
      icon: Clock,
      title: 'Smart Revision Scheduler',
      desc: 'Uses spaced-repetition algorithms to schedule revision alerts just before you are about to forget a concept.',
      gradient: 'from-pink-500 to-rose-500',
      glow: 'rgba(236,72,153,0.3)',
      tags: ['Memory', 'Scheduling', 'Exams'],
    },
  ]
}

const FeatureCard = ({ feature, index }) => {
  const { isDark } = useTheme()
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15
    setTilt({ x, y })
  }

  const handleMouseLeave = () => {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  const Icon = feature.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -30 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        boxShadow: hovered ? `0 20px 60px ${feature.glow}, 0 0 40px ${feature.glow}` : undefined,
        transition: hovered ? 'box-shadow 0.2s, transform 0.1s' : 'box-shadow 0.4s, transform 0.4s ease',
      }}
      className={`glass-card p-6 cursor-pointer group relative overflow-hidden h-full ${
        isDark ? '' : 'bg-white border-gray-200 shadow-sm hover:shadow-lg'
      }`}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${feature.glow.replace('0.3', '0.08')}, transparent 70%)` }}
      />

      {/* Scan line */}
      {hovered && (
        <div className="scan-line absolute left-0 right-0 opacity-30" />
      )}

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon */}
        <motion.div
          animate={hovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg flex-shrink-0`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {feature.title}
        </h3>

        {/* Description */}
        <p className={`text-sm flex-1 leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {feature.desc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {feature.tags.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold ${
                isDark
                  ? 'bg-white/5 text-gray-300 border border-white/10'
                  : 'bg-purple-50 text-purple-700 border border-purple-100'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Learn more link */}
        <motion.div
          animate={hovered ? { x: 4 } : { x: 0 }}
          className="flex items-center gap-1 text-xs font-semibold text-purple-400 mt-auto"
        >
          Explore module <ChevronRight className="w-3 h-3" />
        </motion.div>
      </div>
    </motion.div>
  )
}

const Features = () => {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('Institute')

  const tabs = ['Institute', 'Teachers', 'Students']

  return (
    <section id="features" className={`section-padding ${isDark ? 'bg-[#080810]' : 'bg-gray-50'}`}>
      <div className="container-fluid">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">Platform Features</p>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Everything Your <span className="text-gradient">{activeTab}</span>{' '}
            Need
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            IntelliX provides powerful, specialized modules tailored for administrators, educators, and learners.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className={`inline-flex p-1 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-200 border border-gray-300'}`}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  activeTab === tab 
                    ? (isDark ? 'text-white' : 'text-purple-600') 
                    : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800')
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className={`absolute inset-0 rounded-xl shadow-sm ${isDark ? 'glass-card bg-white/10' : 'bg-white'}`}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab === 'Institute' && <Users className="w-4 h-4" />}
                  {tab === 'Teachers' && <BookOpen className="w-4 h-4" />}
                  {tab === 'Students' && <Target className="w-4 h-4" />}
                  {tab}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div 
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {featuresData[activeTab].map((feature, i) => (
              <FeatureCard key={`${activeTab}-${feature.title}`} feature={feature} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

export default Features

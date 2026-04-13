import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import {
  Users, Zap, DollarSign, BarChart2, Brain, MessageSquare,
  BookOpen, Target, ShieldCheck, Video, CheckCircle, Clock
} from 'lucide-react'

const featuresData = {
  Institute: [
    {
      icon: Users,
      title: 'Smart Student Management',
      desc: 'Complete student lifecycle management.',
      points: ['Student profiles & history', 'Batch tracking & grouping', 'Performance timeline', 'Parent portal access']
    },
    {
      icon: Zap,
      title: 'AI Attendance System',
      desc: 'Face-recognition AI attendance, zero effort.',
      points: ['Biometric / face recognition', 'Real-time auto-marking', 'Instant parent alerts', 'Daily & monthly reports']
    },
    {
      icon: DollarSign,
      title: 'Automated Fee Management',
      desc: 'Smart fee collection with zero chaos.',
      points: ['Automated payment reminders', 'Partial payment tracking', 'Instant digital receipts', 'Multi-mode collection']
    },
    {
      icon: BarChart2,
      title: 'Faculty Productivity Dashboard',
      desc: 'Data-driven insights on every teacher.',
      points: ['Class ratings & feedback', 'Topic coverage tracking', 'Student outcome metrics', 'KPI-based reporting']
    },
    {
      icon: Brain,
      title: 'AI Performance Predictor',
      desc: 'Predict scores, flag at-risk students.',
      points: ['50+ data points per student', 'Exam score forecasting', 'At-risk early warning', 'Actionable AI insights']
    },
    {
      icon: MessageSquare,
      title: 'Smart Communication System',
      desc: 'One hub for all your outreach.',
      points: ['WhatsApp bulk messaging', 'SMS & email automation', 'Scheduled report delivery', 'Parent communication logs']
    },
  ],
  Teachers: [
    {
      icon: BookOpen,
      title: 'Intelligent Lesson Planner',
      desc: 'Auto-generate syllabus-aligned plans.',
      points: ['Curriculum mapping', 'Resource attachment', 'AI content generation', 'Schedule sync']
    },
    {
      icon: CheckCircle,
      title: 'Automated Grading',
      desc: 'AI-assisted evaluation for all tests.',
      points: ['Optical mark recognition', 'Subjective AI analysis', 'Instant result sheet', 'Performance feedback']
    },
    {
      icon: Video,
      title: 'Live Class Integration',
      desc: 'Virtual classrooms in one click.',
      points: ['Zoom/Meet embedding', 'Auto-recording logs', 'Engagement tracking', 'Resource sharing']
    },
    {
      icon: Target,
      title: 'Class Analytics',
      desc: 'Monitor real-time participation.',
      points: ['Student attention score', 'Activity tracking', 'Syllabus progress', 'Interaction heatmaps']
    },
  ],
  Students: [
    {
      icon: Target,
      title: 'Adaptive Practice',
      desc: 'Personalized paths for every learner.',
      points: ['Weak area identification', 'Custom practice sets', 'Difficulty leveling', 'Progress visualization']
    },
    {
      icon: ShieldCheck,
      title: 'Gamified Learning',
      desc: 'Engaging quest-based achievements.',
      points: ['Institute leaderboards', 'Badge collection', 'Daily streaks', 'Challenge systems']
    },
    {
      icon: MessageSquare,
      title: 'AI Tutor Support',
      desc: '24/7 conceptual doubt resolution.',
      points: ['Step-by-step guidance', 'Formula identification', 'Contextual examples', 'Late-night support']
    },
    {
      icon: Clock,
      title: 'Revision Scheduler',
      desc: 'Retain knowledge with smart alerts.',
      points: ['Spaced repetition system', 'Topic priority sorting', 'Exam countdowns', 'Retention metrics']
    },
  ]
}

const FeatureCard = ({ feature, index, tabColor }) => {
  const { isDark } = useTheme()
  const Icon = feature.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative rounded-2xl p-8 transition-all duration-300 ${
        isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-gray-50 border border-gray-100'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 ${
          isDark ? `bg-${tabColor}-500/10 text-${tabColor}-400 border border-${tabColor}-500/20 shadow-[0_0_20px_-5px_rgba(var(--${tabColor}-rgb),0.3)]` : `bg-${tabColor}-50 text-${tabColor}-600 border border-${tabColor}-100`
        }`}>
          <Icon size={24} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {feature.title}
        </h3>

        {/* Description */}
        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {feature.desc}
        </p>

        {/* Dynamic points grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mt-auto pt-4 border-t border-white/[0.05]">
          {feature.points.map((point, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-white/40' : 'bg-gray-400'}`} />
              <span className={`text-[11px] md:text-xs tracking-tight ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                {point}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const Features = () => {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('Institute')

  const tabConfigs = {
    Institute: { label: 'Institute', color: 'cyan' },
    Teachers: { label: 'Teachers', color: 'purple' },
    Students: { label: 'Students', color: 'emerald' }
  }

  const tabs = Object.values(tabConfigs)
  const activeConfig = tabConfigs[activeTab]

  return (
    <section id="features" className={`py-20 md:py-32 relative overflow-hidden ${isDark ? 'bg-[#000000]' : 'bg-white'}`}>
      {/* Background Architectural Grid Texture */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px), 
                            linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 
            className={`font-serif leading-[1.1] mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
            style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}
          >
            Everything your <span className={`italic font-normal transition-colors duration-500 ${isDark ? `text-${activeConfig.color}-400` : `text-${activeConfig.color}-600`}`}>{activeTab}</span> needs
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            Powerful, specialized modules built for administrators, educators, and learners.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-16">
          <div className={`inline-flex p-1 rounded-full ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
            {tabs.map(tab => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`relative px-8 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  activeTab === tab.label 
                    ? (isDark ? `text-${tab.color}-400` : `text-${tab.color}-700`) 
                    : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-black')
                }`}
              >
                {activeTab === tab.label && (
                  <motion.div
                    layoutId="activeFeatureTab"
                    className={`absolute inset-0 rounded-full shadow-lg ${isDark ? `bg-${tab.color}-500/10 border border-${tab.color}-500/20` : 'bg-white shadow-sm border border-gray-200'}`}
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <motion.div 
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {featuresData[activeTab].map((feature, i) => (
              <FeatureCard key={`${activeTab}-${feature.title}`} feature={feature} index={i} tabColor={activeConfig.color} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

export default Features

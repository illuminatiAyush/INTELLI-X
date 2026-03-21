import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Check, Zap, Star, Building } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    price: '₹2,999',
    period: '/month',
    desc: 'Perfect for small institutes getting started with digital management.',
    highlights: 'Up to 200 students',
    features: [
      'Student Management (200 students)',
      'Basic Attendance Tracking',
      'Fee Management & Receipts',
      'WhatsApp Notifications',
      'Basic Analytics Dashboard',
      'Email Support',
    ],
    gradient: 'from-gray-500 to-gray-600',
    glow: 'rgba(107,114,128,0.3)',
    popular: false,
  },
  {
    name: 'Professional',
    icon: Star,
    price: '₹7,499',
    period: '/month',
    desc: 'The complete IntelliX experience for growing coaching institutes.',
    highlights: 'Up to 1,000 students',
    features: [
      'Student Management (1,000 students)',
      'AI Attendance System',
      'Smart Fee Management',
      'Faculty Productivity Dashboard',
      'AI Performance Predictor',
      'Smart Communication Suite',
      'Advanced Analytics & Reports',
      'Priority Support 24/7',
    ],
    gradient: 'from-purple-500 to-blue-600',
    glow: 'rgba(191,95,255,0.4)',
    popular: true,
  },
  {
    name: 'Enterprise',
    icon: Building,
    price: 'Custom',
    period: '',
    desc: 'Full-scale IntelliX deployment for large institutes and chains.',
    highlights: 'Unlimited students',
    features: [
      'Unlimited Students & Branches',
      'Custom AI Model Training',
      'White-label Dashboard',
      'API Access & Integrations',
      'Dedicated Account Manager',
      'Custom Reporting Suite',
      'SLA-backed Uptime Guarantee',
      'On-premise Deployment Option',
    ],
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.3)',
    popular: false,
  },
]

const PricingCard = ({ plan, i }) => {
  const { isDark } = useTheme()
  const [hovered, setHovered] = useState(false)
  const Icon = plan.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={hovered ? { y: -8, scale: 1.02 } : { y: 0, scale: 1 }}
      className={`relative rounded-3xl p-8 border transition-all duration-300 ${
        plan.popular
          ? isDark
            ? 'bg-gradient-to-b from-purple-500/10 to-blue-500/5 border-purple-500/40'
            : 'bg-gradient-to-b from-purple-50 to-blue-50 border-purple-300 shadow-xl'
          : isDark
            ? 'glass-card'
            : 'bg-white border-gray-200 shadow-sm'
      }`}
      style={{
        boxShadow: hovered ? `0 30px 60px ${plan.glow}, 0 0 30px ${plan.glow}` : undefined,
      }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="glow-button text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
            ✨ Most Popular
          </div>
        </div>
      )}

      {/* Icon & Name */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{plan.highlights}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <span className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</span>
      </div>

      {/* Description */}
      <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{plan.desc}</p>

      {/* CTA */}
      <motion.button
        id={`pricing-${plan.name.toLowerCase()}-btn`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`w-full py-3.5 rounded-2xl font-bold text-sm mb-8 transition-all ${
          plan.popular
            ? 'glow-button text-white'
            : isDark
              ? 'border border-white/10 text-white hover:bg-white/5'
              : 'border border-gray-200 text-gray-800 hover:bg-gray-50'
        }`}
      >
        {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
      </motion.button>

      {/* Features */}
      <ul className="space-y-3">
        {plan.features.map((f, fi) => (
          <li key={fi} className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{f}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

const Pricing = () => {
  const { isDark } = useTheme()

  return (
    <section id="pricing" className={`section-padding ${isDark ? 'bg-[#080810]' : 'bg-gray-50'}`}>
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">Pricing</p>
          <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Simple, Transparent{' '}
            <span className="text-gradient">Pricing</span>
          </h2>
          <p className={`text-lg max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Start with a 30-day free trial. No credit card required. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 pt-6">
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} i={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={`text-center mt-12 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
        >
          All plans include free onboarding, data migration, and staff training. 
          <span className="text-purple-400 font-medium"> GST applicable.</span>
        </motion.p>
      </div>
    </section>
  )
}

export default Pricing

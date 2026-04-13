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
    gradient: 'from-white/10 to-white/5',
    glow: 'rgba(255,255,255,0.1)',
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
    gradient: 'from-white/10 to-white/5',
    glow: 'rgba(255,255,255,0.1)',
    popular: false,
  },
]

const PricingCard = ({ plan, i }) => {
  const { isDark } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.1 }}
      className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
        isDark 
          ? 'bg-[#08080c] border border-white/5 hover:border-white/10 hover:shadow-white/[0.02]' 
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-gray-200/50'
      } ${plan.popular ? (isDark ? 'ring-1 ring-white/20' : 'ring-1 ring-gray-900 bg-gray-50') : ''}`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-6">
          <div className={`text-[10px] uppercase tracking-widest font-bold px-4 py-1 rounded-full border ${
            isDark 
              ? 'bg-white text-black border-white' 
              : 'bg-gray-900 text-white border-gray-900 shadow-sm'
          }`}>
            Recommended
          </div>
        </div>
      )}

      {/* Plan Name */}
      <div className="mb-8">
        <p className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</p>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{plan.highlights}</p>
      </div>

      {/* Price */}
      <div className="mb-8 flex items-baseline gap-1">
        <span className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</span>
      </div>

      {/* Description */}
      <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{plan.desc}</p>

      {/* CTA */}
      <motion.button
        id={`pricing-${plan.name.toLowerCase()}-btn`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3.5 rounded-xl font-bold text-sm mb-8 transition-all ${
          plan.popular
            ? 'bg-white text-black hover:bg-gray-200'
            : isDark
              ? 'border border-white/10 text-white hover:bg-white/5'
              : 'border border-gray-200 text-gray-800 hover:bg-gray-50'
        }`}
        style={plan.popular && !isDark ? { background: '#111118', color: '#fff' } : undefined}
      >
        {plan.price === 'Custom' ? 'Talk to Infrastructure' : 'Begin Deployment'}
      </motion.button>

      {/* Features */}
      <div className="space-y-4">
        <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Capabilities</p>
        <ul className="space-y-3">
          {plan.features.map((f, fi) => (
            <li key={fi} className="flex items-start gap-3">
              <Check className={`w-3.5 h-3.5 mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-900'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

const Pricing = () => {
  const { isDark } = useTheme()

  return (
    <section id="pricing" className={`py-24 md:py-32 lg:py-40 relative overflow-hidden ${isDark ? 'bg-[#000000]' : 'bg-[#fafafa]'}`}>
      {/* Background Architectural Texture */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px), 
                            linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-left"
        >
          <h2 className={`text-4xl md:text-5xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Pricing.
          </h2>
          <p className={`text-2xl md:text-3xl font-medium tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Choose your plan.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 pt-6">
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} i={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={`text-left mt-12 text-xs uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
        >
          All infra-nodes include free migration & system training. 
          <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}> Standard taxes apply.</span>
        </motion.p>
      </div>
    </section>
  )
}

export default Pricing

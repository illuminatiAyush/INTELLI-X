import { useState, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const faqData = [
  {
    question: "What is IntelliX?",
    answer: "IntelliX is a learning intelligence infrastructure platform designed to connect students, educators, and knowledge workflows through adaptive structure rather than isolated tools."
  },
  {
    question: "Is IntelliX a learning management system?",
    answer: "No. IntelliX is not designed to manage courses alone. It is designed to organize learning environments and intelligence across contexts."
  },
  {
    question: "Who is IntelliX designed for?",
    answer: "IntelliX is designed for students, educators, institutions, and modern learning environments exploring structured and connected approaches to learning."
  },
  {
    question: "What problem is IntelliX trying to solve?",
    answer: "Most learning platforms organize courses and dashboards. IntelliX is being built to organize learning intelligence itself."
  },
  {
    question: "How is IntelliX different from existing learning platforms?",
    answer: "Instead of acting as a destination for content delivery, IntelliX functions as an infrastructure layer that supports how learning environments connect, adapt, and evolve over time."
  },
  {
    question: "Why does learning need infrastructure?",
    answer: "As learning expands beyond classrooms and courses, it requires systems that support continuity, coordination, and intelligence across environments. IntelliX is designed to support that shift."
  },
  {
    question: "When will IntelliX be available?",
    answer: "Access to IntelliX is opening in stages. Early participants are invited to join the waitlist to receive updates and early entry opportunities."
  },
  {
    question: "How can I get early access to IntelliX?",
    answer: "You can join the IntelliX early access waitlist to receive updates as the platform becomes available in stages."
  }
]

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  const { isDark } = useTheme()

  return (
    <div 
      className={`rounded-2xl transition-all duration-500 overflow-hidden ${
        isDark ? 'bg-white/[0.05] border border-white/[0.12]' : 'bg-white border border-gray-200 shadow-sm'
      } ${isOpen ? (isDark ? `border-${color}-500/50 bg-${color}-500/[0.08] shadow-[0_0_30px_-10px_rgba(var(--${color}-rgb),0.2)]` : `border-${color}-500/30 bg-${color}-50/50 shadow-md`) : (isDark ? 'hover:border-white/20' : 'hover:border-gray-300')}`}
    >
      <button
        onClick={onClick}
        className="w-full text-left flex justify-between items-center p-6 group focus:outline-none"
        aria-expanded={isOpen}
      >
        <span
          className={`text-sm md:text-base font-bold tracking-tight transition-all duration-300 ${
            isOpen ? (isDark ? `text-${color}-400` : `text-${color}-600`) : (isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900')
          }`}
        >
          {question}
        </span>
        <motion.span 
          animate={{ rotate: isOpen ? 135 : 0 }}
          className={`text-2xl font-light transition-colors ${isOpen ? (isDark ? `text-${color}-400` : `text-${color}-600`) : (isDark ? 'text-white/20' : 'text-black/20')}`}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-6 pb-6">
              <p 
                className={`text-sm md:text-base leading-relaxed font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const { isDark } = useTheme()

  return (
    <section id="faq" className={`py-24 md:py-32 lg:py-48 relative overflow-hidden bg-[var(--bg-app)] transition-colors duration-1000`}>
      {/* Background Architectural Texture */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px), 
                            linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}
      />
      
      {/* Dynamic Background Glows for Dark Mode */}
      {isDark && (
        <>
          <div className="absolute top-1/4 -left-20 w-[45rem] h-[45rem] bg-indigo-500/[0.08] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-[45rem] h-[45rem] bg-blue-500/[0.08] rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      <div className="relative max-w-6xl mx-auto px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center md:text-left"
        >
          <motion.h2 
            className={`text-6xl md:text-8xl font-black mb-4 tracking-tighter ${isDark ? 'neon-text' : 'text-gray-900'}`}
          >
            FAQ.
          </motion.h2>
          <p className={`text-xl md:text-2xl font-black tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your questions, answered with clarity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {faqData.map((item, index) => {
            const colors = ['indigo', 'rose', 'amber', 'emerald', 'purple', 'cyan']
            const color = colors[index % colors.length]
            return (
              <FAQItem
                key={index}
                color={color}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FAQ

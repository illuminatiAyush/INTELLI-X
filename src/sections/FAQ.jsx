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
      className={`rounded-2xl transition-all duration-300 ${
        isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-gray-50 border border-gray-100'
      } ${isOpen ? 'ring-1 ring-purple-500/20' : ''}`}
    >
      <button
        onClick={onClick}
        className="w-full text-left flex justify-between items-center p-6 group focus:outline-none"
        aria-expanded={isOpen}
      >
        <span
          className={`text-sm md:text-base font-semibold leading-tight tracking-tight transition-opacity ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {question}
        </span>
        <motion.span 
          animate={{ rotate: isOpen ? 45 : 0 }}
          className={`text-xl ${isDark ? 'text-white/40' : 'text-black/40'}`}
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
                className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
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
    <section id="faq" className={`py-24 md:py-32 lg:py-40 relative overflow-hidden ${isDark ? 'bg-black' : 'bg-[#fafafa]'}`}>
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
            FAQ.
          </h2>
          <p className={`text-2xl md:text-3xl font-medium tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your questions, answered.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Rajesh Sharma',
    role: 'Director',
    institute: 'Apex Coaching Institute, Pune',
    avatar: 'RS',
    color: 'from-purple-500 to-violet-600',
    rating: 5,
    quote: 'IntelliX has completely transformed how we run our institute. What used to take 3 hours of admin work now happens automatically. Our revenue is up 40% and students are performing better than ever.',
  },
  {
    name: 'Priya Mehta',
    role: 'Founder & CEO',
    institute: 'BrightPath Academy, Mumbai',
    avatar: 'PM',
    color: 'from-blue-500 to-cyan-500',
    rating: 5,
    quote: 'The AI performance predictor is absolutely incredible. It flagged 6 at-risk students last month. We called their parents, took action, and retained all 6. IntelliX literally saved ₹1.8 lakh in fees.',
  },
  {
    name: 'Ankit Verma',
    role: 'Operations Head',
    institute: 'Vision IIT Academy, Delhi',
    avatar: 'AV',
    color: 'from-green-500 to-emerald-500',
    rating: 5,
    quote: 'Fee collection went from 78% to 99% in just 2 months with automated reminders. The parents appreciate the instant WhatsApp updates, and our staff is actually happy now. Best software we\'ve ever used.',
  },
  {
    name: 'Sunita Patel',
    role: 'Institute Owner',
    institute: 'Scholars Hub, Ahmedabad',
    avatar: 'SP',
    color: 'from-orange-500 to-amber-500',
    rating: 5,
    quote: 'I was skeptical about switching from spreadsheets. But IntelliX gave us data visibility we never had. Now I know exactly how every student, teacher, and batch is performing — in real time.',
  },
  {
    name: 'Mohammad Khan',
    role: 'Academic Director',
    institute: 'Excel Coaching Centre, Hyderabad',
    avatar: 'MK',
    color: 'from-pink-500 to-purple-500',
    rating: 5,
    quote: 'The dashboard is gorgeous and incredibly useful. Parents keep complimenting us on how professional we\'ve become. IntelliX made us look like a premium institution. 10/10 would recommend.',
  },
]

const TestimonialCard = ({ t, i }) => {
  const { isDark } = useTheme()
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`glass-card p-6 w-80 flex-shrink-0 group cursor-default ${
        isDark ? 'hover:border-purple-500/30' : 'bg-white shadow-sm hover:shadow-xl'
      } transition-all`}
    >
      <Quote className="w-6 h-6 text-purple-400 mb-4 opacity-60" />

      <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        "{t.quote}"
      </p>

      <div className="flex items-center gap-1 mb-4">
        {[...Array(t.rating)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
          {t.avatar}
        </div>
        <div>
          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.name}</p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t.role} · {t.institute}</p>
        </div>
      </div>
    </motion.div>
  )
}

const Testimonials = () => {
  const { isDark } = useTheme()
  const scrollRef = useRef(null)

  return (
    <section className={`section-padding ${isDark ? 'bg-[#080810]' : 'bg-gray-50'} overflow-hidden`}>
      <div className="container-fluid mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">Testimonials</p>
          <h2 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Loved by{' '}
            <span className="text-gradient">Institute Owners</span>{' '}
            Across India
          </h2>
        </motion.div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 px-6 md:px-12 scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          cursor: 'grab',
        }}
        onMouseDown={(e) => {
          const el = scrollRef.current
          el._mouseDown = true
          el._startX = e.pageX - el.offsetLeft
          el._scrollLeft = el.scrollLeft
          el.style.cursor = 'grabbing'
        }}
        onMouseLeave={() => {
          if (scrollRef.current) {
            scrollRef.current._mouseDown = false
            scrollRef.current.style.cursor = 'grab'
          }
        }}
        onMouseUp={() => {
          if (scrollRef.current) {
            scrollRef.current._mouseDown = false
            scrollRef.current.style.cursor = 'grab'
          }
        }}
        onMouseMove={(e) => {
          const el = scrollRef.current
          if (!el._mouseDown) return
          e.preventDefault()
          const x = e.pageX - el.offsetLeft
          const walk = (x - el._startX) * 2
          el.scrollLeft = el._scrollLeft - walk
        }}
      >
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} t={t} i={i} />
        ))}
      </div>
    </section>
  )
}

export default Testimonials

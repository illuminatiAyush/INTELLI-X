import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { X, Send, Bot, User, Sparkles } from 'lucide-react'

// Role-based quick questions
const roleQuickQuestions = {
  student: [
    'My attendance percentage?',
    'Upcoming tests?',
    'My weak subjects?',
    'Study plan for this week',
  ],
  teacher: [
    'Class performance overview',
    'Students with low attendance',
    'Create a test strategy',
    'Suggest teaching improvements',
  ],
  admin: [
    'Institute analytics overview',
    'At-risk students',
    'Fee collection status',
    'Monthly performance report',
  ],
  master_admin: [
    'Platform-wide stats',
    'Active institutes',
    'System health check',
    'Growth metrics',
  ],
}

const AIChatbot = () => {
  const { isDark } = useTheme()
  const { role, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello. I am the IntelliX AI Assistant. How can I support your environment today?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [contextData, setContextData] = useState({})
  const messagesEndRef = useRef(null)

  const quickQuestions = roleQuickQuestions[role] || roleQuickQuestions.student

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && user) {
      fetchContextData()
    }
  }, [isOpen, user])

  const fetchContextData = async () => {
    try {
      const ctx = {}
      if (role === 'student') {
        const { data: students } = await supabase.from('students').select('id, name, batch_students(batch_id)').eq('profile_id', user.id)
        if (students?.[0]) {
          const student = students[0]
          ctx.studentName = student.name
          const { data: attendance } = await supabase.from('attendance').select('status').eq('student_id', student.id)
          const total = attendance?.length || 0
          const present = attendance?.filter(a => a.status === 'present').length || 0
          ctx.attendance = total ? `${((present / total) * 100).toFixed(1)}%` : 'No records'
        }
      }
      setContextData(ctx)
    } catch (err) {
      console.error('Context fetch error:', err)
    }
  }

  const sendMessageToAI = async (text) => {
    const q = text || input.trim()
    if (!q) return
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInput('')
    setIsTyping(true)
    try {
      const { sendMessage } = await import('../services/aiService')
      const response = await sendMessage(q, messages, role || 'student', contextData)
      setMessages(prev => [...prev, { role: 'ai', text: response }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection interrupted. Please verify connectivity.' }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Premium Triger Button */}
      <motion.button
        id="ai-chatbot-btn"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isDark 
            ? 'bg-black border border-white/10 text-white hover:bg-neutral-900' 
            : 'bg-black border border-black/10 text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={20} strokeWidth={1.5} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles size={20} strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Subtle Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chatbot-panel"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className={`fixed bottom-24 sm:bottom-28 right-4 sm:right-8 z-[90] w-[calc(100vw-32px)] sm:w-[380px] rounded-[2rem] border overflow-hidden backdrop-blur-xl transition-all duration-300 flex flex-col shadow-2xl ${
              isDark ? 'bg-black/95 border-white/[0.08]' : 'bg-white/95 border-gray-200'
            }`}
            style={{ height: '500px', maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Background Grid Texture */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px), 
                                  linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Header */}
            <div className={`relative px-6 py-5 border-b flex-shrink-0 ${isDark ? 'border-white/[0.05]' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-serif italic ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    IntelliX <span className="not-italic font-sans font-bold text-xs uppercase tracking-widest text-purple-400 opacity-60 ml-1">AI</span>
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <p className={`text-[10px] font-medium tracking-tight uppercase opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>
                      Operational · System Engine
                    </p>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 border border-white/10 text-white/40' : 'bg-black/5 text-black/40'}`}>
                  <Sparkles size={18} strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="relative flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? isDark ? 'bg-white/10 text-white' : 'bg-black text-white'
                        : isDark ? 'bg-white/[0.03] border border-white/[0.05] text-gray-300' : 'bg-gray-50 border border-gray-100 text-gray-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`px-5 py-4 rounded-2xl ${isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-gray-50'}`}>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(d => (
                        <motion.div
                          key={d}
                          className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white/20' : 'bg-black/20'}`}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Actions & Input */}
            <div className={`relative p-6 pt-2 pb-6 border-t flex-shrink-0 ${isDark ? 'border-white/[0.05]' : 'border-gray-100'}`}>
              {/* Quick Prompt Grid */}
              <div className="flex flex-wrap gap-2 mb-6">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessageToAI(q)}
                    className={`text-[10px] font-bold tracking-tight uppercase px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                      isDark
                        ? 'bg-white/5 border-white/5 text-gray-500 hover:border-purple-500/30 hover:text-purple-300'
                        : 'bg-black/5 border-black/5 text-gray-500 hover:border-black/20 hover:text-black'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Precise Input Field */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessageToAI()}
                  placeholder="Engine query..."
                  className={`flex-1 text-xs px-4 py-3 rounded-xl outline-none transition-all duration-300 ${
                    isDark
                      ? 'bg-white/[0.05] border border-white/[0.05] text-white placeholder-gray-600 focus:border-white/20'
                      : 'bg-gray-50 border border-gray-100 text-gray-900 placeholder-gray-400 focus:border-black/20'
                  }`}
                />
                <button
                  onClick={() => sendMessageToAI()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  <Send size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIChatbot

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { MessageSquare, X, Send, Bot, User } from 'lucide-react'

const conversations = [
  {
    id: 1,
    question: 'How many students were absent today?',
    answer: 'Today 18 students were absent. 5 of them have been absent more than 3 times this week — Rahul Sharma, Priya Kale, Ankit More, Sneha Raj, and Ravi Tiwari. I\'ve scheduled automated follow-up calls to their parents. 🎯',
  },
  {
    id: 2,
    question: 'Show me this month\'s fee collection status.',
    answer: 'This month\'s fee collection is at 94.2% (₹12.8L collected out of ₹13.6L). 73 students have pending fees. 28 reminders were sent via WhatsApp today. 6 students have partial payments — I recommend a direct call for these cases. 💰',
  },
  {
    id: 3,
    question: 'Which students are at risk of dropping out?',
    answer: 'AI analysis shows 4 students at high dropout risk: Amit Sharma (attendance 52%, fees pending), Divya Patel (3 consecutive fails), Karan Singh (disengaged since last month), Ritu Gupta (parent complaints). Recommend intervention today. 🚨',
  },
  {
    id: 4,
    question: 'What\'s our revenue compared to last month?',
    answer: 'Revenue this month: ₹14.2 Lakhs — up 8% vs last month (₹13.1L). Top revenue batches: JEE Advanced (₹4.8L), NEET Batch-A (₹3.9L), Class 10 Board (₹2.6L). On track to hit ₹16L target by month end. 📈',
  },
]

const quickQuestions = [
  'Absent students today?',
  'Fee collection status',
  'At-risk students',
  'Monthly revenue',
]

const AIChatbot = () => {
  const { isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I\'m IntelliX AI Assistant. Ask me anything about your institute — attendance, fees, performance, or analytics. 🤖' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text) => {
    const q = text || input.trim()
    if (!q) return

    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInput('')
    setIsTyping(true)

    // Find best matching response
    let response = conversations.find(c =>
      q.toLowerCase().includes('absent') ? c.id === 1 :
        q.toLowerCase().includes('fee') ? c.id === 2 :
          q.toLowerCase().includes('risk') || q.toLowerCase().includes('dropout') ? c.id === 3 :
            q.toLowerCase().includes('revenue') ? c.id === 4 : false
    )

    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        role: 'ai',
        text: response?.answer || 'Great question! I\'m analyzing your institute data right now... Based on current trends, I recommend checking the detailed analytics dashboard for the most accurate insights. Want me to pull up specific metrics? 📊'
      }])
    }, 1500)
  }

  const panelBg = isDark
    ? 'bg-[#0d0d16] border-purple-500/20'
    : 'bg-white border-purple-200'

  return (
    <>
      {/* FAB Button */}
      <motion.button
        id="ai-chatbot-btn"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 glow-button rounded-2xl flex items-center justify-center shadow-2xl"
        aria-label="Open AI Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse ring */}
      {!isOpen && (
        <motion.div
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: 'radial-gradient(circle, rgba(191,95,255,0.4), transparent)' }}
        />
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chatbot-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-3xl border overflow-hidden chatbot-container ${panelBg}`}
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className={`flex items-center gap-3 p-4 border-b ${isDark ? 'border-white/5 bg-gradient-to-r from-purple-500/10 to-blue-500/10' : 'border-gray-100 bg-purple-50'}`}>
              <div className="w-9 h-9 glow-button rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>IntelliX AI Assistant</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Online — analyzing your institute</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: 300 }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 glow-button rounded-lg flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-br-sm'
                        : isDark
                          ? 'bg-white/5 text-gray-300 rounded-bl-sm border border-white/5'
                          : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <User className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 glow-button rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${isDark ? 'bg-white/5 border border-white/5' : 'bg-gray-100'}`}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(d => (
                        <motion.div
                          key={d}
                          className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            <div className={`px-4 pb-2 flex flex-wrap gap-1.5`}>
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/30'
                      : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className={`p-4 border-t flex gap-2 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask anything about your institute..."
                className={`flex-1 text-xs px-3 py-2.5 rounded-xl outline-none transition-all ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-purple-500/40'
                    : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-300'
                }`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => sendMessage()}
                className="w-9 h-9 glow-button rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIChatbot

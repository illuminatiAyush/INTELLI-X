import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2, Minimize2, Maximize2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocation } from 'react-router-dom'
import { sendChatMessage } from '../../services/aiChatService'
import { useTheme } from '../../context/ThemeContext'

const AIChatbot = () => {
  const { isDark } = useTheme()
  const { user, role } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi ${user?.user_metadata?.full_name?.split(' ')[0] || 'there'}! I'm IntelliX AI. How can I help you with your ${role} dashboard today?`, timestamp: new Date() }
  ])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', text: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await sendChatMessage(input, {
        role,
        currentPage: location.pathname,
        user,
        // Attempt to extract batchId if on a batch-related page
        batchId: location.pathname.includes('batch/') ? location.pathname.split('/').pop() : null
      })

      setMessages(prev => [...prev, { role: 'ai', text: response, timestamp: new Date() }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having some trouble connecting right now. Please check your connection or try again later.", timestamp: new Date(), isError: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-[var(--text-primary)] text-[var(--bg-app)] shadow-2xl z-50 flex items-center justify-center border-2 ${isDark ? 'border-white/20' : 'border-black/10'} transition-all ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : ''}`}
      >
        <Sparkles className="w-8 h-8" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[var(--bg-app)] rounded-full" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9, x: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              x: 0,
              height: isMinimized ? '64px' : '550px',
              width: isMinimized ? '300px' : '400px'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[60] flex flex-col overflow-hidden backdrop-blur-xl transition-all duration-300"
          >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">IntelliX AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-widest">Active Assistant</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-xl hover:bg-[var(--bg-app)] text-[var(--text-secondary)] transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar"
                >
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                          msg.role === 'user'
                            ? (isDark ? 'bg-white/10 text-white border border-white/20' : 'bg-black/5 text-black border border-black/10')
                            : (isDark ? 'bg-white/5 text-white/50 border border-white/10' : 'bg-black/5 text-black/40 border border-black/5')
                        }`}>
                          {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed ${ msg.role === 'user' 
                            ? (isDark ? 'bg-white text-black shadow-xl rounded-tr-none' : 'bg-black text-white shadow-xl rounded-tr-none')
                            : msg.isError 
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20 rounded-tl-none' 
                              : 'bg-[var(--bg-app)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 items-center text-[var(--text-secondary)] text-xs bg-[var(--bg-app)] px-4 py-2 rounded-full border border-[var(--border-subtle)]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
                  <div className="relative group">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask anything..."
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder:text-[var(--text-secondary)]/50"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 active:scale-95 transition-all shadow-xl"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-[var(--text-secondary)]/30 mt-3 font-medium uppercase tracking-[0.2em]">
                    Powered by Gemini 1.5 Flash
                  </p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIChatbot

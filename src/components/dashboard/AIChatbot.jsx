import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2, Minimize2, Maximize2, Plus, Image as ImageIcon, Crop, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocation } from 'react-router-dom'
import { sendChatMessage } from '../../services/aiChatService'
import { performOCR, solveDoubt } from '../../services/doubtService'
import { useTheme } from '../../context/ThemeContext'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

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
  const scrollRef = useRef(null)
  const imgRef = useRef(null)
  const fileInputRef = useRef(null)

  // Doubt Solver Integrated State
  const [selectedImage, setSelectedImage] = useState(null)
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [ocrProgress, setOcrProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen, processingStatus])

  // Handle Image Selection
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setSelectedImage(reader.result)
        setIsCropModalOpen(true)
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  // Finalize Crop and Start Processing
  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return
    
    setIsCropModalOpen(false)
    setMessages(prev => [...prev, { 
      role: 'ai', 
      text: "Give me a moment to read the image...", 
      timestamp: new Date(),
      isProcessing: true 
    }])
    setProcessingStatus('reading')
    setOcrProgress(0)

    try {
      // Create cropped canvas
      const canvas = document.createElement('canvas')
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height
      canvas.width = completedCrop.width * scaleX
      canvas.height = completedCrop.height * scaleY
      const ctx = canvas.getContext('2d')

      ctx.drawImage(
          imgRef.current,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY
      )

      const croppedImageData = canvas.toDataURL('image/jpeg')
      
      // Perform OCR
      const text = await performOCR(croppedImageData, (p) => setOcrProgress(p))
      
      // Remove the "Reading..." message and add user message
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isProcessing)
        return [...filtered, { 
          role: 'user', 
          text: input || "Please solve this problem from the image.", 
          image: croppedImageData,
          ocrText: text,
          timestamp: new Date() 
        }]
      })
      
      setProcessingStatus('solving')
      setInput('')
      
      // Solve Doubt
      const solution = await solveDoubt(input, { ocrText: text, history: messages })
      
      setMessages(prev => [...prev, { role: 'ai', text: solution, timestamp: new Date() }])
    } catch (err) {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isProcessing)
        return [...filtered, { 
          role: 'ai', 
          text: err.message || "Failed to process image. Please try again.", 
          isError: true,
          timestamp: new Date() 
        }]
      })
    } finally {
      setProcessingStatus('')
      setSelectedImage(null)
      setCompletedCrop(null)
    }
  }

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
        batchId: location.pathname.includes('batch/') ? location.pathname.split('/').pop() : null,
        history: messages.slice(-10)
      })

      const reply = typeof response === 'object' ? response.reply : response
      setMessages(prev => [...prev, { role: 'ai', text: reply, timestamp: new Date() }])
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

            {/* Crop Modal Overlay */}
            <AnimatePresence>
              {isCropModalOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[70] bg-black/95 flex flex-col p-4 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Crop className="w-4 h-4 text-white" />
                      <span className="text-xs font-bold text-white uppercase tracking-widest">Crop Problem</span>
                    </div>
                    <button onClick={() => setIsCropModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-auto rounded-3xl border border-white/10 custom-scrollbar flex items-center justify-center bg-white/5">
                    <ReactCrop 
                      crop={crop} 
                      onChange={c => setCrop(c)}
                      onComplete={c => setCompletedCrop(c)}
                    >
                      <img src={selectedImage} ref={imgRef} alt="Select" className="max-w-full" />
                    </ReactCrop>
                  </div>

                  <button 
                    onClick={handleCropComplete}
                    className="mt-4 w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Solve This Part
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

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
                          {msg.image && (
                            <div className="mb-3 rounded-xl overflow-hidden border border-black/10">
                              <img src={msg.image} alt="Doubt" className="w-full h-auto" />
                            </div>
                          )}
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {processingStatus === 'reading' && (
                    <div className="flex justify-start">
                      <div className="flex flex-col gap-2 bg-[var(--bg-app)] p-4 rounded-2xl border border-[var(--border-subtle)] w-[80%]">
                        <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                          <ImageIcon className="w-3 h-3 animate-pulse" />
                          {ocrProgress < 20 ? 'Loading OCR Engine...' : ocrProgress < 55 ? 'Downloading Language Data...' : 'Reading Problem...'} {ocrProgress}%
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-white"
                            initial={{ width: 0 }}
                            animate={{ width: `${ocrProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {loading && processingStatus !== 'reading' && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 items-center text-[var(--text-secondary)] text-xs bg-[var(--bg-app)] px-4 py-2 rounded-full border border-[var(--border-subtle)]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {processingStatus === 'solving' ? 'Solving doubt...' : 'Thinking...'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={onSelectFile}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl hover:bg-white/5 text-[var(--text-secondary)] flex items-center justify-center transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask or upload a doubt..."
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-2xl py-4 pl-12 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder:text-[var(--text-secondary)]/50"
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
                    Powered by IntelliX AI Engine
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

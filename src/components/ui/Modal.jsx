import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop, explicitly sized to avoid browser blur edge bugs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 w-screen h-screen bg-black/60 backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizes[size]} bg-dashboard-card text-dashboard-text border border-dashboard-border rounded-2xl overflow-hidden shadow-xl`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dashboard-border bg-dashboard-border-light/40">
              <h2 className="text-lg font-bold text-dashboard-text">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-dashboard-border-light text-dashboard-text-secondary hover:text-dashboard-text transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Body */}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal


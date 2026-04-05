import { Toaster } from 'react-hot-toast'

const Toast = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: {
        background: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '14px 20px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 20px 60px -12px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
      },
      success: {
        iconTheme: { primary: '#a855f7', secondary: '#fff' },
      },
      error: {
        iconTheme: { primary: '#ef4444', secondary: '#fff' },
        duration: 5000,
      },
    }}
  />
)

export default Toast

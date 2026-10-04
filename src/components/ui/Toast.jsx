import { Toaster } from 'react-hot-toast'

const Toast = () => (
  <Toaster
    position="bottom-center"
    toastOptions={{
      duration: 4000,
      style: {
        background: '#FFFFFF',
        color: '#111827',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '12px 18px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      },
      success: {
        iconTheme: { primary: '#22C55E', secondary: '#fff' },
      },
      error: {
        iconTheme: { primary: '#EF4444', secondary: '#fff' },
        duration: 5000,
      },
    }}
  />
)

export default Toast

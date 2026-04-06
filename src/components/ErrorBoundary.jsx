import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('IntelliX Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0B0B0F] text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-gray-400 max-w-md mb-8">
            The application encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Refresh IntelliX
          </button>
          {process.env.NODE_ENV === 'development' && (
             <div className="mt-8 p-4 bg-black/40 rounded-lg text-left overflow-auto max-w-2xl border border-white/5">
                <p className="text-red-400 text-xs font-mono">{this.state.error?.toString()}</p>
             </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

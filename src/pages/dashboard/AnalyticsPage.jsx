const AnalyticsPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">System Analytics</h1>
        <p className="text-[var(--text-secondary)] mt-1 font-medium">Comprehensive system-wide performance and engagement metrics</p>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-12 flex flex-col items-center justify-center h-96 shadow-sm">
        <div className="p-5 rounded-3xl bg-[var(--color-purple)]/5 mb-6">
          <svg className="w-12 h-12 text-[var(--color-purple)] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 012 2h2a2 2 0 012-2" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] font-bold text-lg">Analytics Engine Initializing</p>
        <p className="text-[var(--text-secondary)]/60 text-sm mt-1 max-w-xs text-center font-medium">We are currently processing your platform data to generate detailed insights.</p>
      </div>
    </div>
  )
}

export default AnalyticsPage

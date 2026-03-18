const LogsPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Audit Logs</h1>
        <p className="text-[var(--text-secondary)] mt-1 font-medium">Real-time security events and system activity logs</p>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-12 flex flex-col items-center justify-center h-96 shadow-sm overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden select-none">
          <div className="text-[8px] font-mono leading-tight whitespace-pre">
            {[...Array(50)].map((_, i) => (
              <div key={i}>[2024-03-12 14:02:{i.toString().padStart(2, '0')}] AUTH_SUCCESS: User ritik_admin logged in via Dashboard (IP: 192.168.1.{i})</div>
            ))}
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-[var(--color-purple)]/5 mb-6 relative z-10">
          <svg className="w-12 h-12 text-[var(--color-purple)] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] font-bold text-lg relative z-10">Security Ledger Active</p>
        <p className="text-[var(--text-secondary)]/60 text-sm mt-1 max-w-xs text-center font-medium relative z-10">Historical logs are stored securely and encrypted in our master audit vault.</p>
      </div>
    </div>
  )
}

export default LogsPage

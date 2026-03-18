const SettingsPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Platform Settings</h1>
        <p className="text-[var(--text-secondary)] mt-1 font-medium">Manage global platform configurations and preferences</p>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-12 flex flex-col items-center justify-center h-96 shadow-sm">
        <div className="p-5 rounded-3xl bg-[var(--color-purple)]/5 mb-6 transition-transform hover:rotate-45">
          <svg className="w-12 h-12 text-[var(--color-purple)] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] font-bold text-lg">Control Center Syncing</p>
        <p className="text-[var(--text-secondary)]/60 text-sm mt-1 max-w-xs text-center font-medium">Fine-tune your IntelliX instance with advanced configuration tools.</p>
      </div>
    </div>
  )
}

export default SettingsPage

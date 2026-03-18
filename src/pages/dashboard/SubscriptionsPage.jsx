const SubscriptionsPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Subscriptions</h1>
        <p className="text-[var(--text-secondary)] mt-1 font-medium">Manage your institution's subscription plan and billing</p>
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-12 flex flex-col items-center justify-center h-96 shadow-sm overflow-hidden relative">
        <div className="p-5 rounded-3xl bg-[var(--color-purple)]/5 mb-6">
          <svg className="w-12 h-12 text-[var(--color-purple)] opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] font-bold text-lg">Billing System Initialized</p>
        <p className="text-[var(--text-secondary)]/60 text-sm mt-1 max-w-xs text-center font-medium">Subscription management features are being prepared for your account.</p>
      </div>
    </div>
  )
}

export default SubscriptionsPage

const FormField = ({ label, error, children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">{label}</label>
    )}
    {children}
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
)

export const Input = ({ label, error, className = '', ...props }) => (
  <FormField label={label} error={error}>
    <input
      className={`w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 outline-none focus:border-[var(--color-purple)] focus:bg-[var(--bg-surface)] transition-all ${error ? 'border-red-500/50' : ''} ${className}`}
      {...props}
    />
  </FormField>
)

export const Select = ({ label, error, options = [], placeholder, className = '', ...props }) => (
  <FormField label={label} error={error}>
    <div className="relative">
      <select
        className={`w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--color-purple)] focus:bg-[var(--bg-surface)] transition-all appearance-none cursor-pointer ${error ? 'border-red-500/50' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </FormField>
)

export default FormField

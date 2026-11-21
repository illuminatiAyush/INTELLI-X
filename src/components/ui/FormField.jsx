const FormField = ({ label, error, children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold mb-1.5 uppercase tracking-wider text-dashboard-text-secondary">
        {label}
      </label>
    )}
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

export const Input = ({ label, error, className = '', ...props }) => (
  <FormField label={label} error={error}>
    <input
      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-dashboard-card text-dashboard-text placeholder-dashboard-text-muted ${
        error ? 'border-red-500/50 focus:border-red-500' : 'border-dashboard-border focus:border-dashboard-primary'
      } ${className}`}
      {...props}
    />
  </FormField>
)

export const Select = ({ label, error, options = [], placeholder, className = '', ...props }) => (
  <FormField label={label} error={error}>
    <div className="relative">
      <select
        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all appearance-none cursor-pointer bg-dashboard-card text-dashboard-text ${
          error ? 'border-red-500/50 focus:border-red-500' : 'border-dashboard-border focus:border-dashboard-primary'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="" className="bg-dashboard-card text-dashboard-text">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-dashboard-card text-dashboard-text">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-dashboard-text-muted">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </FormField>
)

export default FormField

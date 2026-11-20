import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, FileText, ClipboardCheck, BarChart3 } from 'lucide-react'

const defaultPrefs = [
  { id: 'test', label: 'Test Alerts', description: 'Get notified about upcoming tests', icon: FileText, enabled: true },
  { id: 'result', label: 'Result Alerts', description: 'Get notified when results are published', icon: BarChart3, enabled: true },
  { id: 'attendance', label: 'Attendance Alerts', description: 'Get notified about attendance updates', icon: ClipboardCheck, enabled: false },
]

const Toggle = ({ enabled, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${ enabled ? 'bg-white' : 'bg-[var(--border-strong)]'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition-transform duration-200 ease-in-out ${ enabled ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
)

const Notifications = () => {
  const [prefs, setPrefs] = useState(defaultPrefs)

  const toggle = (id) => {
    setPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl border border-sky-200/60 dark:border-sky-900/40 bg-gradient-to-br from-white via-white to-sky-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-sky-950/20 p-6 shadow-xs"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
          <Bell className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
      </div>

      <div className="space-y-4">
        {prefs.map((pref) => (
          <div
            key={pref.id}
            className="flex items-center justify-between px-4 py-3 rounded-xl border border-sky-200/50 dark:border-sky-900/30 bg-sky-50/30 dark:bg-sky-950/20 hover:border-sky-300 dark:hover:border-sky-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <pref.icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{pref.label}</p>
                <p className="text-xs text-gray-600">{pref.description}</p>
              </div>
            </div>
            <Toggle enabled={pref.enabled} onToggle={() => toggle(pref.id)} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default Notifications


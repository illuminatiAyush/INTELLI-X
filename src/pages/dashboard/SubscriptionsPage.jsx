import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Building2, Users, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import StatsCard from '../../components/ui/StatsCard'

const SubscriptionsPage = () => {
  const { isDark } = useTheme()
  const [institutes, setInstitutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInstitutes()
  }, [])

  const fetchInstitutes = async () => {
    try {
      const { data: instList } = await supabase
        .from('institutes')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch user counts per institute
      const enriched = await Promise.all(
        (instList || []).map(async inst => {
          const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('institute_id', inst.id)
          return { ...inst, userCount: count || 0 }
        })
      )

      setInstitutes(enriched)
    } catch (err) {
      console.error('Subscriptions error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--color-purple)]/30 border-t-[var(--color-purple)] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          Subscriptions
        </motion.h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1 font-medium">
          Manage institute subscriptions and billing
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Institutes" value={institutes.length} icon={Building2} color="purple" />
        <StatsCard title="Total Users" value={institutes.reduce((s, i) => s + i.userCount, 0)} icon={Users} color="blue" />
        <StatsCard title="Plan" value="Free Tier" icon={CreditCard} color="green" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-[var(--color-purple)]/10 text-[var(--color-purple)]">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Registered Institutes</h2>
        </div>

        {institutes.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-sm py-4 text-center">No institutes registered yet</p>
        ) : (
          <div className="space-y-3">
            {institutes.map(inst => (
              <div
                key={inst.id}
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {inst.name?.charAt(0)?.toUpperCase() || 'I'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-purple)] transition-colors">
                      {inst.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                      {inst.owner_name || 'No owner'} • {inst.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    <span className="font-semibold text-[var(--text-primary)]">{inst.userCount}</span>
                    <span className="text-[var(--text-secondary)]">users</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Since {new Date(inst.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-sm font-medium text-amber-500">💡 Payment integration coming soon</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Stripe-based subscription management will be available in a future update.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default SubscriptionsPage

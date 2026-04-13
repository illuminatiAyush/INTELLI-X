import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Building2, Users, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import StatsCard from '../../components/ui/StatsCard'
import { useAppQuery } from '../../hooks/useAppQuery'
import { DashboardSkeleton, CardSkeleton } from '../../components/ui/Skeletons'

const SubscriptionsPage = () => {
  const { isDark } = useTheme()
  const { data: subscriptionsData, loading: subscriptionsLoading } = useAppQuery('admin-subscriptions', async () => {
    const { data: instList } = await supabase.from('institutes').select('id, name, owner_name, email, created_at').order('created_at', { ascending: false })
    // Fetch user counts per institute
    const enriched = await Promise.all(
      (instList || []).map(async inst => {
        const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('institute_id', inst.id)
        return { ...inst, userCount: count || 0 }
      })
    )
    return enriched
  })

  const loading = subscriptionsLoading && !subscriptionsData
  const institutes = subscriptionsData || []


  if (loading) return <DashboardSkeleton />

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
        <StatsCard title="Total Institutes" value={institutes.length} icon={Building2} color="white" />
        <StatsCard title="Total Users" value={institutes.reduce((s, i) => s + i.userCount, 0)} icon={Users} color="white" />
        <StatsCard title="Plan" value="Free Tier" icon={CreditCard} color="green" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isDark ? 'bg-white/10 text-white' : 'bg-slate-800 text-white'}`}>
                    {inst.name?.charAt(0)?.toUpperCase() || 'I'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] transition-colors">
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

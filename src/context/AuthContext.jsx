import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(() => localStorage.getItem('ix_user_role'))
  const [profile, setProfile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      if (error) {
        console.error('Fetch profile database error:', error)
        throw error
      }
      
      if (data) {
        console.log('✅ Profile fetched successfully:', {
          id: data.id,
          role: data.role,
          institute_id: data.institute_id,
          full_data: data
        })
        setProfile(data)
        setRole(data.role)
        localStorage.setItem('ix_user_role', data.role)
      } else {
        console.warn('❌ PROFILE MISSING: User ID:', userId, '. Please run the SQL sync script.')
      }
    } catch (err) {
      console.error('Profile fetch failed:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const syncUser = async (u) => {
      if (!u) {
        setUser(null)
        setRole(null)
        setProfile(null)
        localStorage.removeItem('ix_user_role')
        setLoading(false)
        return
      }

      setUser(u)
      const meta = u.user_metadata
      
      // Fast Path: Role exists in metadata (synced via trigger)
      if (meta?.role) {
        setRole(meta.role)
        localStorage.setItem('ix_user_role', meta.role)
        setLoading(false)
        setIsInitialized(true)
        // Background sync to ensure local state is fresh
        fetchProfile(u.id)
      } else {
        // Slow Path: Need to fetch from DB
        await fetchProfile(u.id)
        setIsInitialized(true)
      }
    }

    // Single initialization flow
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) syncUser(session?.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      if (event === 'SIGNED_OUT') {
        syncUser(null)
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        syncUser(session?.user)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const logOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('ix_user_role')
  }

  // Expose a manual refresh for components that update the profile
  const refreshProfile = async () => {
    if (user?.id) await fetchProfile(user.id)
  }

  // ── Realtime subscription for profile changes ────────────────────────
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('profile-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new)
            if (payload.new.role) {
              setRole(payload.new.role)
              localStorage.setItem('ix_user_role', payload.new.role)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  return (
    <AuthContext.Provider value={{ user, role, profile, loading: !isInitialized && loading, logOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}

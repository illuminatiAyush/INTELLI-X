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
        .single()
      
      if (error) throw error
      
      if (data) {
        setProfile(data)
        setRole(data.role)
        localStorage.setItem('ix_user_role', data.role)
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

  return (
    <AuthContext.Provider value={{ user, role, profile, loading: !isInitialized && loading, logOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}

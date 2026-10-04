import { useState, useEffect, useCallback, useRef } from 'react'

// Simple in-memory global cache
const globalCache = {}
const lastFetched = {}

// Default stale time: 30 seconds
const DEFAULT_STALE_TIME = 30000 

export const useAppQuery = (key, fetchFn, options = {}) => {
  const { 
    staleTime = DEFAULT_STALE_TIME, 
    enabled = true,
    onSuccess = null 
  } = options

  const [data, setData] = useState(globalCache[key] || null)
  const [loading, setLoading] = useState(!globalCache[key])
  const [error, setError] = useState(null)
  
  // Prevent effect loops if fetchFn is not memoized
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  const fetchData = useCallback(async (force = false) => {
    if (!key) return

    const now = Date.now()
    const isStale = force || !lastFetched[key] || (now - lastFetched[key] > staleTime)

    // Skip if data exists and is not stale
    if (!isStale && globalCache[key]) {
      setLoading(false)
      return
    }

    if (!globalCache[key]) {
      setLoading(true)
    }

    try {
      const result = await fetchFnRef.current()
      globalCache[key] = result
      lastFetched[key] = Date.now()
      setData(result)
      setError(null)
      if (onSuccess) onSuccess(result)
    } catch (err) {
      console.error(`Error fetching ${key}:`, err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [key, staleTime, onSuccess])

  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [key, enabled, fetchData])

  const refetch = useCallback(() => fetchData(true), [fetchData])

  return { data, loading, error, refetch, isStale: !lastFetched[key] || (Date.now() - lastFetched[key] > staleTime) }
}

// Helper to clear cache if needed
export const clearAppCache = (key) => {
  if (key) {
    delete globalCache[key]
    delete lastFetched[key]
  } else {
    Object.keys(globalCache).forEach(k => delete globalCache[k])
    Object.keys(lastFetched).forEach(k => delete lastFetched[k])
  }
}

// Preload helper
export const preloadQuery = async (key, fetchFn) => {
  if (globalCache[key]) return
  try {
    const result = await fetchFn()
    globalCache[key] = result
    lastFetched[key] = Date.now()
  } catch (err) {
    console.error(`Preload error for ${key}:`, err)
  }
}

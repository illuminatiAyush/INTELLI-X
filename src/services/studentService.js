import { supabase } from '../lib/supabase'

const studentIdCache = new Map()

/**
 * Resolves the internal student ID (integer) from a profile ID (Auth UUID).
 * Uses in-memory caching to optimize performance.
 */
export const getStudentIdByProfile = async (profileId) => {
  if (!profileId) return null
  if (studentIdCache.has(profileId)) return studentIdCache.get(profileId)

  const { data, error } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', profileId)
    .single()

  if (error || !data) return null
  
  studentIdCache.set(profileId, data.id)
  return data.id
}


export const getStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*, batch_students(batches(name))')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getStudentsByBatch = async (batchId) => {
  const { data, error } = await supabase
    .from('batch_students')
    .select('students(*)')
    .eq('batch_id', batchId)
  if (error) throw error
  return data.map(d => d.students).filter(Boolean).sort((a,b) => a.name.localeCompare(b.name))
}

export const createStudent = async (student) => {
  if (!student.email || !student.password) {
    throw new Error("Email and password are required for login access.")
  }

  // 1. Explicitly check for valid session before invocation
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Your session has expired. Please log out and back in to add students.")
  }

  const { data, error } = await supabase.functions.invoke('create-user', {
    body: {
      email: student.email,
      password: student.password,
      role: 'student',
      name: student.name,
      phone: student.phone
    }
  })
  
  if (error) {
    if (error.message?.includes('Invalid JWT') || error.message?.includes('Unauthorized')) {
      throw new Error("Authentication failed: Your session is invalid. Please refresh the page or re-login.")
    }
    throw new Error(error.message)
  }

  if (data?.error) throw new Error(data.error)
  
  return data
}

export const updateStudent = async (id, updates) => {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteStudent = async (id) => {
  // 1. Get the profile_id from the student record
  const { data: student } = await supabase
    .from('students')
    .select('profile_id')
    .eq('id', id)
    .single()

  if (student?.profile_id) {
    // 2. Delete from profiles. This triggers:
    //    a) Cascade delete of the student record (via DB constraint)
    //    b) Auto-deletion of the Auth user (via handle_profile_delete trigger)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', student.profile_id)
    
    if (error) throw error
  } else {
    // Fallback to direct student deletion if profile_id missing
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) throw error
  }
}

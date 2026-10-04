import { supabase } from '../lib/supabase'

/**
 * Fetch the teacher record for the logged-in user.
 * @param {string} profileId – the auth user's id (matches profiles.id)
 */
export const fetchTeacherRecord = async (profileId) => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('profile_id', profileId)
    .single()
  if (error) throw error
  return data
}

/**
 * Fetch batches assigned to a teacher.
 * @param {string} teacherId – the teacher row's profile_id (batches.teacher_id references auth user id)
 */
export const fetchTeacherBatches = async (teacherId) => {
  const { data, error } = await supabase
    .from('batches')
    .select('id, name, subject')
    .eq('teacher_id', teacherId)
    .order('name')
  if (error) throw error
  return data || []
}

/**
 * Update teacher profile across both tables.
 * @param {string} teacherRowId – the teachers table row id
 * @param {string} profileId   – the profiles table row id (= auth user id)
 * @param {{ name?: string, subject?: string, experience?: number, phone?: string }} updates
 */
export const updateTeacherProfile = async (teacherRowId, profileId, updates) => {
  const { name, ...teacherFields } = updates

  // Update profiles table (name)
  if (name !== undefined) {
    const parts = name.trim().split(/\s+/)
    const first_name = parts[0] || ''
    const last_name = parts.slice(1).join(' ') || ''

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ first_name, last_name, full_name: name.trim() })
      .eq('id', profileId)
    if (profileError) throw profileError
  }

  // Update teachers table (subject, experience, phone)
  if (Object.keys(teacherFields).length > 0) {
    // Also sync name on the teachers table if it has a name column
    const teacherUpdate = { ...teacherFields }
    if (name !== undefined) teacherUpdate.name = name.trim()

    const { error: teacherError } = await supabase
      .from('teachers')
      .update(teacherUpdate)
      .eq('id', teacherRowId)
    if (teacherError) throw teacherError
  }

  return true
}

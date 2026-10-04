import { supabase } from '../lib/supabase'

export const getTeachers = async () => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*, profiles:profile_id(first_name, last_name, avatar_url)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getTeachersByInstitute = async (instituteId) => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*, profiles:profile_id(first_name, last_name, avatar_url)')
    .eq('institute_id', instituteId)
    .order('name')
  if (error) throw error
  return data
}

export const createTeacher = async (teacher) => {
  const { data, error } = await supabase
    .from('teachers')
    .insert(teacher)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateTeacher = async (id, updates) => {
  const { data, error } = await supabase
    .from('teachers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteTeacher = async (id) => {
  // 1. Get the profile_id from the teacher record
  const { data: teacher } = await supabase
    .from('teachers')
    .select('profile_id')
    .eq('id', id)
    .single()

  if (teacher?.profile_id) {
    // 2. Delete from profiles. This triggers:
    //    a) Cascade delete of the teacher record (via DB constraint)
    //    b) Auto-deletion of the Auth user (via handle_profile_delete trigger)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', teacher.profile_id)
    
    if (error) throw error
  } else {
    // Fallback to direct teacher deletion if profile_id missing
    const { error } = await supabase.from('teachers').delete().eq('id', id)
    if (error) throw error
  }
}

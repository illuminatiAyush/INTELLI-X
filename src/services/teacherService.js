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
  const { error } = await supabase.from('teachers').delete().eq('id', id)
  if (error) throw error
}

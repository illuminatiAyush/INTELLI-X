import { supabase } from '../lib/supabase'

export const getStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*, batches(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getStudentsByBatch = async (batchId) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('batch_id', batchId)
    .order('name')
  if (error) throw error
  return data
}

export const createStudent = async (student) => {
  const { data, error } = await supabase
    .from('students')
    .insert(student)
    .select()
    .single()
  if (error) throw error
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
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw error
}

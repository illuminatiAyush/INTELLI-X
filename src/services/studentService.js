import { supabase } from '../lib/supabase'

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
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: {
      email: student.email,
      password: student.password,
      role: 'student',
      name: student.name,
      phone: student.phone
    }
  })
  
  if (error) throw new Error(error.message)
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
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw error
}

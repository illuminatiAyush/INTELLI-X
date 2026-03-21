import { supabase } from '../lib/supabase'

export const getAttendanceByBatchAndDate = async (batchId, date) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, students(name)')
    .eq('batch_id', batchId)
    .eq('date', date)
  if (error) throw error
  return data
}

export const getAttendanceByStudent = async (studentId) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export const upsertAttendance = async (records) => {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'student_id,batch_id,date' })
    .select()
  if (error) throw error
  return data
}

export const getAttendanceStats = async (batchId) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('status')
    .eq('batch_id', batchId)
  if (error) throw error
  const total = data.length
  const present = data.filter((r) => r.status === 'present').length
  return { total, present, absent: total - present, rate: total ? ((present / total) * 100).toFixed(1) : 0 }
}

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

export const getStudentAttendanceForBatch = async (studentId, batchId) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('date, status')
    .eq('student_id', studentId)
    .eq('batch_id', batchId)
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
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

export const getAttendanceByLecture = async (lectureId) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, students:student_id(name)')
    .eq('lecture_id', lectureId)
  if (error) throw error
  return data
}

export const upsertLectureAttendance = async (records) => {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'lecture_id,student_id' })
    .select()
  if (error) throw error
  return data
}

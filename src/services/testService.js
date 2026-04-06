import { supabase } from '../lib/supabase'

export const getTests = async () => {
  const { data, error } = await supabase
    .from('tests')
    .select('*, batches(name)')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export const getTestsByBatch = async (batchId) => {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('batch_id', batchId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export const createTest = async (test) => {
  const { data, error } = await supabase
    .from('tests')
    .insert(test)
    .select()
    .single()
  if (error) throw error

  // Notify all students in this batch
  if (data && data.batch_id) {
    try {
      const { data: batchStudents } = await supabase
        .from('batch_students')
        .select('student_id, students(profile_id)')
        .eq('batch_id', data.batch_id)

      if (batchStudents && batchStudents.length > 0) {
        const notifications = batchStudents
          .filter(bs => bs.students?.profile_id)
          .map(bs => ({
            user_id: bs.students.profile_id,
            title: 'New Test Assigned',
            message: `A new test "${data.title}" has been created for your class.`,
            type: 'test',
            institute_id: data.institute_id,
          }))
          
        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications)
        }
      }
    } catch (notifyError) {
      console.error('Failed to send test notifications:', notifyError)
    }
  }

  return data
}

export const updateTest = async (id, updates) => {
  const { data, error } = await supabase
    .from('tests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteTest = async (id) => {
  const { error } = await supabase.from('tests').delete().eq('id', id)
  if (error) throw error
}

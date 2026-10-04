import { supabase } from '../lib/supabase'

export const getResultsByTest = async (testId) => {
  const { data, error } = await supabase
    .from('results')
    .select('*, students(name, email), tests(total_marks)')
    .eq('test_id', testId)
    .order('marks', { ascending: false })
  if (error) throw error
  return data
}

export const getResultsByStudent = async (studentId) => {
  const { data, error } = await supabase
    .from('results')
    .select('*, tests(title, total_marks, date)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const upsertResults = async (results) => {
  const { data, error } = await supabase
    .from('results')
    .upsert(results, { onConflict: 'student_id,test_id' })
    .select('*, tests(title)')
  
  if (error) throw error

  // Notify students whose results were updated
  if (results && results.length > 0) {
    try {
      const testId = results[0].test_id
      const { data: testData } = await supabase.from('tests').select('title, institute_id').eq('id', testId).single()
      
      const notifications = results.map(r => ({
        user_id: r.student_id,
        title: 'Results Published',
        message: `Your results for "${testData?.title || 'Test'}" are now available.`,
        type: 'result',
        institute_id: testData?.institute_id
      }))

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications)
      }
    } catch (notifyErr) {
      console.error('Failed to send result notifications:', notifyErr)
    }
  }

  return data
}

// PART 1, 2, 3: Fetch Data for Leaderboard Across All Roles
export const getTestLeaderboard = async (testId) => {
  if (!testId) return []
  
  const { data, error } = await supabase
    .from('results')
    .select(`
      student_id, 
      marks, 
      students!inner(name, email), 
      tests!inner(total_marks)
    `)
    .eq('test_id', testId)
    .order('marks', { ascending: false })
  
  if (error) throw error

  // PART 4: RANK CALCULATION
  return (data || []).map((r, i) => ({
    student_id: r.student_id,
    name: r.students?.name || 'Unknown',
    email: r.students?.email,
    marks: r.marks,
    total_marks: r.tests?.total_marks || 100,
    percentage: r.tests?.total_marks ? ((r.marks / r.tests.total_marks) * 100).toFixed(1) : 0,
    rank: i + 1
  }))
}

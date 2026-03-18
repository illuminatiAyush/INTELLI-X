import { supabase } from '../lib/supabase'

export const getResultsByTest = async (testId) => {
  const { data, error } = await supabase
    .from('results')
    .select('*, students(name)')
    .eq('test_id', testId)
    .order('rank', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data
}

export const getResultsByStudent = async (studentId) => {
  const { data, error } = await supabase
    .from('results')
    .select('*, tests(title, total_marks, date, batches(name))')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const upsertResults = async (results) => {
  const { data, error } = await supabase
    .from('results')
    .upsert(results, { onConflict: 'student_id,test_id' })
    .select()
  if (error) throw error
  return data
}

export const getLeaderboard = async (batchId) => {
  const { data, error } = await supabase
    .from('results')
    .select('student_id, marks, students(name, batch_id), tests(total_marks, batch_id)')
    .order('marks', { ascending: false })
  if (error) throw error

  // Aggregate by student
  const map = {}
  data.forEach((r) => {
    const sid = r.student_id
    const studentBatch = r.students?.batch_id
    if (batchId && studentBatch !== batchId) return
    if (!map[sid]) {
      map[sid] = { student_id: sid, name: r.students?.name || 'Unknown', totalMarks: 0, totalPossible: 0, testCount: 0 }
    }
    map[sid].totalMarks += r.marks
    map[sid].totalPossible += r.tests?.total_marks || 100
    map[sid].testCount += 1
  })

  return Object.values(map)
    .map((s) => ({ ...s, percentage: s.totalPossible ? ((s.totalMarks / s.totalPossible) * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.percentage - a.percentage)
    .map((s, i) => ({ ...s, rank: i + 1 }))
}

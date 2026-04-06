import { supabase } from '../lib/supabase'

// ── Helper: get the student row for the logged-in user ─────────────────
const getStudentRecord = async (userId) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('profile_id', userId)
  if (error) throw error
  return data?.[0] || null
}

// ── Service functions ──────────────────────────────────────────────────

/**
 * Fetch profile information for a user.
 */
export const fetchProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.error('fetchProfile error:', err.message)
    return null
  }
}

/**
 * Fetch academic stats for a student (real Supabase data).
 * Returns { attendance, avgScore, rank }
 */
export const fetchStudentStats = async (userId) => {
  try {
    const student = await getStudentRecord(userId)
    if (!student) return { attendance: 0, avgScore: 0, rank: '-' }

    // Attendance
    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', student.id)
    const totalA = attendance?.length || 0
    const presentA = attendance?.filter((a) => a.status === 'present').length || 0
    const attendanceRate = totalA ? Number(((presentA / totalA) * 100).toFixed(1)) : 0

    // Results
    const { data: results } = await supabase
      .from('results')
      .select('marks, rank, tests(total_marks)')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    const resultList = results || []
    const totalMarks = resultList.reduce((s, r) => s + (r.marks || 0), 0)
    const totalPossible = resultList.reduce((s, r) => s + (r.tests?.total_marks || 100), 0)
    const avgScore = totalPossible ? Number(((totalMarks / totalPossible) * 100).toFixed(1)) : 0
    const rank = resultList[0]?.rank || '-'

    return { attendance: attendanceRate, avgScore, rank }
  } catch (err) {
    console.error('fetchStudentStats error:', err.message)
    return { attendance: 0, avgScore: 0, rank: '-' }
  }
}

/**
 * Fetch last 5 test scores for the performance chart (real Supabase data).
 * Returns { labels: string[], scores: number[] }
 */
export const fetchTestScores = async (userId) => {
  try {
    const student = await getStudentRecord(userId)
    if (!student) return { labels: [], scores: [] }

    const { data: results } = await supabase
      .from('results')
      .select('marks, tests(title, total_marks, date)')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const items = (results || []).reverse() // oldest first for chart
    const labels = items.map((r) => r.tests?.title || 'Test')
    const scores = items.map((r) => {
      const total = r.tests?.total_marks || 100
      return Number(((r.marks / total) * 100).toFixed(1))
    })

    return { labels, scores }
  } catch (err) {
    console.error('fetchTestScores error:', err.message)
    return { labels: [], scores: [] }
  }
}

/**
 * Fetch subject-level performance for strength/weakness (real Supabase data).
 * Aggregates scores per batch subject, returns { strong, weak }.
 */
export const fetchSubjectPerformance = async (userId) => {
  try {
    const student = await getStudentRecord(userId)
    if (!student) return { strong: null, weak: null }

    const { data: results } = await supabase
      .from('results')
      .select('marks, tests(total_marks, batch_id, batches(name, subject))')
      .eq('student_id', student.id)

    if (!results || results.length === 0) return { strong: null, weak: null }

    // Group by subject
    const subjectMap = {}
    for (const r of results) {
      const subject = r.tests?.batches?.subject || r.tests?.batches?.name || 'Unknown'
      if (!subjectMap[subject]) subjectMap[subject] = { total: 0, possible: 0 }
      subjectMap[subject].total += r.marks || 0
      subjectMap[subject].possible += r.tests?.total_marks || 100
    }

    const subjects = Object.entries(subjectMap).map(([name, v]) => ({
      name,
      avg: v.possible ? Number(((v.total / v.possible) * 100).toFixed(1)) : 0,
    }))

    if (subjects.length === 0) return { strong: null, weak: null }

    subjects.sort((a, b) => b.avg - a.avg)
    return {
      strong: subjects[0],
      weak: subjects[subjects.length - 1],
    }
  } catch (err) {
    console.error('fetchSubjectPerformance error:', err.message)
    return { strong: null, weak: null }
  }
}

/**
 * Fetch batches the student is enrolled in (real Supabase data).
 * Returns array of { id, name, subject }
 */
export const fetchStudentBatches = async (userId) => {
  try {
    const student = await getStudentRecord(userId)
    if (!student) return []

    const { data, error } = await supabase
      .from('batch_students')
      .select('batches(id, name, subject)')
      .eq('student_id', student.id)

    if (error) throw error
    return (data || []).map((d) => d.batches).filter(Boolean)
  } catch (err) {
    console.error('fetchStudentBatches error:', err.message)
    return []
  }
}

/**
 * Change the user's password via Supabase Auth.
 * @param {string} newPassword
 */
export const changePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
  return data
}

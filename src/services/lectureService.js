import { supabase } from '../lib/supabase'

export const fetchLectures = async (filters = {}) => {
  let query = supabase
    .from('lecture_sessions')
    .select('id, title, status, batch_id, teacher_profile_id, created_by, scheduled_at, start_time, end_time, institute_id, batches(name)')
    .order('id', { ascending: false })

  if (filters.batch_ids?.length) query = query.in('batch_id', filters.batch_ids)
  if (filters.teacher_profile_id) query = query.eq('teacher_profile_id', filters.teacher_profile_id)

  const { data, error } = await query
  if (error) {
    console.error('fetchLectures error:', error)
    throw error
  }
  console.log('Lectures fetched:', data?.length, data)
  return data || []
}

export const fetchLectureById = async (id) => {
  const { data, error } = await supabase
    .from('lecture_sessions')
    .select('id, title, status, batch_id, teacher_profile_id, created_by, scheduled_at, start_time, end_time, institute_id, batches(name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createLecture = async (lectureData) => {
  console.log('Creating lecture with payload:', lectureData)

  // 1. Check for existing live lecture in the batch
  if (lectureData.status === 'live') {
    const { data: existingLive } = await supabase
      .from('lecture_sessions')
      .select('id')
      .eq('batch_id', lectureData.batch_id)
      .eq('status', 'live')
      .maybeSingle()
    
    if (existingLive) {
      throw new Error('A live lecture is already running for this batch.')
    }
  }

  const safePayload = {
    title: lectureData.title,
    batch_id: lectureData.batch_id,
    status: lectureData.status,
    created_by: lectureData.created_by,
    institute_id: lectureData.institute_id,
    ...(lectureData.teacher_profile_id && { teacher_profile_id: lectureData.teacher_profile_id }),
    ...(lectureData.scheduled_at && { scheduled_at: lectureData.scheduled_at }),
  }

  console.log('Safe payload:', safePayload)

  console.log('Safe payload:', safePayload)

  const { data, error } = await supabase
    .from('lecture_sessions')
    .insert([safePayload])
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    throw new Error(error.message)
  }

  console.log('Lecture created:', data)

  // 3. Generate Notifications (fire-and-forget)
  // Fire-and-forget notifications (safe)
  notifyLectureCreated(data).catch?.(console.error)

  return data
}

export const updateLectureStatus = async (id, status) => {
  const updateData = { status }

  const { data, error } = await supabase
    .from('lecture_sessions')
    .update(updateData)
    .eq('id', id)
    .select('*, batches(name)')
    .single()

  if (error) throw error

  // Notify students when lecture goes live
  if (status === 'live' && data) {
    notifyLectureLive(data).catch?.(console.error)
  }

  return data
}

const notifyLectureCreated = async (lecture) => {
  try {
    const { data: batchStudents } = await supabase
      .from('batch_students')
      .select('student_id')
      .eq('batch_id', lecture.batch_id)

    if (!batchStudents?.length) return

    // Try minimal notification — only guaranteed columns
    const notifications = batchStudents.map(s => ({
      user_id: s.student_id,
      title: '📅 New Lecture Scheduled',
      message: `"${lecture.title}" has been scheduled.`,
    }))

    const { error } = await supabase.from('notifications').insert(notifications)
    if (error) console.error('Notification insert error:', error)
  } catch (err) {
    console.error('Failed to generate lecture notifications:', err)
  }
}

export const notifyLectureLive = async (lecture) => {
  try {
    const { data: batchStudents } = await supabase
      .from('batch_students')
      .select('student_id')
      .eq('batch_id', lecture.batch_id)

    if (!batchStudents?.length) return

    const notifications = batchStudents.map(s => ({
      user_id: s.student_id,
      title: '🔴 Lecture is Live Now!',
      message: `"${lecture.title}" has started. Join now!`,
    }))

    const { error } = await supabase.from('notifications').insert(notifications)
    if (error) console.error('Live notification error:', error)
  } catch (err) {
    console.error('Failed to send live notifications:', err)
  }
}

import { supabase } from '../lib/supabase'

export const fetchLectures = async (filters = {}) => {
  let query = supabase
    .from('lecture_sessions')
    .select('*, batches(name), profiles:teacher_profile_id(name)')
    .order('created_at', { ascending: false })

  if (filters.institute_id) query = query.eq('institute_id', filters.institute_id)
  if (filters.batch_id) query = query.eq('batch_id', filters.batch_id)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.teacher_profile_id) query = query.eq('teacher_profile_id', filters.teacher_profile_id)

  const { data, error } = await query
  if (error) throw error
  return data
}

export const fetchLectureById = async (id) => {
  const { data, error } = await supabase
    .from('lecture_sessions')
    .select('*, batches(name), profiles:teacher_profile_id(name)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export const createLecture = async (lectureData) => {
  // 1. Check for existing live lecture in the batch
  if (lectureData.status === 'live') {
    const { data: existingLive } = await supabase
      .from('lecture_sessions')
      .select('id')
      .eq('batch_id', lectureData.batch_id)
      .eq('status', 'live')
      .maybeSingle()
    
    if (existingLive) {
      throw new Error('A live lecture is already running for this batch. End it before starting a new one.')
    }
  }

  // 2. Insert the lecture
  const { data, error } = await supabase
    .from('lecture_sessions')
    .insert([lectureData])
    .select()
    .single()

  if (error) throw error

  // 3. Generate Notifications (fire-and-forget for speed)
  notifyLectureCreated(data).catch(console.error)

  return data
}

export const updateLectureStatus = async (id, status) => {
  const updateData = { status }
  
  if (status === 'live') {
    updateData.start_time = new Date().toISOString()
  } else if (status === 'completed' || status === 'cancelled') {
    updateData.end_time = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('lecture_sessions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

const notifyLectureCreated = async (lecture) => {
  try {
    // 1. Get batch students
    const { data: students } = await supabase
      .from('batch_students')
      .select('student_id')
      .eq('batch_id', lecture.batch_id)

    if (!students || students.length === 0) return

    // 2. Prepare notifications array
    const notifications = students.map(s => ({
      user_id: s.student_id,
      title: 'New Lecture Scheduled',
      message: `A new lecture "${lecture.title}" has been scheduled.`,
      type: 'lecture_scheduled',
      metadata: { lecture_id: lecture.id, batch_id: lecture.batch_id }
    }))

    // Add teacher to notifications if assigned
    if (lecture.teacher_profile_id) {
      notifications.push({
        user_id: lecture.teacher_profile_id,
        title: 'Assigned to Lecture',
        message: `You have been assigned to teach "${lecture.title}".`,
        type: 'lecture_assigned',
        metadata: { lecture_id: lecture.id, batch_id: lecture.batch_id }
      })
    }

    // 3. Insert notifications
    await supabase.from('notifications').insert(notifications)
  } catch (err) {
    console.error("Failed to generate lecture notifications:", err)
  }
}

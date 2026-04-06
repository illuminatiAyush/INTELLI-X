import { supabase } from '../lib/supabase'

export const getMaterials = async (batchIdOrIds) => {
  let query = supabase
    .from('materials')
    .select('*, batches(name), profiles:uploaded_by(first_name, last_name)')
    .order('created_at', { ascending: false })
  
  if (batchIdOrIds) {
    if (Array.isArray(batchIdOrIds)) {
      if (batchIdOrIds.length === 0) return []
      query = query.in('batch_id', batchIdOrIds)
    } else {
      query = query.eq('batch_id', batchIdOrIds)
    }
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

export const uploadMaterial = async (file, batchId, title, userId) => {
  const filePath = `${userId}/${Date.now()}_${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('materials')
    .upload(filePath, file)
  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('materials')
    .getPublicUrl(filePath)

  const { data, error } = await supabase
    .from('materials')
    .insert({
      title,
      file_url: urlData.publicUrl,
      batch_id: batchId,
      uploaded_by: userId,
    })
    .select()
    .single()
  if (error) throw error

  // Notify all students in this batch
  if (data && batchId) {
    try {
      const { data: batchStudents } = await supabase
        .from('batch_students')
        .select('student_id, students(profile_id)')
        .eq('batch_id', batchId)

      if (batchStudents && batchStudents.length > 0) {
        const notifications = batchStudents
          .filter(bs => bs.students?.profile_id)
          .map(bs => ({
            user_id: bs.students.profile_id,
            title: 'New Material Uploaded',
            message: `New study material "${title}" is available for your class.`,
          }))
          
        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications)
        }
      }
    } catch (notifyError) {
      console.error('Failed to send material notifications:', notifyError)
    }
  }

  return data
}

export const deleteMaterial = async (id, fileUrl) => {
  // Extract path from URL to delete from storage
  try {
    const url = new URL(fileUrl)
    const path = url.pathname.split('/storage/v1/object/public/materials/')[1]
    if (path) {
      await supabase.storage.from('materials').remove([decodeURIComponent(path)])
    }
  } catch (e) {
    console.warn('Could not delete file from storage:', e)
  }
  const { error } = await supabase.from('materials').delete().eq('id', id)
  if (error) throw error
}

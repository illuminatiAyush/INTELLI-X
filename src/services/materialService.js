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

  // Notify all students in this batch via RPC to bypass RLS
  if (data && batchId) {
    try {
      const { data: batchStudents } = await supabase
        .from('batch_students')
        .select('student_id')
        .eq('batch_id', batchId)

      if (batchStudents?.length) {
        // Get institute_id from batch
        const { data: batchData } = await supabase
          .from('batches')
          .select('institute_id')
          .eq('id', batchId)
          .single()

        const instituteId = batchData?.institute_id

        // Get profile_ids via students table
        const { data: studentRows } = await supabase
          .from('students')
          .select('id, profile_id')
          .in('id', batchStudents.map(s => s.student_id))

        const profileIds = studentRows?.map(s => s.profile_id).filter(Boolean)
          || batchStudents.map(s => s.student_id)

        for (const uid of profileIds) {
          await supabase.rpc('insert_notification', {
            p_user_id: uid,
            p_institute_id: instituteId,
            p_title: '📚 New Study Material',
            p_message: `"${title}" has been published for your batch.`,
          })
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

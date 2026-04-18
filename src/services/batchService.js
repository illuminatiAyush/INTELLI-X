import { supabase } from '../lib/supabase'

export const getBatches = async () => {
  const { data, error } = await supabase
    .from('batches')
    .select('*, teachers(name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getBatchById = async (id) => {
  const { data, error } = await supabase
    .from('batches')
    .select('*, teachers(name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const createBatch = async (batch) => {
  let join_code;
  let success = false;
  let data, error;
  
  // Try up to 3 times to generate a unique code
  for (let i = 0; i < 3; i++) {
    join_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const join_link = `${window.location.origin}/join/${join_code}`;
    
    const res = await supabase
      .from('batches')
      .insert({ ...batch, join_code, join_link })
      .select()
      .single();
      
    if (!res.error) {
      data = res.data;
      success = true;
      break;
    }
    
    // If error is not a unique constraint violation (23505), throw it
    if (res.error?.code !== '23505') {
      throw res.error;
    }
  }
  
  if (!success) throw new Error("Failed to generate a unique join code");
  return data;
}

export const joinBatch = async (code, studentId, instituteId) => {
  // 1. Fetch batch by code
  const { data: batch, error: fetchError } = await supabase
    .from('batches')
    .select('*')
    .eq('join_code', code)
    .single();

  if (fetchError || !batch) {
    throw new Error('Invalid join code or batch does not exist.');
  }

  // 2. Validate institute
  if (batch.institute_id !== instituteId) {
    throw new Error('You cannot join a batch from a different institute.');
  }

  // 3. Validate Expiration (Temporarily relaxed to fix join code issues)
  // if (batch.invite_expiry && new Date() > new Date(batch.invite_expiry)) {
  //   throw new Error('This join code has expired.');
  // }

  // 4. Validate Max Uses
  if (batch.max_uses && batch.max_uses > 0) {
    const { count } = await supabase
      .from('batch_students')
      .select('*', { count: 'exact', head: true })
      .eq('batch_id', batch.id);
    if (count != null && count >= batch.max_uses) {
      throw new Error('This join code has reached its maximum usage limit.');
    }
  }

  // 5. Check if already enrolled
  const { data: existing } = await supabase
    .from('batch_students')
    .select('batch_id')
    .eq('batch_id', batch.id)
    .eq('student_id', studentId)
    .maybeSingle();

  if (existing) {
    throw new Error('You are already enrolled in this batch.');
  }

  // 6. Insert into batch_students
  const { error: insertError } = await supabase
    .from('batch_students')
    .insert({
      batch_id: batch.id,
      student_id: studentId,
      institute_id: instituteId
    });

  if (insertError) {
    throw insertError;
  }
  
  return batch;
}

export const updateBatch = async (id, updates) => {
  const { data, error } = await supabase
    .from('batches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteBatch = async (id) => {
  const { error } = await supabase.from('batches').delete().eq('id', id)
  if (error) throw error
}

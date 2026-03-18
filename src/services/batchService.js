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
  const { data, error } = await supabase
    .from('batches')
    .insert(batch)
    .select()
    .single()
  if (error) throw error
  return data
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

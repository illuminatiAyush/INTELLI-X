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

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Events
export const getEvents = async (filters = {}) => {
  let query = supabase.from('events').select('*').order('date', { ascending: true })
  if (filters.category && filters.category !== 'All') {
    query = query.eq('category', filters.category)
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,venue.ilike.%${filters.search}%`)
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export const getEventById = async (id) => {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export const createEvent = async (eventData) => {
  const { data, error } = await supabase.from('events').insert([eventData]).select()
  if (error) throw error
  return data[0]
}

export const updateEvent = async (id, eventData) => {
  const { data, error } = await supabase.from('events').update(eventData).eq('id', id).select()
  if (error) throw error
  return data[0]
}

export const deleteEvent = async (id) => {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export const createRegistration = async (registrationData) => {
  const regId = `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  const { data, error } = await supabase
    .from('registrations')
    .insert([{ ...registrationData, registration_id: regId }])
    .select()
  if (error) throw error
  return data[0]
}

export const getRegistrations = async (eventId = null) => {
  let query = supabase
    .from('registrations')
    .select('*, events(title, date, venue)')
    .order('created_at', { ascending: false })
  if (eventId) query = query.eq('event_id', eventId)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export const checkExistingRegistration = async (eventId, email) => {
  const { data } = await supabase
    .from('registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('email', email)
  return data && data.length > 0
}

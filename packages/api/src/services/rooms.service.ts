import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateBookingInput {
  classroomId: string
  bookedBy:    string
  title:       string
  day:         string   // YYYY-MM-DD
  startTime:   string   // HH:MM
  endTime:     string   // HH:MM
  notes?:      string
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

export async function getAllRooms() {
  const { data, error } = await supabase
    .from('classrooms')
    .select(`
      id, name, building, capacity,
      has_projector
    `)
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getRoomWithBookings(classroomId: string, weekStart?: string) {
  const room = await supabase
    .from('classrooms')
    .select('id, name, building, capacity, has_projector')
    .eq('id', classroomId)
    .single()

  if (room.error) throw new Error(room.error.message)

  let query = supabase
    .from('room_bookings')
    .select(`
      id, title, day, start_time, end_time, status, notes,
      profiles!booked_by(first_name, last_name)
    `)
    .eq('classroom_id', classroomId)
    .eq('status', 'confirmed')
    .order('day')
    .order('start_time')

  if (weekStart) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    query = query
      .gte('day', weekStart)
      .lt('day', weekEnd.toISOString().split('T')[0])
  }

  const { data: bookings, error: bErr } = await query
  if (bErr) throw new Error(bErr.message)

  return { ...room.data, bookings: bookings ?? [] }
}

export async function getAllBookings(filters: { day?: string; classroomId?: string } = {}) {
  let query = supabase
    .from('room_bookings')
    .select(`
      id, title, day, start_time, end_time, status, notes,
      classrooms!classroom_id(id, name, building),
      profiles!booked_by(first_name, last_name)
    `)
    .eq('status', 'confirmed')
    .order('day')
    .order('start_time')

  if (filters.day)         query = query.eq('day', filters.day)
  if (filters.classroomId) query = query.eq('classroom_id', filters.classroomId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createBooking(input: CreateBookingInput) {
  // Vérification anti-collision explicite avant INSERT
  const { data: conflicts } = await supabase
    .from('room_bookings')
    .select('id')
    .eq('classroom_id', input.classroomId)
    .eq('day', input.day)
    .eq('status', 'confirmed')
    .lt('start_time', input.endTime)
    .gt('end_time', input.startTime)

  if (conflicts && conflicts.length > 0) {
    throw new Error('Créneau déjà réservé — conflit de planning détecté')
  }

  const { data, error } = await supabase
    .from('room_bookings')
    .insert({
      classroom_id: input.classroomId,
      booked_by:    input.bookedBy,
      title:        input.title,
      day:          input.day,
      start_time:   input.startTime,
      end_time:     input.endTime,
      notes:        input.notes,
      status:       'confirmed',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function cancelBooking(bookingId: string) {
  const { error } = await supabase
    .from('room_bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  if (error) throw new Error(error.message)
}

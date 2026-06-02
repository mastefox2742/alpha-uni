import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface CreateEventInput {
  universityId:   string
  academicYearId?: string
  title:          string
  description?:   string
  type:           'semester' | 'exam_session' | 'holiday' | 'resit' | 'deadline' | 'event'
  startDate:      string
  endDate:        string
  isLocked?:      boolean
  createdBy:      string
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

export async function getAcademicEvents(filters: {
  universityId:    string
  academicYearId?: string
  type?:           string
} ) {
  let query = supabase
    .from('academic_events')
    .select('id, title, description, type, start_date, end_date, is_locked, created_at')
    .eq('university_id', filters.universityId)
    .order('start_date')

  if (filters.academicYearId) query = query.eq('academic_year_id', filters.academicYearId)
  if (filters.type)           query = query.eq('type', filters.type)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getUpcomingEvents(universityId: string, limit = 5) {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('academic_events')
    .select('id, title, type, start_date, end_date, is_locked')
    .eq('university_id', universityId)
    .gte('end_date', today)
    .order('start_date')
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createEvent(input: CreateEventInput) {
  const { data, error } = await supabase
    .from('academic_events')
    .insert({
      university_id:    input.universityId,
      academic_year_id: input.academicYearId,
      title:            input.title,
      description:      input.description,
      type:             input.type,
      start_date:       input.startDate,
      end_date:         input.endDate,
      is_locked:        input.isLocked ?? false,
      created_by:       input.createdBy,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateEvent(
  eventId:   string,
  updates:   Partial<Pick<CreateEventInput, 'title' | 'description' | 'startDate' | 'endDate' | 'type'>>,
) {
  const { data: existing } = await supabase
    .from('academic_events')
    .select('is_locked')
    .eq('id', eventId)
    .single()

  if (existing?.is_locked) {
    throw new Error('Cet événement est verrouillé et ne peut pas être modifié')
  }

  const updatePayload: Record<string, unknown> = {}
  if (updates.title)       updatePayload.title       = updates.title
  if (updates.description) updatePayload.description = updates.description
  if (updates.startDate)   updatePayload.start_date  = updates.startDate
  if (updates.endDate)     updatePayload.end_date    = updates.endDate
  if (updates.type)        updatePayload.type        = updates.type

  const { data, error } = await supabase
    .from('academic_events')
    .update(updatePayload)
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteEvent(eventId: string) {
  const { data: existing } = await supabase
    .from('academic_events')
    .select('is_locked')
    .eq('id', eventId)
    .single()

  if (existing?.is_locked) {
    throw new Error('Cet événement est verrouillé et ne peut pas être supprimé')
  }

  const { error } = await supabase
    .from('academic_events')
    .delete()
    .eq('id', eventId)

  if (error) throw new Error(error.message)
}

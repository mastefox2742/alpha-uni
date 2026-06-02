import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface CreateMissionInput {
  teacherId:   string
  destination: string
  purpose:     string
  startDate:   string
  endDate:     string
  expenses:    Array<{ label: string; amount: number }>
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

export async function getAllMissions(filters: { status?: string } = {}) {
  let query = supabase
    .from('mission_requests')
    .select(`
      id, destination, purpose, start_date, end_date,
      status, total_amount, approved_at, refusal_reason, payment_ref, paid_at, created_at,
      teachers!teacher_id(
        id, title,
        profiles!user_id(first_name, last_name),
        departments!department_id(name)
      ),
      mission_expenses(id, label, amount)
    `)
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getMissionsByTeacher(teacherUserId: string) {
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', teacherUserId)
    .single()

  if (!teacher) return []

  const { data, error } = await supabase
    .from('mission_requests')
    .select(`
      id, destination, purpose, start_date, end_date,
      status, total_amount, approved_at, refusal_reason, created_at,
      mission_expenses(id, label, amount)
    `)
    .eq('teacher_id', teacher.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createMission(input: CreateMissionInput) {
  const totalAmount = input.expenses.reduce((sum, e) => sum + e.amount, 0)

  const { data: mission, error } = await supabase
    .from('mission_requests')
    .insert({
      teacher_id:   input.teacherId,
      destination:  input.destination,
      purpose:      input.purpose,
      start_date:   input.startDate,
      end_date:     input.endDate,
      status:       'pending',
      total_amount: totalAmount,
    })
    .select()
    .single()

  if (error || !mission) throw new Error(error?.message ?? 'Erreur création mission')

  if (input.expenses.length > 0) {
    await supabase.from('mission_expenses').insert(
      input.expenses.map(e => ({
        mission_id: mission.id,
        label:      e.label,
        amount:     e.amount,
      })),
    )
  }

  return mission
}

export async function approveMission(missionId: string, approvedBy: string) {
  const { data, error } = await supabase
    .from('mission_requests')
    .update({
      status:      'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq('id', missionId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Mission introuvable ou déjà traitée')
  return data
}

export async function refuseMission(missionId: string, reason: string) {
  if (!reason?.trim()) throw new Error('Un motif de refus est obligatoire')

  const { data, error } = await supabase
    .from('mission_requests')
    .update({
      status:         'refused',
      refusal_reason: reason,
    })
    .eq('id', missionId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Mission introuvable ou déjà traitée')
  return data
}

export async function markMissionPaid(missionId: string, paymentRef: string) {
  const { data, error } = await supabase
    .from('mission_requests')
    .update({
      status:      'paid',
      payment_ref: paymentRef,
      paid_at:     new Date().toISOString(),
    })
    .eq('id', missionId)
    .eq('status', 'approved')
    .select()
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Mission introuvable ou non approuvée')
  return data
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getMissionsStats() {
  const { data, error } = await supabase
    .from('mission_requests')
    .select('status, total_amount')

  if (error) throw new Error(error.message)

  const stats = {
    pending:  { count: 0, amount: 0 },
    approved: { count: 0, amount: 0 },
    refused:  { count: 0, amount: 0 },
    paid:     { count: 0, amount: 0 },
  }

  for (const m of (data ?? [])) {
    const s = m.status as keyof typeof stats
    if (s in stats) {
      stats[s].count++
      stats[s].amount += Number(m.total_amount)
    }
  }

  return stats
}

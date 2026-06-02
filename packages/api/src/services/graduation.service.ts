import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface AddJuryMemberInput {
  applicationId: string
  teacherId?:    string
  name:          string
  role:          'president' | 'rapporteur' | 'examiner' | 'supervisor' | 'external'
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

export async function getAllApplications(filters: { status?: string } = {}) {
  let query = supabase
    .from('graduation_applications')
    .select(`
      id, status, cfu_acquired, cfu_required, balance_due,
      thesis_title, defense_date, diploma_issued_at, diploma_number, notes,
      students!student_id(
        id, matricola,
        profiles!user_id(first_name, last_name),
        degree_programs!degree_program_id(name, code, total_cfu)
      ),
      graduation_jury_members(id, name, role, confirmed, teacher_id)
    `)
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getApplicationById(applicationId: string) {
  const { data, error } = await supabase
    .from('graduation_applications')
    .select(`
      id, status, cfu_acquired, cfu_required, balance_due,
      thesis_title, defense_date, diploma_issued_at, diploma_number, notes,
      students!student_id(
        id, matricola,
        profiles!user_id(first_name, last_name, phone),
        degree_programs!degree_program_id(name, code, total_cfu)
      ),
      graduation_jury_members(id, name, role, confirmed, teacher_id)
    `)
    .eq('id', applicationId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function updateApplicationStatus(
  applicationId: string,
  status: 'pending' | 'eligible' | 'jury_incomplete' | 'jury_complete' | 'defended' | 'diploma_issued' | 'blocked',
  notes?: string,
) {
  const updateData: Record<string, unknown> = { status }
  if (notes) updateData.notes = notes
  if (status === 'diploma_issued') updateData.diploma_issued_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('graduation_applications')
    .update(updateData)
    .eq('id', applicationId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function setDefenseDate(
  applicationId: string,
  defenseDate:   string,
  roomId?:       string,
) {
  const updateData: Record<string, unknown> = { defense_date: defenseDate }
  if (roomId) updateData.defense_room_id = roomId

  const { data, error } = await supabase
    .from('graduation_applications')
    .update(updateData)
    .eq('id', applicationId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function addJuryMember(input: AddJuryMemberInput) {
  const { data, error } = await supabase
    .from('graduation_jury_members')
    .insert({
      application_id: input.applicationId,
      teacher_id:     input.teacherId,
      name:           input.name,
      role:           input.role,
      confirmed:      false,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Recalcule le statut de la demande
  await recalcApplicationStatus(input.applicationId)

  return data
}

export async function removeJuryMember(juryMemberId: string, applicationId: string) {
  const { error } = await supabase
    .from('graduation_jury_members')
    .delete()
    .eq('id', juryMemberId)

  if (error) throw new Error(error.message)

  await recalcApplicationStatus(applicationId)
}

export async function generateDiploma(applicationId: string): Promise<string> {
  const app = await getApplicationById(applicationId)
  if (!app) throw new Error('Demande introuvable')

  // Vérifications d'éligibilité
  if (app.cfu_acquired < app.cfu_required) throw new Error('CFU insuffisants')
  if (Number(app.balance_due) > 0) throw new Error('Solde impayé')

  const juryCount = (app.graduation_jury_members as { id: string }[]).length
  if (juryCount < 3) throw new Error('Jury incomplet (minimum 3 membres)')
  if (!app.defense_date) throw new Error('Date de soutenance non fixée')

  // Numéro de diplôme unique
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  const diplomaNumber = `DIPL-${year}-${rand}`

  await supabase
    .from('graduation_applications')
    .update({
      status:           'diploma_issued',
      diploma_number:   diplomaNumber,
      diploma_issued_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  return diplomaNumber
}

// ─── Helpers internes ────────────────────────────────────────────────────────

async function recalcApplicationStatus(applicationId: string) {
  const { data: members } = await supabase
    .from('graduation_jury_members')
    .select('id')
    .eq('application_id', applicationId)

  const count = members?.length ?? 0
  const newStatus = count >= 3 ? 'jury_complete' : count > 0 ? 'jury_incomplete' : 'eligible'

  await supabase
    .from('graduation_applications')
    .update({ status: newStatus })
    .eq('id', applicationId)
    .neq('status', 'diploma_issued') // Ne pas rétrograder un diplôme émis
}

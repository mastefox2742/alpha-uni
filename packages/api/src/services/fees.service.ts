import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface CreateFeeInput {
  studentId:       string
  academicYearId:  string
  amount:          number
  dueDate:         string  // YYYY-MM-DD
  description?:    string
}

export interface PayFeeInput {
  feeId:        string
  paymentRef:   string
  method:       string   // 'bank_transfer' | 'card' | 'cash' | etc.
  amount:       number
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

/**
 * Frais d'un étudiant (depuis son user_id Supabase Auth)
 */
export async function getStudentFees(studentUserId: string) {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', studentUserId)
    .single()

  if (!student) return []

  // Mettre à jour les frais en retard avant de renvoyer
  await markOverdueFees(student.id)

  const { data, error } = await supabase
    .from('tuition_fees')
    .select(`
      id, amount, due_date, status, paid_at, payment_ref, late_fee, created_at,
      academic_years!academic_year_id(label)
    `)
    .eq('student_id', student.id)
    .order('due_date', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

/**
 * Résumé financier rapide (totaux par statut)
 */
export async function getStudentFeesSummary(studentUserId: string) {
  const fees = await getStudentFees(studentUserId)

  const pending = fees
    .filter(f => f.status === 'pending')
    .reduce((sum, f) => sum + Number(f.amount) + Number(f.late_fee ?? 0), 0)

  const overdue = fees
    .filter(f => f.status === 'overdue')
    .reduce((sum, f) => sum + Number(f.amount) + Number(f.late_fee ?? 0), 0)

  const paid = fees
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + Number(f.amount), 0)

  return { fees, pending, overdue, paid, total: pending + overdue }
}

/**
 * Tous les frais (admin/secrétaire) avec filtres
 */
export async function getAllFees(filters: {
  status?: string
  academicYearId?: string
} = {}) {
  let query = supabase
    .from('tuition_fees')
    .select(`
      id, amount, due_date, status, paid_at, payment_ref, late_fee, created_at,
      academic_years!academic_year_id(label),
      students!student_id(
        id, matricola,
        profiles!user_id(first_name, last_name, email)
      )
    `)
    .order('due_date', { ascending: false })

  if (filters.status)         query = query.eq('status', filters.status)
  if (filters.academicYearId) query = query.eq('academic_year_id', filters.academicYearId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Mutations (secrétaire / admin) ──────────────────────────────────────────

/**
 * Marquer un frais comme payé + enregistrer le paiement
 */
export async function markFeePaid(input: PayFeeInput) {
  const { data: fee } = await supabase
    .from('tuition_fees')
    .select('id, student_id, amount, status')
    .eq('id', input.feeId)
    .single()

  if (!fee) throw new Error('Frais introuvable')
  if (fee.status === 'paid') throw new Error('Ce frais est déjà payé')
  if (fee.status === 'waived') throw new Error('Ce frais a été exonéré')

  const now = new Date().toISOString()

  // Mettre à jour le frais
  await supabase.from('tuition_fees').update({
    status:      'paid',
    paid_at:     now,
    payment_ref: input.paymentRef,
  }).eq('id', input.feeId)

  // Enregistrer le paiement
  await supabase.from('payments').insert({
    student_id: fee.student_id,
    fee_id:     input.feeId,
    amount:     input.amount,
    method:     input.method,
    reference:  input.paymentRef,
    paid_at:    now,
  })
}

/**
 * Exonérer un frais (dispense totale)
 */
export async function waiveFee(feeId: string, reason?: string) {
  const { data: fee } = await supabase
    .from('tuition_fees')
    .select('id, status')
    .eq('id', feeId)
    .single()

  if (!fee) throw new Error('Frais introuvable')
  if (fee.status === 'paid') throw new Error('Ce frais est déjà payé')

  await supabase.from('tuition_fees').update({
    status:      'waived',
    payment_ref: reason ?? 'Exonération',
  }).eq('id', feeId)
}

/**
 * Créer un nouveau frais de scolarité pour un étudiant
 */
export async function createFee(input: CreateFeeInput) {
  const { data, error } = await supabase
    .from('tuition_fees')
    .insert({
      student_id:       input.studentId,
      academic_year_id: input.academicYearId,
      amount:           input.amount,
      due_date:         input.dueDate,
      status:           'pending',
    })
    .select()
    .single()

  if (error || !data) throw new Error('Impossible de créer le frais')
  return data
}

/**
 * Passer les frais dépassés en 'overdue' + appliquer pénalité de retard (5%)
 */
async function markOverdueFees(studentId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data: overdueItems } = await supabase
    .from('tuition_fees')
    .select('id, amount, late_fee')
    .eq('student_id', studentId)
    .eq('status', 'pending')
    .lt('due_date', today)

  if (!overdueItems || overdueItems.length === 0) return

  for (const fee of overdueItems) {
    const lateFee = Math.round(Number(fee.amount) * 0.05 * 100) / 100 // 5%
    await supabase.from('tuition_fees').update({
      status:   'overdue',
      late_fee: lateFee,
    }).eq('id', fee.id)
  }
}

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ─── Rapport annuel global ─────────────────────────────────────────────────────

export async function getAnnualReport(universityId: string, academicYearId?: string) {
  // 1. Stats étudiants
  const { data: students } = await supabase
    .from('students')
    .select('id, status, nationality, enrollment_year, degree_program_id')
    .eq('degree_programs.faculties.departments.universities.id' as never, universityId)

  const totalStudents   = students?.length ?? 0
  const activeStudents  = students?.filter(s => s.status === 'active').length ?? 0
  const graduated       = students?.filter(s => s.status === 'graduated').length ?? 0
  const withdrawn       = students?.filter(s => s.status === 'withdrawn').length ?? 0

  // 2. Stats enseignants
  const { data: teachers } = await supabase
    .from('teachers')
    .select('id')

  // 3. Stats frais
  const { data: fees } = await supabase
    .from('tuition_fees')
    .select('status, amount')

  const totalRevenue = fees
    ?.filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + Number(f.amount), 0) ?? 0

  const outstandingFees = fees
    ?.filter(f => ['pending', 'overdue'].includes(f.status))
    .reduce((sum, f) => sum + Number(f.amount), 0) ?? 0

  // 4. Stats missions
  const { data: missions } = await supabase
    .from('mission_requests')
    .select('status, total_amount')

  const missionBudget = missions
    ?.filter(m => m.status === 'paid')
    .reduce((sum, m) => sum + Number(m.total_amount), 0) ?? 0

  // 5. KPI par filière
  const { data: kpis } = await supabase
    .from('program_kpis')
    .select(`
      total_students, retention_rate, pass_rate, avg_grad_years,
      degree_programs!degree_program_id(name, code, type)
    `)

  const avgPassRate = kpis && kpis.length > 0
    ? kpis.reduce((s, k) => s + Number(k.retention_rate), 0) / kpis.length
    : 0

  // 6. Abandons
  const abandonRate = totalStudents > 0
    ? (withdrawn / totalStudents) * 100
    : 0

  // 7. Ratio encadrement
  const teacherCount = teachers?.length ?? 1
  const encadrementRatio = activeStudents > 0
    ? `1/${Math.round(activeStudents / teacherCount)}`
    : '–'

  return {
    // Effectifs
    totalStudents,
    activeStudents,
    graduated,
    withdrawn,
    // Qualité
    avgPassRate:    Math.round(avgPassRate * 10) / 10,
    abandonRate:    Math.round(abandonRate * 10) / 10,
    encadrementRatio,
    // Finance
    totalRevenue,
    outstandingFees,
    missionBudget,
    // Filières
    programKpis:    kpis ?? [],
    // Nationalités (fictif ici — à alimenter via le champ nationality de students)
    nationalities: computeNationalities(students ?? []),
  }
}

// ─── Rapport par filière ──────────────────────────────────────────────────────

export async function getProgramReport(programId: string) {
  const { data, error } = await supabase
    .from('degree_programs')
    .select(`
      id, name, code, type, total_cfu,
      departments!department_id(name),
      students!degree_program_id(
        id, status, gpa, total_cfu_earned, enrollment_year
      ),
      program_kpis(
        total_students, retention_rate, avg_grad_years, pass_rate, at_risk_count,
        academic_years!academic_year_id(label)
      ),
      courses!degree_program_id(id, name, code)
    `)
    .eq('id', programId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Export CSV ───────────────────────────────────────────────────────────────

export async function exportStudentsCsv(filters: { programId?: string; status?: string } = {}) {
  let query = supabase
    .from('students')
    .select(`
      matricola, status, current_year, total_cfu_earned, gpa, enrollment_year,
      profiles!user_id(first_name, last_name, phone),
      degree_programs!degree_program_id(name, code)
    `)

  if (filters.programId) query = query.eq('degree_program_id', filters.programId)
  if (filters.status)    query = query.eq('status', filters.status)

  const { data, error } = await query.order('enrollment_year', { ascending: false })
  if (error) throw new Error(error.message)

  const rows = (data ?? []).map(s => {
    const pRaw = s.profiles as Array<{ first_name: string; last_name: string; phone?: string }> | null
    const dRaw = s.degree_programs as Array<{ name: string; code: string }> | null
    const p = Array.isArray(pRaw) ? (pRaw[0] ?? null) : (pRaw as { first_name: string; last_name: string; phone?: string } | null)
    const d = Array.isArray(dRaw) ? (dRaw[0] ?? null) : (dRaw as { name: string; code: string } | null)
    return [
      s.matricola ?? '',
      p?.last_name ?? '',
      p?.first_name ?? '',
      d?.name ?? '',
      s.status,
      s.current_year,
      s.total_cfu_earned,
      s.gpa,
      s.enrollment_year,
    ].join(';')
  })

  const header = 'Matricule;Nom;Prénom;Filière;Statut;Année;CFU;Moyenne;Promo'
  return [header, ...rows].join('\n')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeNationalities(students: Array<{ nationality?: string | null }>) {
  const counts = new Map<string, number>()
  for (const s of students) {
    const nat = s.nationality ?? 'Non renseignée'
    counts.set(nat, (counts.get(nat) ?? 0) + 1)
  }
  const total = students.length || 1
  return Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
    }))
}

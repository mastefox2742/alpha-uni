import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ─── Lecture ──────────────────────────────────────────────────────────────────

export async function getAllPrograms() {
  const { data, error } = await supabase
    .from('degree_programs')
    .select(`
      id, name, code, type, duration_years, total_cfu, description,
      departments!department_id(
        name, code,
        faculties!faculty_id(name)
      )
    `)
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProgramStudents(programId: string, filters: { atRisk?: boolean } = {}) {
  let query = supabase
    .from('students')
    .select(`
      id, matricola, status, current_year, total_cfu_earned, gpa,
      profiles!user_id(first_name, last_name, phone)
    `)
    .eq('degree_program_id', programId)
    .eq('status', 'active')
    .order('current_year')

  // Filtre at-risk : moyenne < 10 ou CFU < 60% du total attendu à l'année en cours
  if (filters.atRisk) {
    query = query.lt('gpa', 10)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProgramTeachers(programId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, name, code, year, semester,
      teachers!teacher_id(
        id, title, office_location,
        profiles!user_id(first_name, last_name),
        departments!department_id(name)
      )
    `)
    .eq('degree_program_id', programId)
    .order('year')
    .order('semester')

  if (error) throw new Error(error.message)

  // Déduplique les enseignants et agrège leurs cours
  const teacherMap = new Map<string, {
    id: string; name: string; title: string; department: string
    courses: Array<{ code: string; name: string; year: number; semester: number }>
  }>()

  for (const course of (data ?? [])) {
    // Supabase renvoie les joins 1-to-many comme des tableaux même pour les FK many-to-one
    const tArr = course.teachers as Array<{
      id: string; title: string; office_location: string
      profiles: Array<{ first_name: string; last_name: string }>
      departments: Array<{ name: string }>
    }> | null
    const t = Array.isArray(tArr) ? tArr[0] : (tArr as unknown as typeof tArr extends Array<infer U> ? U : never | null)
    if (!t) continue
    const tProfiles    = Array.isArray(t.profiles)    ? t.profiles[0]    : t.profiles    as { first_name: string; last_name: string }
    const tDepartments = Array.isArray(t.departments) ? t.departments[0] : t.departments as { name: string }
    if (!tProfiles || !tDepartments) continue
    const key = t.id
    if (!teacherMap.has(key)) {
      teacherMap.set(key, {
        id:         t.id,
        name:       `${t.title} ${tProfiles.first_name} ${tProfiles.last_name}`,
        title:      t.title,
        department: tDepartments.name,
        courses:    [],
      })
    }
    teacherMap.get(key)!.courses.push({
      code:     course.code,
      name:     course.name,
      year:     course.year,
      semester: course.semester,
    })
  }

  return Array.from(teacherMap.values())
}

export async function getProgramCurriculum(programId: string) {
  const { data, error } = await supabase
    .from('curriculum_units')
    .select(`
      id, code, name, cfu, year, semester,
      exam_mode, syllabus_complete, syllabus_url,
      courses!course_id(
        teachers!teacher_id(
          title,
          profiles!user_id(first_name, last_name)
        )
      )
    `)
    .eq('degree_program_id', programId)
    .order('year')
    .order('semester')
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProgramExamResults(programId: string, academicYearId?: string) {
  let query = supabase
    .from('exams')
    .select(`
      id, session_type, date,
      courses!course_id(id, name, code, degree_program_id),
      exam_bookings(grade, grade_status)
    `)
    .order('date', { ascending: false })

  if (academicYearId) query = query.eq('academic_year_id', academicYearId)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  // Filtre par programme et calcule les stats par cours/examen
  const results = []
  for (const exam of (data ?? [])) {
    const courseRaw = exam.courses as Array<{ id: string; name: string; code: string; degree_program_id: string }> | null
    const course = Array.isArray(courseRaw) ? courseRaw[0] ?? null : (courseRaw as { id: string; name: string; code: string; degree_program_id: string } | null)
    if (!course || course.degree_program_id !== programId) continue

    const bookings = (exam.exam_bookings as Array<{ grade: number | null; grade_status: string }>) ?? []
    const total      = bookings.length
    const published  = bookings.filter(b => b.grade_status === 'published')
    const passed     = published.filter(b => Number(b.grade) >= 18)
    const avgGrade   = published.length > 0
      ? published.reduce((s, b) => s + Number(b.grade), 0) / published.length
      : 0
    const passRate   = published.length > 0 ? (passed.length / published.length) * 100 : 0

    results.push({
      examId:     exam.id,
      courseCode: course.code,
      courseName: course.name,
      session:    exam.session_type,
      date:       exam.date,
      totalTook:  total,
      passRate:   Math.round(passRate * 10) / 10,
      avgGrade:   Math.round(avgGrade * 10) / 10,
      alert:      passRate < 50 && published.length >= 5,
    })
  }

  return results
}

export async function getProgramKpis(programId: string) {
  const { data, error } = await supabase
    .from('program_kpis')
    .select(`
      id, total_students, retention_rate, avg_grad_years,
      pass_rate, at_risk_count, thesis_defended, thesis_ongoing,
      academic_years!academic_year_id(label)
    `)
    .eq('degree_program_id', programId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function updateSyllabusStatus(
  curriculumUnitId: string,
  complete:         boolean,
  syllabusUrl?:     string,
) {
  const updateData: Record<string, unknown> = { syllabus_complete: complete }
  if (syllabusUrl !== undefined) updateData.syllabus_url = syllabusUrl

  const { data, error } = await supabase
    .from('curriculum_units')
    .update(updateData)
    .eq('id', curriculumUnitId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function upsertProgramKpi(input: {
  programId:      string
  academicYearId: string
  totalStudents:  number
  retentionRate:  number
  avgGradYears:   number
  passRate:       number
  atRiskCount:    number
  thesisDefended: number
  thesisOngoing:  number
}) {
  const { data, error } = await supabase
    .from('program_kpis')
    .upsert({
      degree_program_id: input.programId,
      academic_year_id:  input.academicYearId,
      total_students:    input.totalStudents,
      retention_rate:    input.retentionRate,
      avg_grad_years:    input.avgGradYears,
      pass_rate:         input.passRate,
      at_risk_count:     input.atRiskCount,
      thesis_defended:   input.thesisDefended,
      thesis_ongoing:    input.thesisOngoing,
    }, { onConflict: 'degree_program_id,academic_year_id' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

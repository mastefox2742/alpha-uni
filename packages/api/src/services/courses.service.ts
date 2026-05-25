import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/**
 * Retourne l'ID teacher (table teachers) depuis l'user_id Supabase Auth
 */
export async function getTeacherIdByUserId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', userId)
    .single()
  return data?.id ?? null
}

/**
 * GET /api/teachers/me/courses
 * Liste des cours de l'enseignant avec stats
 */
export async function getTeacherCourses(teacherId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, name, code, year, semester, cfu, description,
      degree_programs!degree_program_id(name, type),
      course_enrollments(count)
    `)
    .eq('teacher_id', teacherId)
    .order('year', { ascending: true })
    .order('semester', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

/**
 * GET /api/teachers/courses/:id
 * Détail d'un cours avec toutes ses sessions d'examen
 */
export async function getCourseById(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, name, code, year, semester, cfu, description, syllabus_url,
      degree_programs!degree_program_id(id, name, type, total_cfu),
      teachers!teacher_id(
        id,
        profiles!user_id(first_name, last_name)
      ),
      exam_sessions(
        id, date, registration_deadline, max_students, notes,
        exam_bookings(count)
      )
    `)
    .eq('id', courseId)
    .single()

  if (error || !data) throw new Error('Cours introuvable')
  return data
}

/**
 * GET /api/teachers/courses/:id/students
 * Étudiants inscrits à un cours (via course_enrollments)
 */
export async function getCourseStudents(courseId: string) {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select(`
      id, enrolled_at,
      students!student_id(
        id, matricola, status,
        profiles!user_id(first_name, last_name, email)
      )
    `)
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

/**
 * GET /api/students/me/courses
 * Cours du plan d'études de l'étudiant pour l'année courante
 */
export async function getStudentCourses(studentId: string) {
  // Chercher le plan d'études approuvé ou le plus récent
  const { data: plan } = await supabase
    .from('study_plans')
    .select('id')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!plan) {
    // Fallback : courses du programme de l'étudiant
    const { data: student } = await supabase
      .from('students')
      .select('degree_program_id')
      .eq('id', studentId)
      .single()

    if (!student) return []

    const { data: courses } = await supabase
      .from('courses')
      .select(`
        id, name, code, year, semester, cfu,
        teachers!teacher_id(
          profiles!user_id(first_name, last_name)
        )
      `)
      .eq('degree_program_id', student.degree_program_id)
      .order('year')
      .order('semester')

    return courses ?? []
  }

  const { data, error } = await supabase
    .from('study_plan_courses')
    .select(`
      courses!course_id(
        id, name, code, year, semester, cfu,
        teachers!teacher_id(
          profiles!user_id(first_name, last_name)
        )
      )
    `)
    .eq('study_plan_id', plan.id)

  if (error) throw new Error(error.message)
  return (data ?? []).map((row: any) => row.courses)
}

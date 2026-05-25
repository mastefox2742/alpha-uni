import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ─── Cours E-Learning ─────────────────────────────────────────────────────────

/**
 * Créer ou récupérer le cours e-learning d'un cours
 */
export async function upsertElearningCourse(courseId: string, input: {
  welcomeMessage?: string
  thumbnailUrl?:   string
}) {
  const { data: existing } = await supabase
    .from('elearning_courses')
    .select('id')
    .eq('course_id', courseId)
    .maybeSingle()

  if (existing) {
    const update: Record<string, string> = {}
    if (input.welcomeMessage !== undefined) update.welcome_message = input.welcomeMessage
    if (input.thumbnailUrl !== undefined)   update.thumbnail_url   = input.thumbnailUrl

    const { data, error } = await supabase
      .from('elearning_courses')
      .update(update)
      .eq('id', existing.id)
      .select()
      .single()
    if (error || !data) throw new Error('Impossible de mettre à jour le cours')
    return data
  }

  const { data, error } = await supabase
    .from('elearning_courses')
    .insert({
      course_id:       courseId,
      welcome_message: input.welcomeMessage ?? null,
      thumbnail_url:   input.thumbnailUrl ?? null,
    })
    .select()
    .single()

  if (error || !data) throw new Error('Impossible de créer le cours e-learning')
  return data
}

export async function publishElearningCourse(ecId: string, published: boolean) {
  const { error } = await supabase
    .from('elearning_courses')
    .update({ is_published: published })
    .eq('id', ecId)
  if (error) throw new Error(error.message)
}

/**
 * Récupérer le cours e-learning complet (pour l'enseignant)
 */
export async function getElearningCourseForTeacher(courseId: string) {
  const { data: ec } = await supabase
    .from('elearning_courses')
    .select(`
      id, is_published, welcome_message, thumbnail_url,
      courses!course_id(id, name, code, cfu, year, semester),
      elearning_sections(
        id, title, description, position,
        elearning_materials(id, title, type, url, content, duration_s, position)
      ),
      elearning_assignments(id, title, description, due_date, max_score),
      elearning_quizzes(id, title, description, is_published, time_limit_min, pass_score, max_attempts)
    `)
    .eq('course_id', courseId)
    .maybeSingle()

  return ec
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export async function createSection(ecId: string, input: { title: string; description?: string }) {
  // Position = max existant + 1
  const { count } = await supabase
    .from('elearning_sections')
    .select('id', { count: 'exact', head: true })
    .eq('elearning_course_id', ecId)

  const { data, error } = await supabase
    .from('elearning_sections')
    .insert({
      elearning_course_id: ecId,
      title:               input.title,
      description:         input.description ?? null,
      position:            (count ?? 0),
    })
    .select()
    .single()

  if (error || !data) throw new Error('Impossible de créer la section')
  return data
}

export async function updateSection(sectionId: string, input: { title?: string; description?: string }) {
  const update: Record<string, string | null> = {}
  if (input.title !== undefined)       update.title       = input.title
  if (input.description !== undefined) update.description = input.description ?? null

  await supabase.from('elearning_sections').update(update).eq('id', sectionId)
}

export async function deleteSection(sectionId: string) {
  await supabase.from('elearning_sections').delete().eq('id', sectionId)
}

// ─── Matériaux ────────────────────────────────────────────────────────────────

export async function createMaterial(sectionId: string, input: {
  title:      string
  type:       string
  url?:       string
  content?:   string
  durationS?: number
}) {
  const { count } = await supabase
    .from('elearning_materials')
    .select('id', { count: 'exact', head: true })
    .eq('section_id', sectionId)

  const { data, error } = await supabase
    .from('elearning_materials')
    .insert({
      section_id: sectionId,
      title:      input.title,
      type:       input.type,
      url:        input.url ?? null,
      content:    input.content ?? null,
      duration_s: input.durationS ?? null,
      position:   (count ?? 0),
    })
    .select()
    .single()

  if (error || !data) throw new Error('Impossible de créer le matériau')
  return data
}

export async function deleteMaterial(materialId: string) {
  await supabase.from('elearning_materials').delete().eq('id', materialId)
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export async function createAssignment(ecId: string, input: {
  title:       string
  description?: string
  dueDate?:    string
  maxScore?:   number
}) {
  const { data, error } = await supabase
    .from('elearning_assignments')
    .insert({
      elearning_course_id: ecId,
      title:               input.title,
      description:         input.description ?? null,
      due_date:            input.dueDate ?? null,
      max_score:           input.maxScore ?? 100,
    })
    .select()
    .single()

  if (error || !data) throw new Error('Impossible de créer le devoir')
  return data
}

export async function getSubmissions(assignmentId: string) {
  const { data, error } = await supabase
    .from('elearning_submissions')
    .select(`
      id, file_url, content, score, feedback, submitted_at, graded_at,
      students!student_id(
        id, matricola,
        profiles!user_id(first_name, last_name, email)
      )
    `)
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function gradeSubmission(submissionId: string, score: number, feedback?: string) {
  const update: Record<string, string | number> = {
    score,
    graded_at: new Date().toISOString(),
  }
  if (feedback) update.feedback = feedback

  await supabase.from('elearning_submissions').update(update).eq('id', submissionId)
}

// ─── Vue étudiant ─────────────────────────────────────────────────────────────

/**
 * Cours e-learning disponibles pour un étudiant (via course_enrollments)
 */
export async function getStudentElearningCourses(studentUserId: string) {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', studentUserId)
    .single()

  if (!student) return []

  // Cours inscrits
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .eq('student_id', student.id)

  if (!enrollments || enrollments.length === 0) {
    // Fallback : cours du programme de l'étudiant avec e-learning publié
    const { data: studentData } = await supabase
      .from('students')
      .select('degree_program_id')
      .eq('id', student.id)
      .single()

    if (!studentData) return []

    const { data } = await supabase
      .from('elearning_courses')
      .select(`
        id, is_published, welcome_message, thumbnail_url,
        courses!course_id(id, name, code, cfu, year, semester,
          teachers!teacher_id(profiles!user_id(first_name, last_name)),
          degree_program_id
        ),
        elearning_sections(count),
        elearning_materials(count)
      `)
      .eq('is_published', true)

    return (data ?? []).filter(
      (ec: any) => ec.courses?.degree_program_id === studentData.degree_program_id,
    )
  }

  const courseIds = enrollments.map((e: any) => e.course_id)

  const { data } = await supabase
    .from('elearning_courses')
    .select(`
      id, is_published, welcome_message, thumbnail_url,
      courses!course_id(id, name, code, cfu, year, semester,
        teachers!teacher_id(profiles!user_id(first_name, last_name))
      ),
      elearning_sections(count),
      elearning_materials(count)
    `)
    .eq('is_published', true)
    .in('course_id', courseIds)

  return data ?? []
}

/**
 * Contenu complet d'un cours e-learning pour un étudiant (avec progression)
 */
export async function getElearningCourseForStudent(ecId: string, studentUserId: string) {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', studentUserId)
    .single()

  const { data: ec } = await supabase
    .from('elearning_courses')
    .select(`
      id, is_published, welcome_message, thumbnail_url,
      courses!course_id(id, name, code, cfu, year, semester,
        teachers!teacher_id(profiles!user_id(first_name, last_name))
      ),
      elearning_sections(
        id, title, description, position,
        elearning_materials(id, title, type, url, content, duration_s, position)
      ),
      elearning_assignments(id, title, description, due_date, max_score),
      elearning_quizzes(id, title, description, is_published, time_limit_min, pass_score, max_attempts)
    `)
    .eq('id', ecId)
    .single()

  if (!ec || !ec.is_published) throw new Error('Cours introuvable ou non publié')

  // Progression de l'étudiant
  let progress: Record<string, { completed: boolean; progress_pct: number }> = {}
  if (student) {
    const { data: prog } = await supabase
      .from('student_elearning_progress')
      .select('material_id, completed, progress_pct')
      .eq('student_id', student.id)

    for (const p of prog ?? []) {
      progress[p.material_id] = { completed: p.completed, progress_pct: p.progress_pct }
    }
  }

  return { ec, progress }
}

/**
 * Marquer un matériau comme terminé / mettre à jour la progression
 */
export async function upsertProgress(
  materialId:      string,
  studentUserId:   string,
  progressPct:     number,
  completed:       boolean,
) {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', studentUserId)
    .single()

  if (!student) throw new Error('Étudiant introuvable')

  await supabase
    .from('student_elearning_progress')
    .upsert({
      student_id:   student.id,
      material_id:  materialId,
      completed,
      progress_pct: progressPct,
      last_seen_at: new Date().toISOString(),
    }, { onConflict: 'student_id,material_id' })
}

/**
 * Soumettre un devoir
 */
export async function submitAssignment(
  assignmentId:  string,
  studentUserId: string,
  content:       string,
  fileUrl?:      string,
) {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', studentUserId)
    .single()

  if (!student) throw new Error('Étudiant introuvable')

  const { data, error } = await supabase
    .from('elearning_submissions')
    .upsert({
      assignment_id: assignmentId,
      student_id:    student.id,
      content,
      file_url:      fileUrl ?? null,
      submitted_at:  new Date().toISOString(),
    }, { onConflict: 'assignment_id,student_id' })
    .select()
    .single()

  if (error || !data) throw new Error('Impossible de soumettre le devoir')
  return data
}

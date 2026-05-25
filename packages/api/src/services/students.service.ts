import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface DashboardData {
  studentId:        string
  matricola:        string | null
  fullName:         string
  degreeProgram:    string
  totalCfu:         number
  totalCfuEarned:   number
  cfuProgressPct:   number
  gpa:              number
  currentYear:      number
  enrollmentYear:   number
  status:           string
  nextExamDate:     string | null
  pendingFeesTotal: number
}

export interface LibrettoEntry {
  id:            string
  courseCode:    string
  courseName:    string
  cfu:           number
  courseYear:    number
  semester:      number
  grade:         string
  gradeStatus:   string
  publishedAt:   string | null
  examDate:      string | null
  teacherName:   string
}

export async function getStudentDashboard(userId: string): Promise<DashboardData | null> {
  // Récupérer le profil + email
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) return null

  const { data: authUser } = await supabase.auth.admin.getUserById(userId)
  const email = authUser?.user?.email ?? ''

  const { data, error } = await supabase
    .from('student_dashboard')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) return null

  return {
    studentId:        data.student_id as string,
    matricola:        data.matricola as string | null,
    fullName:         data.full_name as string,
    degreeProgram:    data.degree_program as string,
    totalCfu:         data.total_cfu as number,
    totalCfuEarned:   data.total_cfu_earned as number,
    cfuProgressPct:   data.cfu_progress_pct as number ?? 0,
    gpa:              data.gpa as number,
    currentYear:      data.current_year as number,
    enrollmentYear:   data.enrollment_year as number,
    status:           data.status as string,
    nextExamDate:     data.next_exam_date as string | null,
    pendingFeesTotal: data.pending_fees_total as number,
  }
}

export async function getStudentGrades(
  userId: string,
  filters: { semester?: number; courseYear?: number } = {},
): Promise<LibrettoEntry[]> {
  const { data: student } = await supabase
    .from('students')
    .select('matricola')
    .eq('user_id', userId)
    .single()

  if (!student?.matricola) return []

  let query = supabase
    .from('libretto')
    .select('*')
    .eq('matricola', student.matricola)

  if (filters.semester)   query = query.eq('semester', filters.semester)
  if (filters.courseYear) query = query.eq('course_year', filters.courseYear)

  const { data, error } = await query.order('exam_date', { ascending: false })
  if (error || !data) return []

  return (data as Record<string, unknown>[]).map((r) => ({
    id:          r.id as string,
    courseCode:  r.course_code as string,
    courseName:  r.course_name as string,
    cfu:         r.cfu as number,
    courseYear:  r.course_year as number,
    semester:    r.semester as number,
    grade:       r.grade as string,
    gradeStatus: r.grade_status as string,
    publishedAt: r.published_at as string | null,
    examDate:    r.exam_date as string | null,
    teacherName: r.teacher_name as string,
  }))
}

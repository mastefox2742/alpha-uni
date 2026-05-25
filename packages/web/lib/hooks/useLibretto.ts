'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface LibrettoEntry {
  id:            string
  matricola:     string
  studentName:   string
  degreeProgram: string
  degreeType:    string
  courseCode:    string
  courseName:    string
  cfu:           number
  courseYear:    number
  semester:      number
  grade:         string      // "30L", "28", etc.
  gradeStatus:   string
  publishedAt:   string | null
  examDate:      string | null
  teacherName:   string
}

export interface LibrettoFilters {
  semester?: 1 | 2
  courseYear?: number
}

async function fetchLibretto(filters: LibrettoFilters): Promise<LibrettoEntry[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Récupérer le student_id
  const { data: student } = await supabase
    .from('students')
    .select('id, matricola')
    .eq('user_id', user.id)
    .single()

  if (!student) return []

  let query = supabase
    .from('libretto')
    .select('*')
    .eq('matricola', student.matricola)

  if (filters.semester)   query = query.eq('semester', filters.semester)
  if (filters.courseYear) query = query.eq('course_year', filters.courseYear)

  const { data, error } = await query.order('exam_date', { ascending: false })
  if (error || !data) return []

  return (data as Record<string, unknown>[]).map((r) => ({
    id:            r.id as string,
    matricola:     r.matricola as string,
    studentName:   r.student_name as string,
    degreeProgram: r.degree_program as string,
    degreeType:    r.degree_type as string,
    courseCode:    r.course_code as string,
    courseName:    r.course_name as string,
    cfu:           r.cfu as number,
    courseYear:    r.course_year as number,
    semester:      r.semester as number,
    grade:         r.grade as string,
    gradeStatus:   r.grade_status as string,
    publishedAt:   r.published_at as string | null,
    examDate:      r.exam_date as string | null,
    teacherName:   r.teacher_name as string,
  }))
}

export function useLibretto(filters: LibrettoFilters = {}) {
  return useQuery({
    queryKey: ['student', 'libretto', filters],
    queryFn:  () => fetchLibretto(filters),
    staleTime: 5 * 60 * 1000,
  })
}

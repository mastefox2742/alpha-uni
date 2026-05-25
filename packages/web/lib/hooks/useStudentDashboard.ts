'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface DashboardData {
  studentId:       string
  matricola:       string | null
  fullName:        string
  email:           string
  degreeProgram:   string
  totalCfu:        number
  totalCfuEarned:  number
  cfuProgressPct:  number
  gpa:             number
  currentYear:     number
  enrollmentYear:  number
  status:          string
  nextExamDate:    string | null
  pendingFeesTotal: number
}

async function fetchDashboard(): Promise<DashboardData | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('student_dashboard')
    .select('*')
    .eq('email', user.email)
    .single()

  if (error || !data) return null

  return {
    studentId:        data.student_id as string,
    matricola:        data.matricola as string | null,
    fullName:         data.full_name as string,
    email:            data.email as string,
    degreeProgram:    data.degree_program as string,
    totalCfu:         data.total_cfu as number,
    totalCfuEarned:   data.total_cfu_earned as number,
    cfuProgressPct:   data.cfu_progress_pct as number,
    gpa:              data.gpa as number,
    currentYear:      data.current_year as number,
    enrollmentYear:   data.enrollment_year as number,
    status:           data.status as string,
    nextExamDate:     data.next_exam_date as string | null,
    pendingFeesTotal: data.pending_fees_total as number,
  }
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn:  fetchDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

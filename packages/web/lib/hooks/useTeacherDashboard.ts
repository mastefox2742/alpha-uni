'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface TeacherDashboardData {
  teacher_id:     string
  full_name:      string
  department:     string
  title:          string
  total_courses:  number
  total_students: number
  pending_grades: number
}

export function useTeacherDashboard() {
  const supabase = createClient()

  return useQuery<TeacherDashboardData | null>({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Récupérer l'ID teacher
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!teacher) return null

      const { data } = await supabase
        .from('teacher_dashboard')
        .select('*')
        .eq('teacher_id', teacher.id)
        .single()

      return data ?? null
    },
    staleTime: 1000 * 60 * 2,
  })
}

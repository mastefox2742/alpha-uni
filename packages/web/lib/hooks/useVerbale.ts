'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface GradeEntry {
  id:           string
  value:        number | null
  is_honors:    boolean
  status:       string
  notes:        string | null
  accepted_at:  string | null
  rejected_at:  string | null
  published_at: string | null
}

interface BookingEntry {
  id:         string
  status:     string
  booked_at:  string
  students: {
    id:       string
    matricola: string | null
    profiles: { first_name: string; last_name: string; email: string } | null
  } | null
  grades: GradeEntry[]
}

interface VerbaleData {
  session: {
    id:    string
    date:  string
    notes: string | null
    courses: {
      id: string; name: string; code: string; cfu: number
      teachers: { id: string; profiles: { first_name: string; last_name: string } | null } | null
    } | null
  }
  bookings: BookingEntry[]
}

async function getSessionToken() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export function useVerbale(examId: string) {
  return useQuery<VerbaleData | null>({
    queryKey: ['verbale', examId],
    queryFn: async () => {
      const token = await getSessionToken()
      if (!token) return null

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/grades/exams/${examId}/verbale`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) throw new Error('Erreur chargement verbale')
      const json = await res.json()
      return json.data ?? null
    },
    enabled: !!examId,
    staleTime: 0,
  })
}

export function useProposeGrade(examId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      bookingId: string
      value:     number
      isHonors:  boolean
      notes?:    string
    }) => {
      const token = await getSessionToken()
      if (!token) throw new Error('Non authentifié')

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/grades/exams/${examId}/grades`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        },
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erreur proposition note')
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['verbale', examId] }),
  })
}

export function usePublishVerbale(examId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = await getSessionToken()
      if (!token) throw new Error('Non authentifié')

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/grades/exams/${examId}/publish`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erreur publication verbale')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['verbale', examId] })
      qc.invalidateQueries({ queryKey: ['teacher-dashboard'] })
    },
  })
}

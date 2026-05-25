'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

async function getToken() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

export function useAvailableExams() {
  return useQuery({
    queryKey: ['exams-available'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return []
      const res = await fetch(`${API}/api/exams/available`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement examens')
      const json = await res.json()
      return json.data ?? []
    },
    staleTime: 1000 * 60,
  })
}

export function useMyBookings() {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return []
      const res = await fetch(`${API}/api/exams/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement prénotations')
      const json = await res.json()
      return json.data ?? []
    },
    staleTime: 1000 * 60,
  })
}

export function useBookExam() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (examId: string) => {
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')

      const res = await fetch(`${API}/api/exams/${examId}/book`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erreur prénotation')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exams-available'] })
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      qc.invalidateQueries({ queryKey: ['student-dashboard'] })
    },
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (examId: string) => {
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')

      const res = await fetch(`${API}/api/exams/${examId}/book`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erreur annulation')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exams-available'] })
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      qc.invalidateQueries({ queryKey: ['student-dashboard'] })
    },
  })
}

export function usePendingGrades() {
  return useQuery({
    queryKey: ['pending-grades'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return []
      const res = await fetch(`${API}/api/grades/me/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement notes')
      const json = await res.json()
      return json.data ?? []
    },
    staleTime: 1000 * 30,
  })
}

export function useRespondToGrade() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ gradeId, accept }: { gradeId: string; accept: boolean }) => {
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')

      const action = accept ? 'accept' : 'refuse'
      const res = await fetch(`${API}/api/grades/${gradeId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erreur réponse note')
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-grades'] })
      qc.invalidateQueries({ queryKey: ['student-dashboard'] })
    },
  })
}

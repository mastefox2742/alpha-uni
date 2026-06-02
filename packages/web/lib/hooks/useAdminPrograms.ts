'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const API  = process.env.NEXT_PUBLIC_API_URL ?? ''
const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

async function getToken() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

// ─── Demo data (minimal — les composants ont leurs propres DEMO_DATA inline) ──

const DEMO_PROGRAM_LIST = [
  { id: 'LIC-INFO',  name: 'Licence Informatique',         code: 'LIC-INFO',  level: 'L1-L2-L3', department: 'Informatique', director: 'Prof. Jean Martin',     totalStudents: 342, retentionRate: 78, avgGradYears: 3.4, trend: [290, 310, 325, 342] },
  { id: 'MST-INFO',  name: 'Master Informatique',          code: 'MST-INFO',  level: 'M1-M2',     department: 'Informatique', director: 'Prof. Sophie Renard',   totalStudents: 156, retentionRate: 85, avgGradYears: 2.1, trend: [130, 140, 148, 156] },
  { id: 'LIC-MATH',  name: 'Licence Mathématiques',        code: 'LIC-MATH',  level: 'L1-L2-L3', department: 'Mathématiques', director: 'Prof. Pierre Dumont',  totalStudents: 201, retentionRate: 72, avgGradYears: 3.6, trend: [220, 215, 208, 201] },
  { id: 'MST-DS',    name: 'Master Sciences des Données',  code: 'MST-DS',    level: 'M1-M2',     department: 'Informatique', director: 'Dr. Fatima Benali',     totalStudents: 89,  retentionRate: 91, avgGradYears: 2.0, trend: [55, 68, 78, 89] },
  { id: 'LIC-GC',    name: 'Licence Génie Civil',          code: 'LIC-GC',    level: 'L1-L2-L3', department: 'Génie Civil',  director: 'Prof. Antoine Dubois', totalStudents: 178, retentionRate: 68, avgGradYears: 3.8, trend: [190, 185, 182, 178] },
  { id: 'DOC-INFO',  name: 'Doctorat Informatique',        code: 'DOC-INFO',  level: 'Doctorat',  department: 'Informatique', director: 'Prof. Jean Martin',     totalStudents: 24,  retentionRate: 94, avgGradYears: 4.2, trend: [18, 20, 22, 24] },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function usePrograms() {
  return useQuery({
    queryKey: ['admin-programs'],
    queryFn:  async () => {
      if (DEMO) return DEMO_PROGRAM_LIST
      const token = await getToken()
      if (!token) return []
      const res = await fetch(`${API}/api/programs`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Erreur chargement filières')
      return (await res.json()).data ?? []
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useProgramStudents(programId: string | null, atRisk = false) {
  return useQuery({
    queryKey: ['admin-program-students', programId, atRisk],
    enabled:  !!programId,
    queryFn:  async () => {
      if (DEMO) return []  // Les composants utilisent leurs propres DEMO_STUDENTS
      const token = await getToken()
      if (!token) return []
      const params = atRisk ? '?atRisk=true' : ''
      const res = await fetch(`${API}/api/programs/${programId}/students${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement étudiants')
      return (await res.json()).data ?? []
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useProgramTeachers(programId: string | null) {
  return useQuery({
    queryKey: ['admin-program-teachers', programId],
    enabled:  !!programId,
    queryFn:  async () => {
      if (DEMO) return []
      const token = await getToken()
      if (!token) return []
      const res = await fetch(`${API}/api/programs/${programId}/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement enseignants')
      return (await res.json()).data ?? []
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useProgramCurriculum(programId: string | null) {
  return useQuery({
    queryKey: ['admin-program-curriculum', programId],
    enabled:  !!programId,
    queryFn:  async () => {
      if (DEMO) return []
      const token = await getToken()
      if (!token) return []
      const res = await fetch(`${API}/api/programs/${programId}/curriculum`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement maquette')
      return (await res.json()).data ?? []
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useProgramExams(programId: string | null) {
  return useQuery({
    queryKey: ['admin-program-exams', programId],
    enabled:  !!programId,
    queryFn:  async () => {
      if (DEMO) return []
      const token = await getToken()
      if (!token) return []
      const res = await fetch(`${API}/api/programs/${programId}/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement examens')
      return (await res.json()).data ?? []
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function useProgramKpis(programId: string | null) {
  return useQuery({
    queryKey: ['admin-program-kpis', programId],
    enabled:  !!programId,
    queryFn:  async () => {
      if (DEMO) return []
      const token = await getToken()
      if (!token) return []
      const res = await fetch(`${API}/api/programs/${programId}/kpis`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement KPIs')
      return (await res.json()).data ?? []
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useUpdateSyllabus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ unitId, complete, syllabusUrl }: {
      unitId: string; complete: boolean; syllabusUrl?: string
    }) => {
      if (DEMO) return { id: unitId, syllabus_complete: complete }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/programs/curriculum/${unitId}/syllabus`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ complete, syllabusUrl }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: (_d, { unitId }) => {
      qc.invalidateQueries({ queryKey: ['admin-program-curriculum'] })
      qc.invalidateQueries({ queryKey: ['admin-programs'] })
      void unitId
    },
  })
}

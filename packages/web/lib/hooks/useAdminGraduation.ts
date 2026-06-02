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

// ─── Demo data ────────────────────────────────────────────────────────────────

export type GradStatus =
  | 'pending' | 'eligible' | 'jury_incomplete' | 'jury_complete'
  | 'defended' | 'diploma_issued' | 'blocked'

export interface JuryMember {
  id:        string
  name:      string
  role:      'president' | 'rapporteur' | 'examiner' | 'supervisor' | 'external'
  confirmed: boolean
}

export interface GradApplication {
  id:               string
  studentName:      string
  matricule:        string
  program:          string
  cfuAcquired:      number
  cfuRequired:      number
  balanceDue:       number
  status:           GradStatus
  defenseDate:      string | null
  diplomaNumber:    string | null
  diplomaIssuedAt:  string | null
  jury:             JuryMember[]
  notes:            string | null
}

const DEMO_APPS: GradApplication[] = [
  {
    id: 'ga1', studentName: 'Amélie Gros', matricule: 'MAT20220011',
    program: 'Master Informatique (M2)', cfuAcquired: 120, cfuRequired: 120,
    balanceDue: 0, status: 'jury_incomplete', defenseDate: '2026-07-10', diplomaNumber: null, diplomaIssuedAt: null,
    notes: null,
    jury: [
      { id: 'j1', name: 'Prof. Bernard Durand', role: 'president',  confirmed: true  },
      { id: 'j2', name: 'Dr. Marie Faure',       role: 'supervisor', confirmed: true  },
    ],
  },
  {
    id: 'ga2', studentName: 'Mohamed Ait Youssef', matricule: 'MAT20220034',
    program: 'Master Informatique (M2)', cfuAcquired: 120, cfuRequired: 120,
    balanceDue: 0, status: 'jury_incomplete', defenseDate: '2026-07-12', diplomaNumber: null, diplomaIssuedAt: null,
    notes: null,
    jury: [
      { id: 'j3', name: 'Prof. Pierre Legrand', role: 'president', confirmed: true },
    ],
  },
  {
    id: 'ga3', studentName: 'Louise Bertrand', matricule: 'MAT20220078',
    program: 'Master Sciences des Données (M2)', cfuAcquired: 120, cfuRequired: 120,
    balanceDue: 0, status: 'eligible', defenseDate: '2026-07-15', diplomaNumber: null, diplomaIssuedAt: null,
    notes: null,
    jury: [],
  },
  {
    id: 'ga4', studentName: 'Carlos Rivera', matricule: 'MAT20220099',
    program: 'Licence Informatique (L3)', cfuAcquired: 172, cfuRequired: 180,
    balanceDue: 0, status: 'blocked', defenseDate: null, diplomaNumber: null, diplomaIssuedAt: null,
    notes: 'CFU insuffisants — 8 CFU manquants',
    jury: [],
  },
  {
    id: 'ga5', studentName: 'Sophie Marchand', matricule: 'MAT20210055',
    program: 'Master Informatique (M2)', cfuAcquired: 120, cfuRequired: 120,
    balanceDue: 350, status: 'blocked', defenseDate: null, diplomaNumber: null, diplomaIssuedAt: null,
    notes: 'Solde impayé — 350€',
    jury: [],
  },
  {
    id: 'ga6', studentName: 'Thomas Blanc', matricule: 'MAT20210012',
    program: 'Master Génie Civil (M2)', cfuAcquired: 120, cfuRequired: 120,
    balanceDue: 0, status: 'diploma_issued', defenseDate: '2026-03-15',
    diplomaNumber: 'DIPL-2026-48271', diplomaIssuedAt: '2026-03-20T10:00:00Z',
    notes: null,
    jury: [
      { id: 'j4', name: 'Prof. Alain Moreau', role: 'president',  confirmed: true },
      { id: 'j5', name: 'Dr. Claire Simon',   role: 'supervisor', confirmed: true },
      { id: 'j6', name: 'M. Jacques Leroy',   role: 'examiner',   confirmed: true },
    ],
  },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGraduationApplications(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: ['admin-graduation', filters],
    queryFn:  async () => {
      if (DEMO) {
        let apps = DEMO_APPS
        if (filters.status) apps = apps.filter(a => a.status === filters.status)
        return apps
      }
      const token = await getToken()
      if (!token) return []
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      const res = await fetch(`${API}/api/graduation?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Erreur chargement demandes')
      return (await res.json()).data ?? []
    },
    staleTime: 1000 * 60,
  })
}

export function useAddJuryMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { applicationId: string; name: string; role: string; teacherId?: string }) => {
      if (DEMO) return { id: `j-${Date.now()}`, ...input, confirmed: false }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/graduation/${input.applicationId}/jury`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(input),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-graduation'] }),
  })
}

export function useRemoveJuryMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ applicationId, memberId }: { applicationId: string; memberId: string }) => {
      if (DEMO) return { message: 'Membre supprimé (démo)' }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/graduation/${applicationId}/jury/${memberId}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-graduation'] }),
  })
}

export function useSetDefenseDate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ applicationId, defenseDate, roomId }: {
      applicationId: string; defenseDate: string; roomId?: string
    }) => {
      if (DEMO) return { applicationId, defenseDate }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/graduation/${applicationId}/defense`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ defenseDate, roomId }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-graduation'] }),
  })
}

export function useGenerateDiploma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (applicationId: string) => {
      if (DEMO) {
        const year = new Date().getFullYear()
        const rand = Math.floor(Math.random() * 90000) + 10000
        return { diplomaNumber: `DIPL-${year}-${rand}`, message: 'Diplôme généré avec succès' }
      }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/graduation/${applicationId}/diploma`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-graduation'] }),
  })
}

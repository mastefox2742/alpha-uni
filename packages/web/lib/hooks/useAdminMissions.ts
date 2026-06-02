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

export type MissionStatus = 'draft' | 'pending' | 'approved' | 'refused' | 'paid'

export interface ExpenseLine {
  id:     string
  label:  string
  amount: number
}

export interface Mission {
  id:             string
  teacherName:    string
  department:     string
  destination:    string
  purpose:        string
  startDate:      string
  endDate:        string
  status:         MissionStatus
  totalAmount:    number
  expenses:       ExpenseLine[]
  refusalReason:  string | null
  paymentRef:     string | null
  approvedAt:     string | null
}

const DEMO_MISSIONS: Mission[] = [
  {
    id: 'm1', teacherName: 'Prof. Jean Martin', department: 'Informatique',
    destination: 'Paris — Conférence IEEE', purpose: 'Présentation article recherche',
    startDate: '2026-06-10', endDate: '2026-06-13', status: 'pending', totalAmount: 1240,
    expenses: [
      { id: 'e1', label: 'Transport (TGV aller-retour)', amount: 340 },
      { id: 'e2', label: 'Hébergement 3 nuits',          amount: 630 },
      { id: 'e3', label: 'Inscription conférence',        amount: 270 },
    ],
    refusalReason: null, paymentRef: null, approvedAt: null,
  },
  {
    id: 'm2', teacherName: 'Dr. Fatima Benali', department: 'Mathématiques',
    destination: 'Lyon — Séminaire pédagogique', purpose: 'Formation méthodes actives',
    startDate: '2026-05-20', endDate: '2026-05-21', status: 'pending', totalAmount: 420,
    expenses: [
      { id: 'e4', label: 'Transport',     amount: 120 },
      { id: 'e5', label: 'Hébergement',   amount: 210 },
      { id: 'e6', label: 'Restauration',  amount: 90  },
    ],
    refusalReason: null, paymentRef: null, approvedAt: null,
  },
  {
    id: 'm3', teacherName: 'Prof. Antoine Dubois', department: 'Génie Civil',
    destination: 'Marseille — Expertise terrain', purpose: 'Expertise géotechnique chantier',
    startDate: '2026-04-14', endDate: '2026-04-15', status: 'approved', totalAmount: 580,
    expenses: [
      { id: 'e7', label: 'Déplacement voiture',  amount: 180 },
      { id: 'e8', label: 'Hébergement',           amount: 200 },
      { id: 'e9', label: 'Frais de mission',      amount: 200 },
    ],
    refusalReason: null, paymentRef: null, approvedAt: '2026-04-10T09:00:00Z',
  },
  {
    id: 'm4', teacherName: 'Dr. Layla Hamidi', department: 'Physique',
    destination: 'Bordeaux — Congrès Physique', purpose: 'Présentation poster',
    startDate: '2026-03-05', endDate: '2026-03-07', status: 'paid', totalAmount: 890,
    expenses: [
      { id: 'e10', label: 'Avion A/R',       amount: 490 },
      { id: 'e11', label: 'Hébergement',     amount: 280 },
      { id: 'e12', label: 'Per diem',        amount: 120 },
    ],
    refusalReason: null, paymentRef: 'VIR-2026-0312', approvedAt: '2026-02-28T14:00:00Z',
  },
  {
    id: 'm5', teacherName: 'M. Omar Tazi', department: 'Langues',
    destination: 'Nantes — Formation FLE', purpose: 'Formation didactique FLE',
    startDate: '2026-02-18', endDate: '2026-02-19', status: 'refused', totalAmount: 360,
    expenses: [
      { id: 'e13', label: 'Transport', amount: 160 },
      { id: 'e14', label: 'Hôtel',     amount: 200 },
    ],
    refusalReason: 'Budget missions épuisé pour ce trimestre — reporter en T3',
    paymentRef: null, approvedAt: null,
  },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAdminMissions(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: ['admin-missions', filters],
    queryFn:  async () => {
      if (DEMO) {
        let missions = DEMO_MISSIONS
        if (filters.status) missions = missions.filter(m => m.status === filters.status)
        return missions
      }
      const token = await getToken()
      if (!token) return []
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      const res = await fetch(`${API}/api/missions?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Erreur chargement missions')
      return (await res.json()).data ?? []
    },
    staleTime: 1000 * 60,
  })
}

export function useMissionStats() {
  return useQuery({
    queryKey: ['admin-missions-stats'],
    queryFn:  async () => {
      if (DEMO) {
        const stats = { pending: 0, approved: 0, refused: 0, paid: 0 }
        for (const m of DEMO_MISSIONS) {
          if (m.status in stats) (stats[m.status as keyof typeof stats] as number)++
        }
        const totalBudget = DEMO_MISSIONS
          .filter(m => m.status === 'paid')
          .reduce((s, m) => s + m.totalAmount, 0)
        return { ...stats, totalBudget }
      }
      const token = await getToken()
      if (!token) return null
      const res = await fetch(`${API}/api/missions/stats`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Erreur stats')
      return (await res.json()).data
    },
    staleTime: 1000 * 60,
  })
}

export function useApproveMission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (missionId: string) => {
      if (DEMO) return { status: 'approved', message: 'Mission approuvée (démo)' }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/missions/${missionId}/approve`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-missions'] }),
  })
}

export function useRefuseMission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ missionId, reason }: { missionId: string; reason: string }) => {
      if (DEMO) return { status: 'refused', reason }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/missions/${missionId}/refuse`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ reason }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-missions'] }),
  })
}

export function useMarkMissionPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ missionId, paymentRef }: { missionId: string; paymentRef: string }) => {
      if (DEMO) return { status: 'paid', paymentRef }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/missions/${missionId}/pay`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ paymentRef }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-missions'] }),
  })
}

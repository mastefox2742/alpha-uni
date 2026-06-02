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

type EventType = 'semester' | 'exam_session' | 'holiday' | 'resit' | 'deadline' | 'event'

interface CalendarEvent {
  id:         string
  title:      string
  type:       EventType
  start_date: string
  end_date:   string
  is_locked:  boolean
  description?: string
}

const DEMO_EVENTS: CalendarEvent[] = [
  { id: 'ev1', title: 'Semestre 1 2025-2026',          type: 'semester',     start_date: '2025-09-15', end_date: '2026-01-10', is_locked: true,  description: 'Cours du S1 — 15 semaines' },
  { id: 'ev2', title: 'Vacances de Toussaint',          type: 'holiday',      start_date: '2025-10-27', end_date: '2025-11-03', is_locked: true },
  { id: 'ev3', title: 'Vacances de Noël',               type: 'holiday',      start_date: '2025-12-22', end_date: '2026-01-04', is_locked: true },
  { id: 'ev4', title: 'Session d\'examens S1',          type: 'exam_session', start_date: '2026-01-12', end_date: '2026-01-30', is_locked: true,  description: '3 semaines d\'examens finals' },
  { id: 'ev5', title: 'Semestre 2 2025-2026',           type: 'semester',     start_date: '2026-02-02', end_date: '2026-05-29', is_locked: true,  description: 'Cours du S2 — 16 semaines' },
  { id: 'ev6', title: 'Vacances de Printemps',          type: 'holiday',      start_date: '2026-04-06', end_date: '2026-04-19', is_locked: true },
  { id: 'ev7', title: 'Session d\'examens S2',          type: 'exam_session', start_date: '2026-06-01', end_date: '2026-06-20', is_locked: false, description: 'Session principale S2' },
  { id: 'ev8', title: 'Clôture préinscriptions 2026-27',type: 'deadline',     start_date: '2026-06-07', end_date: '2026-06-07', is_locked: false },
  { id: 'ev9', title: 'Session de rattrapage',          type: 'resit',        start_date: '2026-07-01', end_date: '2026-07-15', is_locked: false, description: 'Rattrapages S1 + S2' },
  { id: 'ev10',title: 'Cérémonie de Lauréat 2026',     type: 'event',        start_date: '2026-07-20', end_date: '2026-07-20', is_locked: false },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAcademicEvents(filters: { type?: string } = {}) {
  return useQuery({
    queryKey: ['admin-calendar', filters],
    queryFn:  async () => {
      if (DEMO) {
        let events = DEMO_EVENTS
        if (filters.type) events = events.filter(e => e.type === filters.type)
        return events
      }
      const token = await getToken()
      if (!token) return []
      const params = new URLSearchParams({ universityId: 'demo-uni' })
      if (filters.type) params.set('type', filters.type)
      const res = await fetch(`${API}/api/calendar?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Erreur chargement calendrier')
      return (await res.json()).data ?? []
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpcomingEvents(limit = 5) {
  return useQuery({
    queryKey: ['admin-calendar-upcoming', limit],
    queryFn:  async () => {
      if (DEMO) {
        const today = new Date().toISOString().split('T')[0]!
        return DEMO_EVENTS
          .filter(e => e.end_date >= today)
          .sort((a, b) => a.start_date.localeCompare(b.start_date))
          .slice(0, limit)
      }
      const token = await getToken()
      if (!token) return []
      const params = new URLSearchParams({ universityId: 'demo-uni', limit: String(limit) })
      const res = await fetch(`${API}/api/calendar/upcoming?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Erreur')
      return (await res.json()).data ?? []
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<CalendarEvent, 'id'>) => {
      if (DEMO) return { id: `ev-${Date.now()}`, ...input }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/calendar`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(input),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-calendar'] }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      if (DEMO) return { id, ...updates }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/calendar/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(updates),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-calendar'] }),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (eventId: string) => {
      if (DEMO) return { message: 'Événement supprimé (démo)' }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/calendar/${eventId}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-calendar'] }),
  })
}

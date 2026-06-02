'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const API      = process.env.NEXT_PUBLIC_API_URL ?? ''
const DEMO     = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

async function getToken() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_ROOMS = [
  {
    id: 'r1', name: 'Amphi A', building: 'RDC', capacity: 250,
    has_projector: true, type: 'amphitheater', status: 'available',
    bookings: [
      { id: 'b1', title: 'CM Architecture S2', day: '2026-05-27', start_time: '08:00', end_time: '10:00', status: 'confirmed' },
      { id: 'b2', title: 'Soutenance Thèse',    day: '2026-05-27', start_time: '14:00', end_time: '16:00', status: 'confirmed' },
    ],
  },
  {
    id: 'r2', name: 'Amphi B', building: '1er', capacity: 180,
    has_projector: true, type: 'amphitheater', status: 'occupied',
    bookings: [
      { id: 'b3', title: 'Examen Algo S2', day: '2026-05-27', start_time: '09:00', end_time: '12:00', status: 'confirmed' },
      { id: 'b4', title: 'Cours Réseaux',  day: '2026-05-28', start_time: '10:00', end_time: '12:00', status: 'confirmed' },
    ],
  },
  {
    id: 'r3', name: 'Salle 301', building: '3ème', capacity: 35,
    has_projector: false, type: 'classroom', status: 'available',
    bookings: [
      { id: 'b5', title: 'TD Maths', day: '2026-05-28', start_time: '13:00', end_time: '15:00', status: 'confirmed' },
    ],
  },
  {
    id: 'r4', name: 'Labo Informatique 1', building: '2ème', capacity: 24,
    has_projector: false, type: 'lab', status: 'available',
    bookings: [],
  },
  {
    id: 'r5', name: 'Salle de Soutenance A', building: 'RDC', capacity: 15,
    has_projector: true, type: 'soutenance', status: 'available',
    bookings: [
      { id: 'b6', title: 'Jury Lauréa — Amélie Gros', day: '2026-07-10', start_time: '10:00', end_time: '12:00', status: 'confirmed' },
    ],
  },
  {
    id: 'r6', name: 'Salle 205', building: '2ème', capacity: 40,
    has_projector: true, type: 'classroom', status: 'available',
    bookings: [],
  },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAdminRooms() {
  return useQuery({
    queryKey: ['admin-rooms'],
    queryFn:  async () => {
      if (DEMO) return DEMO_ROOMS
      const token = await getToken()
      if (!token) return []
      const res = await fetch(`${API}/api/rooms`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Erreur chargement salles')
      return (await res.json()).data ?? []
    },
    staleTime: 1000 * 60,
  })
}

export function useRoomDetail(roomId: string | null) {
  return useQuery({
    queryKey: ['admin-room', roomId],
    enabled:  !!roomId,
    queryFn:  async () => {
      if (DEMO) return DEMO_ROOMS.find(r => r.id === roomId) ?? null
      const token = await getToken()
      if (!token) return null
      const res = await fetch(`${API}/api/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('Erreur chargement salle')
      return (await res.json()).data
    },
    staleTime: 1000 * 30,
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      classroomId: string; title: string; day: string
      startTime: string; endTime: string; notes?: string
    }) => {
      if (DEMO) {
        // Simulation anti-collision en demo
        const room = DEMO_ROOMS.find(r => r.id === input.classroomId)
        const conflict = room?.bookings.some(b =>
          b.day === input.day &&
          !(input.endTime <= b.start_time || input.startTime >= b.end_time),
        )
        if (conflict) throw new Error('Créneau déjà réservé — conflit de planning détecté')
        return { id: `b-demo-${Date.now()}`, ...input, status: 'confirmed' }
      }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/rooms/bookings`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(input),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-rooms'] }),
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (DEMO) return { message: 'Réservation annulée (démo)' }
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/rooms/bookings/${bookingId}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return (await res.json()).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-rooms'] }),
  })
}

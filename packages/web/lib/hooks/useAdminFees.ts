'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

async function getToken() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export function useAdminFees(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: ['admin-fees', filters],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return []

      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)

      const res = await fetch(`${API}/api/fees?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement frais')
      const json = await res.json()
      return json.data ?? []
    },
    staleTime: 1000 * 60,
  })
}

export function useMarkFeePaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      feeId, paymentRef, method, amount,
    }: {
      feeId: string; paymentRef: string; method: string; amount: number
    }) => {
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/fees/${feeId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentRef, method, amount }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-fees'] }),
  })
}

export function useWaiveFee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ feeId, reason }: { feeId: string; reason?: string }) => {
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const res = await fetch(`${API}/api/fees/${feeId}/waive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-fees'] }),
  })
}

export function useIssueCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      studentId, type, expiresAt,
    }: {
      studentId: string; type: string; expiresAt?: string
    }) => {
      const token = await getToken()
      if (!token) throw new Error('Non authentifié')
      const body: Record<string, string> = { studentId, type }
      if (expiresAt) body.expiresAt = expiresAt

      const res = await fetch(`${API}/api/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-certificates'] }),
  })
}

export function useAdminCertificates(filters: { type?: string } = {}) {
  return useQuery({
    queryKey: ['admin-certificates', filters],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return []

      const params = new URLSearchParams()
      if (filters.type) params.set('type', filters.type)

      const res = await fetch(`${API}/api/certificates?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur')
      const json = await res.json()
      return json.data ?? []
    },
    staleTime: 1000 * 60 * 2,
  })
}

'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

async function getToken() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export interface CertEntry {
  id:            string
  type:          string
  issued_at:     string
  expires_at:    string | null
  serial_number: string | null
  file_url:      string | null
  secretaries:   { profiles: { first_name: string; last_name: string } | null } | null
}

export function useStudentCertificates() {
  return useQuery<CertEntry[]>({
    queryKey: ['student-certificates'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return []

      const res = await fetch(`${API}/api/certificates/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur chargement certificats')
      const json = await res.json()
      return json.data ?? []
    },
    staleTime: 1000 * 60 * 5,
  })
}

import { supabase } from './supabase'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? ''

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${session?.access_token ?? ''}`,
      ...(options?.headers ?? {}),
    },
  })

  const json = await res.json() as { data?: T; error?: string }
  if (!res.ok) throw new Error(json.error ?? `Erreur ${res.status}`)
  return json.data as T
}

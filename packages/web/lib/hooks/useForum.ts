import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const API = process.env.NEXT_PUBLIC_API_URL ?? ''

async function apiFetch(path: string, options?: RequestInit) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${session?.access_token ?? ''}`,
      ...(options?.headers ?? {}),
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Erreur serveur')
  return json.data
}

export function useForumPosts(ecId: string | null) {
  return useQuery({
    queryKey: ['forum', ecId],
    queryFn:  () => apiFetch(`/api/forum/courses/${ecId}`),
    enabled:  !!ecId,
    refetchInterval: 15_000, // Rafraîchissement auto toutes les 15s
  })
}

export function useCreateForumPost(ecId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { content: string; parentId?: string }) => {
      const payload: { content: string; parentId?: string } = { content: body.content }
      if (body.parentId !== undefined) payload.parentId = body.parentId
      return apiFetch(`/api/forum/courses/${ecId}`, { method: 'POST', body: JSON.stringify(payload) })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', ecId] }),
  })
}

export function usePinPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, isPinned }: { postId: string; isPinned: boolean }) =>
      apiFetch(`/api/forum/posts/${postId}/pin`, { method: 'POST', body: JSON.stringify({ isPinned }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum'] }),
  })
}

export function useDeleteForumPost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) =>
      apiFetch(`/api/forum/posts/${postId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum'] }),
  })
}

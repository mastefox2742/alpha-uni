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

export function useQuiz(quizId: string | null) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn:  () => apiFetch(`/api/quiz/${quizId}`),
    enabled:  !!quizId,
  })
}

export function useCreateQuiz(ecId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      title: string; description?: string
      timeLimitMin?: number; passScore?: number; maxAttempts?: number
    }) => apiFetch(`/api/quiz/courses/${ecId}`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['elearning-teacher'] }),
  })
}

export function useUpdateQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ quizId, body }: { quizId: string; body: Record<string, unknown> }) =>
      apiFetch(`/api/quiz/${quizId}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: (_d, { quizId }) => {
      qc.invalidateQueries({ queryKey: ['quiz', quizId] })
      qc.invalidateQueries({ queryKey: ['elearning-teacher'] })
    },
  })
}

export function useDeleteQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (quizId: string) => apiFetch(`/api/quiz/${quizId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['elearning-teacher'] }),
  })
}

export function useCreateQuestion(quizId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      question: string; type: string; points?: number
      options?: { text: string; isCorrect: boolean }[]
    }) => apiFetch(`/api/quiz/${quizId}/questions`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quiz', quizId] }),
  })
}

export function useDeleteQuestion(quizId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (questionId: string) =>
      apiFetch(`/api/quiz/questions/${questionId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quiz', quizId] }),
  })
}

// ─── Étudiant ─────────────────────────────────────────────────────────────────

export function useQuizAttempts(quizId: string | null) {
  return useQuery({
    queryKey: ['quiz-attempts', quizId],
    queryFn:  () => apiFetch(`/api/quiz/${quizId}/attempts`),
    enabled:  !!quizId,
  })
}

export function useStartQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (quizId: string) =>
      apiFetch(`/api/quiz/${quizId}/start`, { method: 'POST' }),
    onSuccess: (_d, quizId) => qc.invalidateQueries({ queryKey: ['quiz-attempts', quizId] }),
  })
}

export function useSubmitQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      attemptId, answers,
    }: {
      attemptId: string
      answers: { questionId: string; selectedOptionIds?: string[]; openAnswer?: string }[]
    }) =>
      apiFetch(`/api/quiz/attempts/${attemptId}/submit`, {
        method: 'POST', body: JSON.stringify({ answers }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quiz-attempts'] }),
  })
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ── Demo user (utilisé quand NEXT_PUBLIC_DEMO_MODE=true) ──
const DEMO_USER = {
  id: 'demo-student-id',
  email: 'demo.etudiant@unigest.fr',
  role: 'authenticated',
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as const

const DEMO_PROFILE = {
  id: 'demo-student-id',
  role: 'student',
  first_name: 'Demo',
  last_name: 'Étudiant',
} as const

const DEMO_STUDENT = { matricola: 'M-2024-001' } as const

function createDemoClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: (table: string) => {
      const chain: Record<string, unknown> = {}
      const builder = {
        select: () => builder,
        eq: () => builder,
        neq: () => builder,
        in: () => builder,
        is: () => builder,
        order: () => builder,
        limit: () => builder,
        single: async () => {
          if (table === 'profiles') return { data: { ...DEMO_PROFILE }, error: null }
          if (table === 'students') return { data: { ...DEMO_STUDENT }, error: null }
          return { data: null, error: null }
        },
        maybeSingle: async () => {
          if (table === 'profiles') return { data: { ...DEMO_PROFILE }, error: null }
          if (table === 'students') return { data: { ...DEMO_STUDENT }, error: null }
          return { data: null, error: null }
        },
        then: (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
          Promise.resolve(resolve({ data: [], error: null })),
      }
      void chain
      return builder
    },
  } as unknown as ReturnType<typeof createServerClient>
}

export async function createClient() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return createDemoClient()
  }

  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookieStore.set(name, value, (options ?? {}) as any),
          ),
      },
    },
  )
}

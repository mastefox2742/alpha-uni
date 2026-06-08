import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type DemoRole = 'student' | 'teacher' | 'admin'

const DEMO_PROFILES: Record<DemoRole, object> = {
  student: { id: 'demo-student-id', role: 'student', first_name: 'Alex',    last_name: 'Dupont'  },
  teacher: { id: 'demo-teacher-id', role: 'teacher', first_name: 'Marie',   last_name: 'Martin'  },
  admin:   { id: 'demo-admin-id',   role: 'admin',   first_name: 'Admin',   last_name: 'Demo'    },
}

function createDemoClient(role: DemoRole) {
  const userId  = `demo-${role}-id`
  const profile = DEMO_PROFILES[role]

  return {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: userId,
            email: `demo.${role}@unigest.fr`,
            role: 'authenticated',
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          },
        },
        error: null,
      }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut:    async () => ({ error: null }),
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: 'aal2' }, error: null }),
        listFactors: async () => ({ data: { totp: [{ status: 'verified' }] }, error: null }),
      },
    },
    from: (table: string) => {
      const builder: Record<string, unknown> = {}
      const q = {
        select:      () => q,
        eq:          () => q,
        neq:         () => q,
        in:          () => q,
        is:          () => q,
        order:       () => q,
        limit:       () => q,
        single:      async () => {
          if (table === 'profiles') return { data: { ...profile }, error: null }
          if (table === 'students' && role === 'student')
            return { data: { matricola: 'M-2024-001' }, error: null }
          if (table === 'teachers' && role === 'teacher')
            return { data: { title: 'Dr.', departments: { name: 'Informatique' } }, error: null }
          return { data: null, error: null }
        },
        maybeSingle: async () => {
          if (table === 'profiles') return { data: { ...profile }, error: null }
          if (table === 'students' && role === 'student')
            return { data: { matricola: 'M-2024-001' }, error: null }
          return { data: null, error: null }
        },
        then: (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
          Promise.resolve(resolve({ data: [], error: null })),
      }
      void builder
      return q
    },
  } as unknown as ReturnType<typeof createServerClient>
}

export async function createClient() {
  const cookieStore = await cookies()

  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    const raw  = cookieStore.get('demo_role')?.value ?? 'student'
    const role = (['student', 'teacher', 'admin'].includes(raw) ? raw : 'student') as DemoRole
    return createDemoClient(role)
  }

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

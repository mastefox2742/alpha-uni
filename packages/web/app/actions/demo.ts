'use server'

import { cookies } from 'next/headers'

export type DemoRole = 'student' | 'teacher' | 'admin'

export async function setDemoRole(role: DemoRole) {
  const cookieStore = await cookies()
  cookieStore.set('demo_role', role, {
    path: '/',
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  })
}

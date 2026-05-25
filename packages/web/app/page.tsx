import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  switch (profile?.role) {
    case 'student':
      redirect('/student/dashboard')
    case 'teacher':
      redirect('/teacher/dashboard')
    case 'secretary':
    case 'admin':
      redirect('/admin/dashboard')
    default:
      redirect('/login')
  }
}

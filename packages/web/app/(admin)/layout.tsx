import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'secretary'].includes(profile.role as string)) redirect('/403')

  const fullName = `${profile.first_name} ${profile.last_name}`.trim()

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminNav fullName={fullName} role={profile.role as string} />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}

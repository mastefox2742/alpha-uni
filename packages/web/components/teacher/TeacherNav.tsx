'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const links = [
  { href: '/teacher/dashboard', label: '🏠 Tableau de bord' },
  { href: '/teacher/courses',   label: '📚 Mes cours' },
]

export function TeacherNav({
  fullName,
  title,
  department,
}: {
  fullName:   string
  title?:     string
  department?: string
}) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card px-3 py-6">
      {/* Logo */}
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold">🎓 UniGest</h1>
        <p className="mt-1 text-xs text-muted-foreground">Espace Enseignant</p>
      </div>

      {/* Profil */}
      <div className="mb-6 rounded-lg bg-muted px-3 py-3">
        <p className="truncate text-sm font-medium">
          {title ? `${title} ` : ''}{fullName}
        </p>
        {department && (
          <p className="truncate text-xs text-muted-foreground">{department}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
              pathname.startsWith(href)
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-foreground',
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        className="mt-4 rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        🚪 Déconnexion
      </button>
    </aside>
  )
}

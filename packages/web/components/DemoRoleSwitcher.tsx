'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { setDemoRole, type DemoRole } from '@/app/actions/demo'

const ROLES: { key: DemoRole; label: string; path: string }[] = [
  { key: 'student', label: 'Etudiant',    path: '/student/dashboard' },
  { key: 'teacher', label: 'Enseignant',  path: '/teacher/dashboard' },
  { key: 'admin',   label: 'Admin',       path: '/admin/dashboard'   },
]

export function DemoRoleSwitcher({ currentRole }: { currentRole: DemoRole }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSwitch(role: DemoRole, path: string) {
    startTransition(async () => {
      await setDemoRole(role)
      router.push(path)
      router.refresh()
    })
  }

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-gray-950/90 px-3 py-1.5 shadow-2xl backdrop-blur-md">
      <span className="mr-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
        DEMO
      </span>
      {ROLES.map(({ key, label, path }) => (
        <button
          key={key}
          disabled={isPending}
          onClick={() => handleSwitch(key, path)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-all disabled:opacity-50 ${
            currentRole === key
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

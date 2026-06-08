import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import { DemoRoleSwitcher } from '@/components/DemoRoleSwitcher'
import type { DemoRole } from '@/app/actions/demo'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | UniGest',
    default: 'UniGest — Système de Gestion Universitaire',
  },
  description: 'Plateforme complète de gestion universitaire',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  let demoRole: DemoRole = 'student'

  if (isDemo) {
    const cookieStore = await cookies()
    const raw = cookieStore.get('demo_role')?.value ?? 'student'
    demoRole = (['student', 'teacher', 'admin'].includes(raw) ? raw : 'student') as DemoRole
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          {isDemo && <DemoRoleSwitcher currentRole={demoRole} />}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}

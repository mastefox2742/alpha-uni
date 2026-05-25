import type { Metadata } from 'next'
import Link from 'next/link'
import { EnrollmentWizard } from '@/components/enrollment/EnrollmentWizard'

export const metadata: Metadata = { title: 'Inscription' }

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-muted/40 py-10 px-4">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">🎓 UniGest</h1>
          <p className="mt-1 text-sm text-muted-foreground">Inscription universitaire</p>
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <EnrollmentWizard />
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Déjà inscrit ?{' '}
          <Link href="/login" className="text-primary hover:underline">Se connecter</Link>
        </p>
      </div>
    </main>
  )
}

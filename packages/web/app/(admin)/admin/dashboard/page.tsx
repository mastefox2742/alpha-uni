import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Administration — UniGest' }

export default function AdminDashboardPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Secrétariat / Administration</h1>
        <p className="mt-1 text-muted-foreground">
          Gestion des dossiers d'immatriculation, finances et certificats.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/students"
          className="rounded-xl border bg-card p-6 shadow-sm transition hover:border-primary hover:shadow"
        >
          <p className="text-2xl">🎓</p>
          <p className="mt-3 font-semibold">Dossiers d'immatriculation</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Examinez et validez les demandes d'inscription.
          </p>
        </Link>
      </div>
    </div>
  )
}

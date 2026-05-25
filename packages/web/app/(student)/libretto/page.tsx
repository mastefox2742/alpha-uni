import type { Metadata } from 'next'
import { LibrettoTable } from '@/components/student/LibrettoTable'

export const metadata: Metadata = { title: 'Libretto — Carnet de notes' }

export default function LibrettoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Libretto Universitario</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toutes vos notes acceptées et publiées.
        </p>
      </div>
      <LibrettoTable />
    </div>
  )
}

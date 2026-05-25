import type { Metadata } from 'next'
import { ApplicationsTable } from '@/components/admin/ApplicationsTable'

export const metadata: Metadata = { title: 'Dossiers étudiants' }

export default function AdminStudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dossiers d'immatriculation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Examinez et validez les demandes d'inscription des étudiants.
        </p>
      </div>
      <ApplicationsTable />
    </div>
  )
}

import type { Metadata } from 'next'
import { FeesTable } from '@/components/admin/FeesTable'

export const metadata: Metadata = { title: 'Frais de scolarité — Administration' }

export default function AdminFeesPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Frais de scolarité</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les frais de tous les étudiants — paiements et exonérations.
        </p>
      </div>
      <FeesTable />
    </div>
  )
}

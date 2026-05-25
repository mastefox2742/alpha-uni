import type { Metadata } from 'next'
import { FeesPanel } from '@/components/student/FeesPanel'

export const metadata: Metadata = { title: 'Frais de scolarité — Étudiant' }

export default function StudentFeesPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Frais de scolarité</h1>
        <p className="mt-1 text-muted-foreground">
          Consultez vos échéances et l'historique de vos paiements.
        </p>
      </div>
      <FeesPanel />
    </div>
  )
}

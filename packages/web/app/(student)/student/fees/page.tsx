import type { Metadata } from 'next'
import { FeesPage } from '@/components/student/FeesPage'

export const metadata: Metadata = { title: 'Frais de scolarité — Étudiant' }

export default function StudentFeesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <FeesPage />
    </div>
  )
}

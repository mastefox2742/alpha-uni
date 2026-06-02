import type { Metadata } from 'next'
import { ThesisPage } from '@/components/student/ThesisPage'

export const metadata: Metadata = { title: 'Thèse de Laurea — Étudiant' }

export default function StudentThesisPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <ThesisPage />
    </div>
  )
}

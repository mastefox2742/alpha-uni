import type { Metadata } from 'next'
import { ExamsPage } from '@/components/student/ExamsPage'

export const metadata: Metadata = { title: 'Examens — Étudiant' }

export default function StudentExamsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ExamsPage />
    </div>
  )
}

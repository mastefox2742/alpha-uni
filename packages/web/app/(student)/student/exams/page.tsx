import type { Metadata } from 'next'
import { ExamBookingPanel } from '@/components/student/ExamBookingPanel'

export const metadata: Metadata = { title: 'Examens — Étudiant' }

export default function StudentExamsPage() {
  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Examens</h1>
        <p className="mt-1 text-muted-foreground">
          Prénotez vos appelli, gérez vos prénotations et répondez aux notes proposées.
        </p>
      </div>
      <ExamBookingPanel />
    </div>
  )
}

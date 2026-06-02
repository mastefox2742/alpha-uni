import type { Metadata } from 'next'
import { TeacherExamsHub } from '@/components/teacher/TeacherExamsHub'

export const metadata: Metadata = { title: 'Hub des Examens — Enseignant' }

export default function TeacherExamsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TeacherExamsHub />
    </div>
  )
}

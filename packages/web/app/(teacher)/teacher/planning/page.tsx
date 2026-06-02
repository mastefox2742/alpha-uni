import type { Metadata } from 'next'
import { TeacherPlanning } from '@/components/teacher/TeacherPlanning'

export const metadata: Metadata = { title: 'Emploi du temps & RDV — Enseignant' }

export default function TeacherPlanningPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TeacherPlanning />
    </div>
  )
}

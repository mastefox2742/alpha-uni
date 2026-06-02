import type { Metadata } from 'next'
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard'

export const metadata: Metadata = { title: 'Tableau de bord — Enseignant' }

export default function TeacherDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TeacherDashboard />
    </div>
  )
}

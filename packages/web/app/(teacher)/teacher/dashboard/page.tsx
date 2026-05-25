import type { Metadata } from 'next'
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard'

export const metadata: Metadata = { title: 'Tableau de bord — Enseignant' }

export default function TeacherDashboardPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="mt-1 text-muted-foreground">Bienvenue dans votre espace enseignant.</p>
      </div>
      <TeacherDashboard />
    </div>
  )
}

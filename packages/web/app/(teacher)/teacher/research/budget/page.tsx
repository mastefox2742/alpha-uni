import type { Metadata } from 'next'
import { TeacherBudget } from '@/components/teacher/TeacherBudget'

export const metadata: Metadata = { title: 'Budgets & Projets — Enseignant' }

export default function TeacherBudgetPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TeacherBudget />
    </div>
  )
}

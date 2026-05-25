import type { Metadata } from 'next'
import { CoursesList } from '@/components/teacher/CoursesList'

export const metadata: Metadata = { title: 'Mes cours — Enseignant' }

export default function TeacherCoursesPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mes cours</h1>
        <p className="mt-1 text-muted-foreground">
          Gérez vos cours, sessions d'examen et verbales.
        </p>
      </div>
      <CoursesList />
    </div>
  )
}

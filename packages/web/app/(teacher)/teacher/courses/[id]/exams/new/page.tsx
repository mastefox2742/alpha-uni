import type { Metadata } from 'next'
import Link from 'next/link'
import { ExamSessionForm } from '@/components/teacher/ExamSessionForm'

export const metadata: Metadata = { title: 'Nouvel appello — Enseignant' }

export default async function NewExamSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="container max-w-xl py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/teacher/courses" className="hover:text-foreground">Mes cours</Link>
        <span>›</span>
        <Link href={`/teacher/courses/${id}`} className="hover:text-foreground">Cours</Link>
        <span>›</span>
        <span className="text-foreground font-medium">Nouvel appello</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Créer un appello</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Planifiez une session d'examen. Les étudiants pourront s'y prénoter.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <ExamSessionForm courseId={id} />
      </div>
    </div>
  )
}

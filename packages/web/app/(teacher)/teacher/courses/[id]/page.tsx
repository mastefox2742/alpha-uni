import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExamSessionsList } from '@/components/teacher/ExamSessionsList'

export const metadata: Metadata = { title: 'Détail cours — Enseignant' }

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select(`
      id, name, code, year, semester, cfu, description, syllabus_url,
      degree_programs!degree_program_id(name, type, total_cfu),
      exam_sessions(
        id, date, registration_deadline, max_students, notes,
        classrooms!classroom_id(name, building),
        exam_bookings(count)
      )
    `)
    .eq('id', id)
    .single()

  if (!course) notFound()

  const dp       = (course as any).degree_programs
  const sessions = ((course as any).exam_sessions ?? []).sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="container max-w-4xl py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/teacher/courses" className="hover:text-foreground">Mes cours</Link>
        <span>›</span>
        <span className="text-foreground font-medium">{course.name}</span>
      </nav>

      {/* En-tête cours */}
      <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{course.name}</h1>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {course.code}
              </span>
            </div>
            {dp && (
              <p className="mt-1 text-sm text-muted-foreground">
                {dp.name} · Année {course.year} · Semestre {course.semester}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{course.cfu}</p>
            <p className="text-xs text-muted-foreground">CFU</p>
          </div>
        </div>

        {course.description && (
          <p className="mt-4 text-sm text-muted-foreground">{course.description}</p>
        )}
        {course.syllabus_url && (
          <a
            href={course.syllabus_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-primary underline"
          >
            📄 Syllabus
          </a>
        )}
      </div>

      {/* Sessions d'examen */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sessions d'examen (Appelli)</h2>
        <Link
          href={`/teacher/courses/${id}/exams/new`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Nouvel appello
        </Link>
      </div>

      <ExamSessionsList sessions={sessions} courseId={id} />
    </div>
  )
}

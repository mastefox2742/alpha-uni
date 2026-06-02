import type { Metadata } from 'next'
import Link from 'next/link'
import { VerbaleTable } from '@/components/teacher/VerbaleTable'
import { VerbaleDemo } from '@/components/teacher/VerbaleDemo'

export const metadata: Metadata = { title: 'Verbale électronique — Enseignant' }

export default async function VerbalePage({
  params,
}: {
  params: Promise<{ id: string; examId: string }>
}) {
  const { id, examId } = await params

  // ── Demo mode ────────────────────────────────────────────────────────────
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/teacher/courses" className="hover:text-foreground">Mes cours</Link>
          <span>›</span>
          <Link href={`/teacher/courses/${id}`} className="hover:text-foreground">Cours</Link>
          <span>›</span>
          <span className="font-medium text-foreground">Verbale</span>
        </nav>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Verbale électronique</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saisissez les notes (18–30/30L). Publiez pour rendre le verbale définitif.
          </p>
        </div>
        <VerbaleDemo courseId={id} examId={examId} />
      </div>
    )
  }

  // ── Production ────────────────────────────────────────────────────────────
  return (
    <div className="container max-w-5xl py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/teacher/courses" className="hover:text-foreground">Mes cours</Link>
        <span>›</span>
        <Link href={`/teacher/courses/${id}`} className="hover:text-foreground">Cours</Link>
        <span>›</span>
        <span className="text-foreground font-medium">Verbale</span>
      </nav>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Verbale électronique</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Saisissez les notes (18–30/30L). Publiez pour rendre le verbale définitif.
        </p>
      </div>
      <VerbaleTable examId={examId} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStudentElearningCourses } from '@/lib/hooks/useElearning'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ────────────────────────────────────────────────────────────────────
type CourseItem = {
  id:         string
  name:       string
  code:       string
  cfu:        number
  teacher:    string
  teacherEmail: string
  progressPct: number
  chaptersTotal: number
  chaptersDone:  number
  status:     'obligatoire' | 'optionnel'
  semester:   'actif' | 'archive'
  color:      string
}

// ─── Données de démo ─────────────────────────────────────────────────────────
const DEMO: CourseItem[] = [
  {
    id: 'demo-1', name: 'Analyse Mathématique', code: 'MAT101', cfu: 9,
    teacher: 'Prof. Rossi Marco', teacherEmail: 'rossi.marco@unigest.fr',
    progressPct: 68, chaptersTotal: 12, chaptersDone: 8,
    status: 'obligatoire', semester: 'actif', color: 'from-blue-500/20 to-blue-500/5',
  },
  {
    id: 'demo-2', name: 'Programmation Orientée Objet', code: 'INF201', cfu: 6,
    teacher: 'Prof. Bianchi Laura', teacherEmail: 'bianchi.laura@unigest.fr',
    progressPct: 45, chaptersTotal: 10, chaptersDone: 4,
    status: 'obligatoire', semester: 'actif', color: 'from-violet-500/20 to-violet-500/5',
  },
  {
    id: 'demo-3', name: 'Bases de données', code: 'INF301', cfu: 6,
    teacher: 'Prof. Ferrari Anna', teacherEmail: 'ferrari.anna@unigest.fr',
    progressPct: 80, chaptersTotal: 8, chaptersDone: 6,
    status: 'obligatoire', semester: 'actif', color: 'from-emerald-500/20 to-emerald-500/5',
  },
  {
    id: 'demo-4', name: 'Réseaux Informatiques', code: 'INF302', cfu: 6,
    teacher: 'Prof. Conti Paolo', teacherEmail: 'conti.paolo@unigest.fr',
    progressPct: 30, chaptersTotal: 9, chaptersDone: 3,
    status: 'obligatoire', semester: 'actif', color: 'from-amber-500/20 to-amber-500/5',
  },
  {
    id: 'demo-5', name: 'Systèmes d\'exploitation', code: 'INF303', cfu: 6,
    teacher: 'Prof. Marini Giulia', teacherEmail: 'marini.giulia@unigest.fr',
    progressPct: 55, chaptersTotal: 7, chaptersDone: 4,
    status: 'obligatoire', semester: 'actif', color: 'from-rose-500/20 to-rose-500/5',
  },
  {
    id: 'demo-6', name: 'Communication Scientifique', code: 'COM101', cfu: 3,
    teacher: 'Prof. Moretti Chiara', teacherEmail: 'moretti.chiara@unigest.fr',
    progressPct: 100, chaptersTotal: 5, chaptersDone: 5,
    status: 'optionnel', semester: 'actif', color: 'from-cyan-500/20 to-cyan-500/5',
  },
  // Archives
  {
    id: 'demo-7', name: 'Algèbre Linéaire', code: 'MAT001', cfu: 9,
    teacher: 'Prof. Rossi Marco', teacherEmail: 'rossi.marco@unigest.fr',
    progressPct: 100, chaptersTotal: 10, chaptersDone: 10,
    status: 'obligatoire', semester: 'archive', color: 'from-slate-500/20 to-slate-500/5',
  },
  {
    id: 'demo-8', name: 'Introduction à l\'Informatique', code: 'INF001', cfu: 6,
    teacher: 'Prof. Esposito Roberto', teacherEmail: 'esposito.r@unigest.fr',
    progressPct: 100, chaptersTotal: 8, chaptersDone: 8,
    status: 'obligatoire', semester: 'archive', color: 'from-slate-500/20 to-slate-500/5',
  },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4 animate-pulse">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  )
}

// ─── Badge statut ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: CourseItem['status'] }) {
  return status === 'obligatoire' ? (
    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
      Obligatoire
    </span>
  ) : (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      Optionnel
    </span>
  )
}

// ─── Carte cours ──────────────────────────────────────────────────────────────
function CourseCard({ course }: { course: CourseItem }) {
  return (
    <Link
      href={`/student/courses/${course.id}`}
      className="group flex flex-col rounded-2xl border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all overflow-hidden"
    >
      {/* Couverture colorée */}
      <div className={`flex h-28 items-center justify-center bg-gradient-to-br ${course.color}`}>
        <span className="text-5xl opacity-80">📚</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
              {course.name}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{course.code}</p>
          </div>
          <StatusBadge status={course.status} />
        </div>

        {/* Prof */}
        <div
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
          onClick={(e) => {
            e.preventDefault()
            window.location.href = `mailto:${course.teacherEmail}?subject=[${course.code}] Question étudiant`
          }}
          title={`Envoyer un mail à ${course.teacher}`}
        >
          <span>👤</span>
          <span className="hover:text-primary hover:underline cursor-pointer truncate">
            {course.teacher}
          </span>
        </div>

        {/* CFU */}
        <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <span>🎯</span>
          <span>{course.cfu} CFU</span>
          <span className="ml-auto text-[10px]">
            {course.chaptersDone}/{course.chaptersTotal} chapitres
          </span>
        </div>

        {/* Barre de progression */}
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                course.progressPct === 100 ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${course.progressPct}%` }}
            />
          </div>
          <p className="text-right text-[10px] text-muted-foreground">{course.progressPct}%</p>
        </div>
      </div>
    </Link>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function CourseListPage() {
  const [tab, setTab] = useState<'actif' | 'archive'>('actif')
  const { data: rawCourses, isLoading } = useStudentElearningCourses()

  // Construire la liste depuis les données Supabase ou démo
  const courses: CourseItem[] =
    rawCourses && rawCourses.length > 0
      ? rawCourses.map((ec: any) => {
          const course  = ec.courses  as any
          const teacher = course?.teachers as any
          const profile = teacher?.profiles as any
          const sections  = (ec.elearning_sections  as any[]) ?? []
          const materials = (ec.elearning_materials as any[]) ?? []
          const done = materials.filter((m: any) => m.progress?.completed).length
          return {
            id:            ec.id,
            name:          course?.name ?? 'Cours',
            code:          course?.code ?? '',
            cfu:           course?.cfu  ?? 0,
            teacher:       profile ? `${profile.first_name} ${profile.last_name}` : 'Enseignant',
            teacherEmail:  profile?.email ?? '',
            progressPct:   materials.length ? Math.round((done / materials.length) * 100) : 0,
            chaptersTotal: sections.length,
            chaptersDone:  done,
            status:        course?.is_optional ? 'optionnel' : 'obligatoire',
            semester:      'actif',
            color:         'from-primary/20 to-primary/5',
          } satisfies CourseItem
        })
      : DEMO

  const filtered = courses.filter((c) => c.semester === tab)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold">📚 Mes Cours & Matériel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accédez à vos cours, slides, annales et enregistrements.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex items-center gap-1 rounded-xl bg-muted p-1 w-fit">
        {([
          { key: 'actif',   label: '📖 Semestre en cours' },
          { key: 'archive', label: '🗄 Archives'           },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Compteur */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} cours · {filtered.reduce((s, c) => s + c.cfu, 0)} CFU au total
      </p>

      {/* Grille */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm text-muted-foreground">Aucun cours dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      )}
    </div>
  )
}

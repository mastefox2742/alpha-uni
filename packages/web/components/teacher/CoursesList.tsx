'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── Types ────────────────────────────────────────────────────────────────────
type DegreeType = 'bachelor' | 'master' | 'phd' | 'single_cycle'
type CourseStatus = 'active' | 'archived'

interface DemoCourse {
  id:         string
  name:       string
  code:       string
  cfu:        number
  year:       number
  semester:   1 | 2
  students:   number
  degreeType: DegreeType
  degreeName: string
  status:     CourseStatus
  description: string
  nextExam:   Date | null
  pendingGrades: number
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_COURSES: DemoCourse[] = [
  {
    id: 'c1',
    name: 'Algorithmique & Structures de données',
    code: 'INFO301',
    cfu: 9,
    year: 3,
    semester: 1,
    students: 45,
    degreeType: 'bachelor',
    degreeName: 'Licence Informatique',
    status: 'active',
    description: 'Algorithmes classiques, complexité, arbres et graphes. TD hebdomadaires avec exercices de programmation en Python.',
    nextExam: new Date('2026-06-15T09:00:00'),
    pendingGrades: 3,
  },
  {
    id: 'c2',
    name: 'Génie logiciel',
    code: 'INFO401',
    cfu: 6,
    year: 4,
    semester: 2,
    students: 38,
    degreeType: 'master',
    degreeName: 'Master Informatique',
    status: 'active',
    description: 'Génie logiciel, design patterns, méthodes agiles, tests automatisés et intégration continue.',
    nextExam: new Date('2026-07-02T09:00:00'),
    pendingGrades: 0,
  },
  {
    id: 'c3',
    name: 'Bases de données',
    code: 'INFO201',
    cfu: 9,
    year: 2,
    semester: 1,
    students: 52,
    degreeType: 'bachelor',
    degreeName: 'Licence Informatique',
    status: 'active',
    description: 'Modèle relationnel, SQL avancé, transactions, indexation et bases NoSQL. Projet de fin de semestre.',
    nextExam: new Date('2026-06-20T14:00:00'),
    pendingGrades: 8,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DEGREE_BADGE: Record<DegreeType, string> = {
  bachelor:    'bg-blue-100 text-blue-700',
  master:      'bg-purple-100 text-purple-700',
  phd:         'bg-red-100 text-red-700',
  single_cycle: 'bg-green-100 text-green-700',
}

const DEGREE_LABEL: Record<DegreeType, string> = {
  bachelor:    'Licence',
  master:      'Master',
  phd:         'Doctorat',
  single_cycle: 'Cycle unique',
}

function semLabel(s: 1 | 2) {
  return s === 1 ? 'Semestre 1' : 'Semestre 2'
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course }: { course: DemoCourse }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{course.name}</h3>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                {course.code}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{course.degreeName}</p>
          </div>

          {/* Right badges */}
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DEGREE_BADGE[course.degreeType]}`}>
              {DEGREE_LABEL[course.degreeType]}
            </span>
            <span className="text-xs text-muted-foreground">Année {course.year} · {semLabel(course.semester)}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span>👨‍🎓</span>
            <span>{course.students} étudiant{course.students !== 1 ? 's' : ''}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>⚡</span>
            <span>{course.cfu} CFU</span>
          </span>
          {course.nextExam && (
            <span className="flex items-center gap-1">
              <span>🗓️</span>
              <span>Prochain examen : {format(course.nextExam, 'd MMM yyyy', { locale: fr })}</span>
            </span>
          )}
          {course.pendingGrades > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              ⚠️ {course.pendingGrades} note{course.pendingGrades > 1 ? 's' : ''} à saisir
            </span>
          )}
        </div>

        {/* Expandable description */}
        {expanded && (
          <p className="mt-3 text-sm text-muted-foreground">{course.description}</p>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-3">
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {expanded ? '▲ Moins de détails' : '▼ Voir la description'}
        </button>

        <div className="flex gap-2">
          <Link
            href={`/teacher/courses/${course.id}/elearning`}
            className="rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            🖥 E-Learning
          </Link>
          <Link
            href={`/teacher/courses/${course.id}`}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            Gérer →
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CoursesList() {
  // Demo courses grouped by academic year
  const byYear = DEMO_COURSES.reduce<Record<number, DemoCourse[]>>((acc, c) => {
    const list = acc[c.year]
    if (list !== undefined) {
      list.push(c)
    } else {
      acc[c.year] = [c]
    }
    return acc
  }, {})

  const sortedYears = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b)

  // Aggregate stats
  const totalStudents   = DEMO_COURSES.reduce((s, c) => s + c.students, 0)
  const totalPending    = DEMO_COURSES.reduce((s, c) => s + c.pendingGrades, 0)
  const coursesWithExam = DEMO_COURSES.filter(c => c.nextExam !== null).length

  return (
    <div className="space-y-8">

      {/* Quick stats strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
          <span className="text-2xl">📚</span>
          <div>
            <p className="text-xl font-bold">{DEMO_COURSES.length}</p>
            <p className="text-xs text-muted-foreground">cours actifs</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
          <span className="text-2xl">👨‍🎓</span>
          <div>
            <p className="text-xl font-bold">{totalStudents}</p>
            <p className="text-xs text-muted-foreground">étudiants au total</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 rounded-lg border p-4 shadow-sm ${totalPending > 0 ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30' : 'bg-card'}`}>
          <span className="text-2xl">📝</span>
          <div>
            <p className={`text-xl font-bold ${totalPending > 0 ? 'text-amber-700 dark:text-amber-400' : ''}`}>
              {totalPending}
            </p>
            <p className="text-xs text-muted-foreground">notes à saisir</p>
          </div>
        </div>
      </div>

      {/* Courses by year */}
      {sortedYears.map(year => {
        const courses = byYear[year]
        if (!courses) return null

        return (
          <section key={year}>
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Année {year}
              </h3>
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">
                {courses.length} cours · {courses.reduce((s, c) => s + c.students, 0)} étudiants
              </span>
            </div>
            <div className="space-y-3">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )
      })}

      {/* Add course CTA */}
      <div className="rounded-xl border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">Vous attendez un nouveau cours ?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Les cours sont assignés par l'administration — contactez le secrétariat pour toute demande.
        </p>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useTeacherCourses } from '@/lib/hooks/useTeacherCourses'

function semesterLabel(s: number) {
  return s === 1 ? 'S1' : 'S2'
}

function degreeTypeBadge(type: string) {
  const map: Record<string, string> = {
    bachelor:    'bg-blue-100 text-blue-700',
    master:      'bg-purple-100 text-purple-700',
    phd:         'bg-red-100 text-red-700',
    single_cycle: 'bg-green-100 text-green-700',
  }
  return map[type] ?? 'bg-muted text-muted-foreground'
}

export function CoursesList() {
  const { data: courses, isLoading, isError } = useTeacherCourses()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">Impossible de charger les cours.</p>
    )
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-4xl">📚</p>
        <p className="mt-2 text-sm">Aucun cours assigné pour le moment.</p>
      </div>
    )
  }

  // Grouper par année
  const byYear = courses.reduce<Record<number, typeof courses>>((acc, c) => {
    if (!acc[c.year]) acc[c.year] = []
    ;(acc[c.year] as typeof courses).push(c)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.entries(byYear).map(([year, yearCourses]) => (
        <section key={year}>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Année {year}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {yearCourses.map(course => {
              const enrolled = (course.course_enrollments as any)?.[0]?.count ?? 0
              const dp = course.degree_programs as any

              return (
                <Link
                  key={course.id}
                  href={`/teacher/courses/${course.id}`}
                  className="group rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-primary hover:shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium group-hover:text-primary">
                        {course.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{course.code}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${degreeTypeBadge(dp?.type ?? '')}`}
                    >
                      {semesterLabel(course.semester)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>⚡ {course.cfu} CFU</span>
                    <span>👨‍🎓 {enrolled} étudiant{enrolled !== 1 ? 's' : ''}</span>
                  </div>

                  {dp && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {dp.name}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

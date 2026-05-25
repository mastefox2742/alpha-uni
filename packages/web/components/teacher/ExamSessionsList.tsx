'use client'

import Link from 'next/link'
import { format, isPast, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ExamSession {
  id:                    string
  date:                  string
  registration_deadline: string
  max_students:          number | null
  notes:                 string | null
  classrooms:            { name: string; building: string | null } | null
  exam_bookings:         { count: number }[]
}

interface Props {
  sessions:  ExamSession[]
  courseId:  string
}

function statusBadge(date: string, deadline: string) {
  if (isPast(new Date(date))) {
    return <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Terminé</span>
  }
  if (isPast(new Date(deadline))) {
    return <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Inscriptions fermées</span>
  }
  return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Inscriptions ouvertes</span>
}

export function ExamSessionsList({ sessions, courseId }: Props) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Aucune session d'examen programmée.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map(session => {
        const bookings = (session.exam_bookings as any)?.[0]?.count ?? 0

        return (
          <div
            key={session.id}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  📅 {format(new Date(session.date), 'EEEE d MMMM yyyy · HH:mm', { locale: fr })}
                </p>
                {session.classrooms && (
                  <p className="text-sm text-muted-foreground">
                    📍 {session.classrooms.name}
                    {session.classrooms.building ? `, ${session.classrooms.building}` : ''}
                  </p>
                )}
              </div>
              {statusBadge(session.date, session.registration_deadline)}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>
                🗓️ Inscription avant {format(new Date(session.registration_deadline), 'd MMM yyyy', { locale: fr })}
                {!isPast(new Date(session.registration_deadline)) && (
                  <span className="ml-1 text-xs">
                    ({formatDistanceToNow(new Date(session.registration_deadline), { locale: fr, addSuffix: true })})
                  </span>
                )}
              </span>
              <span>👥 {bookings} inscrit{bookings !== 1 ? 's' : ''}{session.max_students ? ` / ${session.max_students}` : ''}</span>
            </div>

            {session.notes && (
              <p className="mt-2 text-sm text-muted-foreground italic">{session.notes}</p>
            )}

            <div className="mt-3 flex gap-2">
              <Link
                href={`/teacher/courses/${courseId}/verbale/${session.id}`}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                📝 Verbale
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

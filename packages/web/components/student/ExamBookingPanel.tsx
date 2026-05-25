'use client'

import { useState } from 'react'
import { format, isPast, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  useAvailableExams,
  useMyBookings,
  useBookExam,
  useCancelBooking,
  usePendingGrades,
  useRespondToGrade,
} from '@/lib/hooks/useStudentExams'

type Tab = 'available' | 'booked' | 'grades'

function gradeDisplay(value: number, isHonors: boolean) {
  if (isHonors) return <span className="font-bold text-yellow-600">30L</span>
  if (value >= 27) return <span className="font-bold text-green-600">{value}</span>
  if (value >= 24) return <span className="font-semibold text-blue-600">{value}</span>
  return <span className="text-orange-600">{value}</span>
}

function AvailableExams() {
  const { data: exams, isLoading } = useAvailableExams()
  const { mutateAsync: book, isPending } = useBookExam()

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
  }

  if (!exams || exams.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-3xl">📅</p>
        <p className="mt-2 text-sm">Aucun examen disponible à la prénotation.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {exams.map((exam: any) => {
        const course   = exam.courses
        const teacher  = course?.teachers?.profiles
        const deadline = new Date(exam.registration_deadline)
        const bookings = exam.exam_bookings?.[0]?.count ?? 0

        return (
          <div key={exam.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{course?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {course?.code} · {course?.cfu} CFU
                  {teacher && ` · ${teacher.first_name} ${teacher.last_name}`}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                S{course?.semester} · A{course?.year}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>📅 {format(new Date(exam.date), 'EEEE d MMM yyyy · HH:mm', { locale: fr })}</span>
              <span>
                ⏳ Inscription avant {format(deadline, 'd MMM', { locale: fr })}
                <span className="ml-1 text-xs">
                  ({formatDistanceToNow(deadline, { locale: fr, addSuffix: true })})
                </span>
              </span>
              {exam.max_students && (
                <span>👥 {bookings}/{exam.max_students}</span>
              )}
            </div>

            <div className="mt-3">
              {exam.is_booked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                  ✅ Prénoté
                </span>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await book(exam.id)
                      toast.success('Prénotation confirmée')
                    } catch (err) {
                      toast.error((err as Error).message)
                    }
                  }}
                  disabled={isPending}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Se prénoter
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MyBookings() {
  const { data: bookings, isLoading } = useMyBookings()
  const { mutateAsync: cancel, isPending } = useCancelBooking()

  if (isLoading) {
    return <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-3xl">📋</p>
        <p className="mt-2 text-sm">Aucune prénotation active.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking: any) => {
        const session  = booking.exam_sessions
        const course   = session?.courses
        const deadline = session ? new Date(session.registration_deadline) : null
        const canCancel = deadline ? !isPast(deadline) && booking.status === 'booked' : false

        return (
          <div key={booking.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{course?.name}</p>
                <p className="text-xs text-muted-foreground">{course?.code} · {course?.cfu} CFU</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                booking.status === 'booked'   ? 'bg-blue-100 text-blue-700' :
                booking.status === 'present'  ? 'bg-green-100 text-green-700' :
                booking.status === 'graded'   ? 'bg-purple-100 text-purple-700' :
                'bg-muted text-muted-foreground'
              }`}>
                {booking.status === 'booked' ? 'Prénoté' :
                 booking.status === 'present' ? 'Présent' :
                 booking.status === 'graded' ? 'Noté' : booking.status}
              </span>
            </div>

            {session && (
              <div className="mt-2 text-sm text-muted-foreground">
                📅 {format(new Date(session.date), 'EEEE d MMMM yyyy · HH:mm', { locale: fr })}
                {session.classrooms && ` · ${session.classrooms.name}`}
              </div>
            )}

            {canCancel && (
              <button
                onClick={async () => {
                  try {
                    await cancel(session.id)
                    toast.success('Prénotation annulée')
                  } catch (err) {
                    toast.error((err as Error).message)
                  }
                }}
                disabled={isPending}
                className="mt-3 rounded border px-3 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                Annuler la prénotation
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PendingGrades() {
  const { data: grades, isLoading } = usePendingGrades()
  const { mutateAsync: respond, isPending } = useRespondToGrade()

  if (isLoading) {
    return <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div>
  }

  if (!grades || grades.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-3xl">✅</p>
        <p className="mt-2 text-sm">Aucune note en attente de réponse.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {grades.map((grade: any) => {
        const course = grade.courses
        const session = grade.exam_sessions

        return (
          <div key={grade.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{course?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {course?.code} · {course?.cfu} CFU
                  {session && ` · ${format(new Date(session.date), 'd MMM yyyy', { locale: fr })}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {gradeDisplay(grade.value, grade.is_honors)}
                </p>
                <p className="text-xs text-muted-foreground">Note proposée</p>
              </div>
            </div>

            {grade.notes && (
              <p className="mt-2 text-sm italic text-muted-foreground">
                💬 {grade.notes}
              </p>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await respond({ gradeId: grade.id, accept: true })
                    toast.success('Note acceptée — elle sera inscrite à votre libretto')
                  } catch (err) {
                    toast.error((err as Error).message)
                  }
                }}
                disabled={isPending}
                className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                ✅ Accepter
              </button>
              <button
                onClick={async () => {
                  if (!confirm('Refuser cette note ? Elle ne sera pas inscrite à votre libretto.')) return
                  try {
                    await respond({ gradeId: grade.id, accept: false })
                    toast.success('Note refusée')
                  } catch (err) {
                    toast.error((err as Error).message)
                  }
                }}
                disabled={isPending}
                className="rounded-md border border-destructive px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                ❌ Refuser
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ExamBookingPanel() {
  const [tab, setTab] = useState<Tab>('available')
  const { data: pending } = usePendingGrades()
  const pendingCount = pending?.length ?? 0

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'available', label: '📅 Appelli disponibles' },
    { key: 'booked',    label: '📋 Mes prénotations' },
    { key: 'grades',    label: '📝 Notes proposées', badge: pendingCount },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border bg-muted p-1">
        {tabs.map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              tab === key
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
            {badge ? (
              <span className="ml-1.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-xs text-white">
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === 'available' && <AvailableExams />}
      {tab === 'booked'    && <MyBookings />}
      {tab === 'grades'    && <PendingGrades />}
    </div>
  )
}

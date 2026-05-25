'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useVerbale, useProposeGrade, usePublishVerbale } from '@/lib/hooks/useVerbale'

const GRADES = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]

function gradeColor(value: number, isHonors: boolean) {
  if (isHonors) return 'text-yellow-600 font-bold'
  if (value >= 27) return 'text-green-600 font-bold'
  if (value >= 24) return 'text-blue-600'
  if (value >= 18) return 'text-orange-600'
  return 'text-destructive'
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    proposed: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    published: 'bg-blue-100 text-blue-700',
  }
  const labels: Record<string, string> = {
    proposed: 'Proposée',
    accepted: 'Acceptée',
    rejected: 'Refusée',
    published: 'Publiée',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function GradeInputRow({
  booking,
  examId,
}: {
  booking: any
  examId:  string
}) {
  const grade        = booking.grades?.[0]
  const [value, setValue]   = useState<number>(grade?.value ?? 18)
  const [honors, setHonors] = useState<boolean>(grade?.is_honors ?? false)
  const [notes, setNotes]   = useState<string>(grade?.notes ?? '')
  const { mutateAsync, isPending } = useProposeGrade(examId)

  const student  = booking.students
  const profile  = student?.profiles

  const isPublished = grade?.status === 'published'

  async function save() {
    if (honors && value !== 30) {
      toast.error('Pour 30L, la note doit être 30')
      return
    }
    try {
      const gradePayload: Parameters<typeof mutateAsync>[0] = {
        bookingId: booking.id,
        value,
        isHonors: honors,
      }
      if (notes.trim()) gradePayload.notes = notes

      await mutateAsync(gradePayload)
      toast.success('Note enregistrée')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4 text-sm">
        <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
        <p className="text-xs text-muted-foreground">{student?.matricola ?? '—'}</p>
      </td>
      <td className="py-3 pr-4 text-sm text-muted-foreground">
        {format(new Date(booking.booked_at), 'd MMM yyyy', { locale: fr })}
      </td>
      <td className="py-3 pr-4">
        {isPublished ? (
          <span className={gradeColor(grade.value, grade.is_honors)}>
            {grade.is_honors ? '30L' : grade.value}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={value}
              onChange={e => setValue(Number(e.target.value))}
              disabled={isPublished}
              className="rounded border bg-background px-2 py-1 text-sm"
            >
              {GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={honors}
                disabled={value !== 30 || isPublished}
                onChange={e => setHonors(e.target.checked)}
              />
              30L
            </label>
          </div>
        )}
      </td>
      <td className="py-3 pr-4">
        {isPublished ? (
          <span className="text-xs text-muted-foreground italic">{notes || '—'}</span>
        ) : (
          <input
            type="text"
            placeholder="Notes (optionnel)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full rounded border bg-background px-2 py-1 text-xs"
          />
        )}
      </td>
      <td className="py-3 pr-4">
        {grade ? statusBadge(grade.status) : (
          <span className="text-xs text-muted-foreground">Absent</span>
        )}
      </td>
      <td className="py-3">
        {!isPublished && (
          <button
            onClick={save}
            disabled={isPending}
            className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? '...' : grade ? 'Modifier' : 'Saisir'}
          </button>
        )}
      </td>
    </tr>
  )
}

export function VerbaleTable({ examId }: { examId: string }) {
  const { data, isLoading, isError } = useVerbale(examId)
  const { mutateAsync: publish, isPending: isPublishing } = usePublishVerbale(examId)

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Impossible de charger le verbale.</p>
  }

  const { session, bookings } = data
  const course  = session.courses as any
  const allProposed = bookings.some((b: any) => b.grades?.[0]?.status === 'proposed')
  const anyPublished = bookings.some((b: any) => b.grades?.[0]?.status === 'published')

  async function handlePublish() {
    if (!confirm('Publier le verbale ? Cette action est irréversible.')) return
    try {
      await publish()
      toast.success('Verbale publié — les notes sont définitives')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête verbale */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {course?.name} — Verbale du {format(new Date(session.date), 'd MMMM yyyy', { locale: fr })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {bookings.length} étudiant{bookings.length !== 1 ? 's' : ''} inscrit{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          {allProposed && !anyPublished && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isPublishing ? 'Publication...' : '✅ Publier le verbale'}
            </button>
          )}
          {anyPublished && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              ✅ Verbale publié
            </span>
          )}
        </div>
      </div>

      {/* Tableau de saisie */}
      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Aucune prénotation pour cette session.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left">Étudiant</th>
                <th className="px-4 py-3 text-left">Prénoté le</th>
                <th className="px-4 py-3 text-left">Note</th>
                <th className="px-4 py-3 text-left">Remarques</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="px-4">
              {bookings.map((booking: any) => (
                <GradeInputRow key={booking.id} booking={booking} examId={examId} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

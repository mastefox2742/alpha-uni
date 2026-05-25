'use client'

import { useTeacherDashboard } from '@/lib/hooks/useTeacherDashboard'

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label:      string
  value:      number | string
  icon:       string
  highlight?: boolean
}) {
  return (
    <div
      className={
        `rounded-xl border p-5 shadow-sm ` +
        (highlight
          ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
          : 'bg-card')
      }
    >
      <p className="text-2xl">{icon}</p>
      <p className={`mt-3 text-3xl font-bold ${highlight ? 'text-orange-600' : ''}`}>
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function TeacherDashboard() {
  const { data, isLoading, isError } = useTeacherDashboard()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Impossible de charger le tableau de bord. Vérifiez que votre profil enseignant est configuré.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="📚" label="Cours enseignés" value={data.total_courses} />
        <StatCard icon="👨‍🎓" label="Étudiants inscrits" value={data.total_students} />
        <StatCard
          icon="📝"
          label="Notes en attente"
          value={data.pending_grades}
          highlight={data.pending_grades > 0}
        />
      </div>

      {data.pending_grades > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
            ⚠️ Vous avez <strong>{data.pending_grades}</strong> note{data.pending_grades > 1 ? 's' : ''} proposée{data.pending_grades > 1 ? 's' : ''} en attente de publication.
          </p>
          <a
            href="/teacher/courses"
            className="mt-1 inline-block text-sm text-orange-600 underline hover:text-orange-700"
          >
            Accéder aux verbales →
          </a>
        </div>
      )}
    </div>
  )
}

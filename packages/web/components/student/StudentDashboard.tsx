'use client'

import { useStudentDashboard } from '@/lib/hooks/useStudentDashboard'
import { CfuProgressBar } from './CfuProgressBar'
import { GpaCard } from './GpaCard'
import { NextExamCard } from './NextExamCard'
import { PendingFeesCard } from './PendingFeesCard'
import { Skeleton } from '@/components/ui/skeleton'

export function StudentDashboard() {
  const { data, isLoading, isError } = useStudentDashboard()

  if (isLoading) return <DashboardSkeleton />
  if (isError || !data) return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
      Impossible de charger le tableau de bord. Réessayez plus tard.
    </div>
  )

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold">Bonjour, {data.fullName.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.degreeProgram} · Année {data.currentYear} · Matricule {data.matricola ?? '—'}
        </p>
      </div>

      {/* Barre CFU */}
      <CfuProgressBar
        earned={data.totalCfuEarned}
        total={data.totalCfu}
        pct={data.cfuProgressPct ?? 0}
      />

      {/* Cartes stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GpaCard gpa={data.gpa} />
        <NextExamCard nextExamDate={data.nextExamDate} />
        <PendingFeesCard amount={data.pendingFeesTotal} />
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  )
}

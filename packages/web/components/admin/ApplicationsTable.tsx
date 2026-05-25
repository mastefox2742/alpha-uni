'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'draft'

const statusVariant = {
  pending:  'warning',
  approved: 'success',
  rejected: 'destructive',
  draft:    'outline',
} as const

async function fetchApplications(status: StatusFilter) {
  const supabase = createClient()
  let query = supabase
    .from('enrollment_applications')
    .select(`
      id, status, submitted_at, created_at,
      user:profiles!user_id(first_name, last_name),
      degree_program:degree_programs!degree_program_id(name, type),
      academic_year:academic_years!academic_year_id(label)
    `)
    .order('submitted_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)
  const { data } = await query
  return data ?? []
}

export function ApplicationsTable() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const { data = [], isLoading } = useQuery({
    queryKey: ['admin', 'applications', statusFilter],
    queryFn: () => fetchApplications(statusFilter),
    staleTime: 30_000,
  })

  return (
    <div className="space-y-4">
      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2">
        {(['all','pending','approved','rejected','draft'] as StatusFilter[]).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}>
            {s === 'all' ? 'Tous' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border bg-card py-16 text-center text-muted-foreground">
          <p className="text-3xl">📭</p>
          <p className="mt-2 text-sm">Aucun dossier {statusFilter !== 'all' ? statusFilter : ''}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Étudiant</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Filière</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Soumis le</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((app: Record<string, unknown>) => {
                const user = app.user as { first_name: string; last_name: string } | null
                const program = app.degree_program as { name: string } | null
                return (
                  <tr key={app.id as string} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {user ? `${user.first_name} ${user.last_name}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {program?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {app.submitted_at
                        ? new Intl.DateTimeFormat('fr-FR').format(new Date(app.submitted_at as string))
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={statusVariant[app.status as keyof typeof statusVariant] ?? 'outline'}>
                        {app.status as string}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/admin/students/${app.id as string}`}
                        className="rounded-md border px-2 py-1 text-xs hover:bg-accent">
                        Examiner
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

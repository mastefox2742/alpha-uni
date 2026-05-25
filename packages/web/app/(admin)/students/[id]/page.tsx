import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DocumentReview } from '@/components/admin/DocumentReview'
import { ApplicationActions } from './application-actions'

export const metadata: Metadata = { title: 'Dossier étudiant' }

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: app, error } = await supabase
    .from('enrollment_applications')
    .select(`
      id, status, submitted_at, rejection_reason,
      user:profiles!user_id(first_name, last_name, role),
      degree_program:degree_programs!degree_program_id(name, type, duration_years, total_cfu),
      academic_year:academic_years!academic_year_id(label),
      enrollment_documents(id, type, file_name, file_url, is_verified)
    `)
    .eq('id', id)
    .single()

  if (error || !app) redirect('/admin/students')

  const user    = app.user as { first_name: string; last_name: string } | null
  const program = app.degree_program as { name: string; type: string; duration_years: number; total_cfu: number } | null
  const docs    = (app.enrollment_documents ?? []) as Array<{ id: string; type: string; file_name: string; file_url: string; is_verified: boolean }>

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {user ? `${user.first_name} ${user.last_name}` : 'Candidat'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {program?.name} · {program?.duration_years} ans · {program?.total_cfu} CFU
          </p>
        </div>
        <ApplicationActions
          applicationId={id}
          currentStatus={app.status as string}
          allDocsVerified={docs.every(d => d.is_verified)}
        />
      </div>

      {/* Documents */}
      {docs.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Documents</h2>
          <DocumentReview
            applicationId={id}
            documents={docs}
            onDocVerified={() => {}}
          />
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">Aucun document soumis.</p>
      )}

      {/* Motif de rejet */}
      {app.rejection_reason && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-destructive">Motif de rejet</p>
          <p className="mt-1 text-sm">{app.rejection_reason as string}</p>
        </div>
      )}
    </div>
  )
}

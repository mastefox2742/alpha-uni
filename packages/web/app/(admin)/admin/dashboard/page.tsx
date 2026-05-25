import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Administration — UniGest' }

async function getAdminStats() {
  const supabase = await createClient()

  const [{ count: pending }, { count: overdue }, { count: enrolled }, { count: certCount }] = await Promise.all([
    supabase.from('enrollment_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('tuition_fees').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
    supabase.from('students').select('id', { count: 'exact', head: true }).in('status', ['enrolled', 'active']),
    supabase.from('certificates').select('id', { count: 'exact', head: true }),
  ])

  return {
    pendingApplications: pending ?? 0,
    overdueFeesCount:    overdue ?? 0,
    enrolledStudents:    enrolled ?? 0,
    totalCertificates:   certCount ?? 0,
  }
}

function StatCard({
  href, icon, label, value, highlight,
}: {
  href: string; icon: string; label: string; value: number; highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border p-6 shadow-sm transition hover:border-primary hover:shadow ${
        highlight ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'bg-card'
      }`}
    >
      <p className="text-2xl">{icon}</p>
      <p className={`mt-3 text-3xl font-bold ${highlight ? 'text-red-600' : ''}`}>{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </Link>
  )
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Secrétariat / Administration</h1>
        <p className="mt-1 text-muted-foreground">
          Vue d'ensemble de l'activité universitaire.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          href="/admin/students"
          icon="📋"
          label="Dossiers en attente"
          value={stats.pendingApplications}
          highlight={stats.pendingApplications > 0}
        />
        <StatCard
          href="/admin/fees"
          icon="⚠️"
          label="Frais en retard"
          value={stats.overdueFeesCount}
          highlight={stats.overdueFeesCount > 0}
        />
        <StatCard
          href="/admin/students"
          icon="🎓"
          label="Étudiants inscrits"
          value={stats.enrolledStudents}
        />
        <StatCard
          href="/admin/certificates"
          icon="📄"
          label="Certificats émis"
          value={stats.totalCertificates}
        />
      </div>

      {stats.pendingApplications > 0 && (
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            📋 <strong>{stats.pendingApplications}</strong> dossier{stats.pendingApplications > 1 ? 's' : ''} d'immatriculation en attente de traitement.
          </p>
          <Link href="/admin/students" className="mt-1 inline-block text-sm text-yellow-600 underline">
            Traiter les dossiers →
          </Link>
        </div>
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import { AdminExamsAudit } from '@/components/admin/AdminExamsAudit'

export const metadata: Metadata = { title: 'Audit des Examens (PV) — UniGest Admin' }

export default function AdminExamsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminExamsAudit />
    </div>
  )
}

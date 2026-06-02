import type { Metadata } from 'next'
import { AdminReports } from '@/components/admin/AdminReports'

export const metadata: Metadata = { title: 'Reporting Ministère — UniGest Admin' }

export default function AdminReportsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminReports />
    </div>
  )
}

import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const metadata: Metadata = { title: 'Tableau de bord — UniGest Admin' }

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminDashboard />
    </div>
  )
}

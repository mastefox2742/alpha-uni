import type { Metadata } from 'next'
import { AdminGraduation } from '@/components/admin/AdminGraduation'

export const metadata: Metadata = { title: 'Demandes de Laurea — UniGest Admin' }

export default function AdminGraduationPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminGraduation />
    </div>
  )
}

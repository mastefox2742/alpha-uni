import type { Metadata } from 'next'
import { AdminMissionsValidation } from '@/components/admin/AdminMissionsValidation'

export const metadata: Metadata = { title: 'Validation des Missions — UniGest Admin' }

export default function AdminMissionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminMissionsValidation />
    </div>
  )
}

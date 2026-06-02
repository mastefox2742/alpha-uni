import type { Metadata } from 'next'
import { AdminTeachers } from '@/components/admin/AdminTeachers'

export const metadata: Metadata = { title: 'Profils, Contrats & Heures — UniGest Admin' }

export default function AdminTeachersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminTeachers />
    </div>
  )
}

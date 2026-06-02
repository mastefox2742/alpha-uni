import type { Metadata } from 'next'
import { AdminPrograms } from '@/components/admin/AdminPrograms'

export const metadata: Metadata = { title: 'Gestion des Filières — UniGest Admin' }

export default function AdminProgramsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminPrograms />
    </div>
  )
}

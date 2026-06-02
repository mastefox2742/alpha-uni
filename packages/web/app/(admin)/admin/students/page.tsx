import type { Metadata } from 'next'
import { AdminStudents } from '@/components/admin/AdminStudents'

export const metadata: Metadata = { title: 'Dossiers & Inscriptions — UniGest Admin' }

export default function AdminStudentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminStudents />
    </div>
  )
}

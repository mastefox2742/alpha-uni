import type { Metadata } from 'next'
import { AdminStudies } from '@/components/admin/AdminStudies'

export const metadata: Metadata = { title: "Plans d'études & Libretti — UniGest Admin" }

export default function AdminStudiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminStudies />
    </div>
  )
}

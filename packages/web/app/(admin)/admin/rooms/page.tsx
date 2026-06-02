import type { Metadata } from 'next'
import { AdminRooms } from '@/components/admin/AdminRooms'

export const metadata: Metadata = { title: 'Salles & Amphis — UniGest Admin' }

export default function AdminRoomsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminRooms />
    </div>
  )
}

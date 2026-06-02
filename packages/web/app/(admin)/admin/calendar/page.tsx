import type { Metadata } from 'next'
import { AdminCalendar } from '@/components/admin/AdminCalendar'

export const metadata: Metadata = { title: 'Calendrier Universitaire — UniGest Admin' }

export default function AdminCalendarPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminCalendar />
    </div>
  )
}

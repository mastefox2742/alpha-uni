import type { Metadata } from 'next'
import { AdminSettings } from '@/components/admin/AdminSettings'

export const metadata: Metadata = { title: 'Configuration système — UniGest Admin' }

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <AdminSettings />
    </div>
  )
}

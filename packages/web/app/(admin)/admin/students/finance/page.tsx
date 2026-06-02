import type { Metadata } from 'next'
import { AdminFinance } from '@/components/admin/AdminFinance'

export const metadata: Metadata = { title: 'Comptabilité & Taxes — UniGest Admin' }

export default function AdminFinancePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <AdminFinance />
    </div>
  )
}

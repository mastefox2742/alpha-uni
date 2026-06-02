import type { Metadata } from 'next'
import { LibrettoPage } from '@/components/student/LibrettoPage'

export const metadata: Metadata = { title: 'Libretto — Carnet de notes' }

export default function LibrettoRoute() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <LibrettoPage />
    </div>
  )
}

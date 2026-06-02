import type { Metadata } from 'next'
import { TeacherMissions } from '@/components/teacher/TeacherMissions'

export const metadata: Metadata = { title: 'Ordres de mission — Enseignant' }

export default function TeacherMissionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TeacherMissions />
    </div>
  )
}

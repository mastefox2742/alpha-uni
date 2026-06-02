import type { Metadata } from 'next'
import { TeacherPublications } from '@/components/teacher/TeacherPublications'

export const metadata: Metadata = { title: 'Mes publications — Enseignant' }

export default function TeacherPublicationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TeacherPublications />
    </div>
  )
}

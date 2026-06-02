import type { Metadata } from 'next'
import { TeacherThesis } from '@/components/teacher/TeacherThesis'

export const metadata: Metadata = { title: 'Thèses dirigées — Enseignant' }

export default function TeacherThesisPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TeacherThesis />
    </div>
  )
}

import type { Metadata } from 'next'
import { TeacherSettings } from '@/components/teacher/TeacherSettings'

export const metadata: Metadata = { title: 'Paramètres RH — Enseignant' }

export default function TeacherSettingsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TeacherSettings />
    </div>
  )
}

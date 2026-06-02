import type { Metadata } from 'next'
import { StudentSettings } from '@/components/student/StudentSettings'

export const metadata: Metadata = { title: 'Paramètres' }

export default function SettingsPage() {
  return <StudentSettings />
}

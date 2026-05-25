import type { Metadata } from 'next'
import { StudentDashboard } from '@/components/student/StudentDashboard'

export const metadata: Metadata = { title: 'Tableau de bord' }

export default function StudentDashboardPage() {
  return <StudentDashboard />
}

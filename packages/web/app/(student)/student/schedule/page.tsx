import type { Metadata } from 'next'
import { ScheduleView } from '@/components/student/ScheduleView'

export const metadata: Metadata = { title: 'Emploi du temps' }

export default function SchedulePage() {
  return <ScheduleView />
}

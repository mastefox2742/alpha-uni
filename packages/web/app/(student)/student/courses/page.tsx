import type { Metadata } from 'next'
import { CourseListPage } from '@/components/student/CourseListPage'

export const metadata: Metadata = { title: 'Mes Cours & Matériel' }

export default function StudentCoursesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CourseListPage />
    </div>
  )
}

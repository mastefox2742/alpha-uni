import type { Metadata } from 'next'
import { CourseDetailPage } from '@/components/student/CourseDetailPage'

export const metadata: Metadata = { title: 'Cours' }

export default async function StudentCoursePage({
  params,
  searchParams,
}: {
  params:       Promise<{ ecId: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { ecId } = await params
  const { tab }  = await searchParams
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <CourseDetailPage ecId={ecId} defaultTab={(tab as any) ?? 'overview'} />
    </div>
  )
}

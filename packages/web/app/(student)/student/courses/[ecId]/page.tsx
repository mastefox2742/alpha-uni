import { CoursePlayer } from '@/components/student/CoursePlayer'

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ ecId: string }>
}) {
  const { ecId } = await params
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <CoursePlayer ecId={ecId} />
    </div>
  )
}

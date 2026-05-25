import { ElearningCourseList } from '@/components/student/ElearningCourseList'

export default function StudentCoursesPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes cours</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Accédez à vos cours e-learning et progressez à votre rythme.
        </p>
      </div>
      <ElearningCourseList />
    </div>
  )
}

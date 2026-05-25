import { ElearningEditor } from '@/components/teacher/ElearningEditor'

export default async function TeacherElearningPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">E-Learning</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez le contenu, les devoirs et les quiz de ce cours.
        </p>
      </div>
      <ElearningEditor courseId={id} />
    </div>
  )
}

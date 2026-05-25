import { ThesisPanel } from '@/components/student/ThesisPanel'

export default function StudentThesisPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🎓 Thèse de laurea</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Soumettez votre sujet de thèse et suivez l'avancement de votre dossier.
        </p>
      </div>
      <ThesisPanel />
    </div>
  )
}

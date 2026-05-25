import { ThesisManager } from '@/components/admin/ThesisManager'

export default function AdminThesisPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🎓 Thèses</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez les soumissions de thèse et planifiez les soutenances.
        </p>
      </div>
      <ThesisManager />
    </div>
  )
}

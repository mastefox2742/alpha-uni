interface Props { nextExamDate: string | null }

export function NextExamCard({ nextExamDate }: Props) {
  const formatted = nextExamDate
    ? new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }).format(new Date(nextExamDate))
    : null

  const daysUntil = nextExamDate
    ? Math.ceil((new Date(nextExamDate).getTime() - Date.now()) / 86_400_000)
    : null

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">Prochain examen</p>
      {formatted ? (
        <>
          <p className="mt-2 text-sm font-semibold">{formatted}</p>
          {daysUntil !== null && daysUntil >= 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {daysUntil === 0 ? "Aujourd'hui !" : `Dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`}
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Aucun examen prévu</p>
      )}
    </div>
  )
}

interface Props { gpa: number }

function gpaColor(gpa: number): string {
  if (gpa >= 27) return 'text-green-600'
  if (gpa >= 23) return 'text-yellow-600'
  if (gpa >= 18) return 'text-orange-600'
  return 'text-muted-foreground'
}

export function GpaCard({ gpa }: Props) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">Moyenne (GPA)</p>
      <p className={`mt-2 text-4xl font-bold tabular-nums ${gpaColor(gpa)}`}>
        {gpa > 0 ? gpa.toFixed(2) : '—'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">sur 30</p>
    </div>
  )
}

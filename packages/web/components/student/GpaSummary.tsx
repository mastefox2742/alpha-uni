import type { LibrettoEntry } from '@/lib/hooks/useLibretto'

interface Props { entries: LibrettoEntry[] }

export function GpaSummary({ entries }: Props) {
  const totalCfu = entries.reduce((s, e) => s + e.cfu, 0)

  const weightedSum = entries.reduce((s, e) => {
    const val = e.grade === '30L' ? 30 : Number(e.grade)
    return s + (isNaN(val) ? 0 : val * e.cfu)
  }, 0)

  const gpa = totalCfu > 0 ? weightedSum / totalCfu : 0

  return (
    <div className="flex flex-wrap items-center gap-6 rounded-xl border bg-card p-4">
      <Stat label="Matières validées" value={entries.length} />
      <Stat label="CFU obtenus"       value={totalCfu} />
      <Stat label="Moyenne pondérée"  value={gpa > 0 ? `${gpa.toFixed(2)} / 30` : '—'} highlight />
    </div>
  )
}

function Stat({
  label, value, highlight,
}: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${highlight ? 'text-primary' : ''}`}>
        {value}
      </p>
    </div>
  )
}

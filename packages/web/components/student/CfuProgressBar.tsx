interface Props {
  earned: number
  total:  number
  pct:    number
}

export function CfuProgressBar({ earned, total, pct }: Props) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Progression CFU</p>
        <p className="text-sm font-semibold">{earned} / {total} CFU</p>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-right text-xs text-muted-foreground">{pct}%</p>
    </div>
  )
}

interface Props { amount: number }

export function PendingFeesCard({ amount }: Props) {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR',
  }).format(amount)

  return (
    <div className={`rounded-xl border bg-card p-6 shadow-sm ${amount > 0 ? 'border-destructive/30' : ''}`}>
      <p className="text-sm font-medium text-muted-foreground">Frais en attente</p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${amount > 0 ? 'text-destructive' : 'text-green-600'}`}>
        {amount > 0 ? formatted : '✓ À jour'}
      </p>
      {amount > 0 && (
        <p className="mt-1 text-xs text-destructive/80">Paiement requis</p>
      )}
    </div>
  )
}

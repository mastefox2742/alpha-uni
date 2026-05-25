'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useStudentFees, type FeeEntry } from '@/lib/hooks/useStudentFees'

function statusConfig(status: FeeEntry['status']) {
  const map = {
    pending:  { label: 'En attente',  cls: 'bg-yellow-100 text-yellow-700' },
    overdue:  { label: 'En retard',   cls: 'bg-red-100 text-red-700' },
    paid:     { label: 'Payé',        cls: 'bg-green-100 text-green-700' },
    waived:   { label: 'Exonéré',     cls: 'bg-blue-100 text-blue-700' },
  }
  return map[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' }
}

function AmountCard({
  label, amount, icon, variant,
}: {
  label: string; amount: number; icon: string; variant?: 'danger' | 'success' | 'default'
}) {
  const bg =
    variant === 'danger'  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
    variant === 'success' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
    'bg-card'

  const textColor =
    variant === 'danger'  ? 'text-red-600' :
    variant === 'success' ? 'text-green-600' :
    'text-foreground'

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${bg}`}>
      <p className="text-2xl">{icon}</p>
      <p className={`mt-3 text-2xl font-bold ${textColor}`}>
        {amount.toFixed(2)} €
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function FeesPanel() {
  const { data, isLoading, isError } = useStudentFees()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Impossible de charger les frais.</p>
  }

  const { fees, pending, overdue, paid } = data

  return (
    <div className="space-y-6">
      {/* Résumé */}
      <div className="grid gap-4 sm:grid-cols-3">
        <AmountCard
          icon="⏳"
          label="En attente"
          amount={pending}
          variant={pending > 0 ? 'default' : 'default'}
        />
        <AmountCard
          icon="⚠️"
          label="En retard"
          amount={overdue}
          variant={overdue > 0 ? 'danger' : 'default'}
        />
        <AmountCard
          icon="✅"
          label="Payé cette année"
          amount={paid}
          variant="success"
        />
      </div>

      {/* Alerte retard */}
      {overdue > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            ⚠️ Vous avez <strong>{overdue.toFixed(2)} €</strong> de frais en retard. Contactez le secrétariat.
          </p>
        </div>
      )}

      {/* Tableau des frais */}
      {fees.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          <p className="text-3xl">💶</p>
          <p className="mt-2 text-sm">Aucun frais de scolarité trouvé.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left">Année</th>
                <th className="px-4 py-3 text-left">Échéance</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-right">Pénalité</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-left">Payé le</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee: FeeEntry) => {
                const sc = statusConfig(fee.status)
                return (
                  <tr key={fee.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm">
                      {(fee.academic_years as any)?.label ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(fee.due_date), 'd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      {Number(fee.amount).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-red-600">
                      {fee.late_fee && Number(fee.late_fee) > 0
                        ? `+${Number(fee.late_fee).toFixed(2)} €`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {fee.paid_at
                        ? format(new Date(fee.paid_at), 'd MMM yyyy', { locale: fr })
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

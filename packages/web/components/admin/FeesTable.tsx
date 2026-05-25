'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { useAdminFees, useMarkFeePaid, useWaiveFee } from '@/lib/hooks/useAdminFees'

const STATUS_OPTIONS = [
  { value: '',        label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'overdue', label: 'En retard' },
  { value: 'paid',    label: 'Payés' },
  { value: 'waived',  label: 'Exonérés' },
]

const statusCfg: Record<string, { label: string; cls: string }> = {
  pending: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-700' },
  overdue: { label: 'En retard',  cls: 'bg-red-100 text-red-700' },
  paid:    { label: 'Payé',       cls: 'bg-green-100 text-green-700' },
  waived:  { label: 'Exonéré',    cls: 'bg-blue-100 text-blue-700' },
}

function PayModal({
  fee,
  onClose,
}: {
  fee: any
  onClose: () => void
}) {
  const [ref, setRef]     = useState('')
  const [method, setMethod] = useState('bank_transfer')
  const { mutateAsync, isPending } = useMarkFeePaid()

  async function handlePay() {
    if (!ref.trim()) { toast.error('Référence requise'); return }
    try {
      const total = Number(fee.amount) + Number(fee.late_fee ?? 0)
      await mutateAsync({ feeId: fee.id, paymentRef: ref, method, amount: total })
      toast.success('Paiement enregistré')
      onClose()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const student = fee.students
  const profile = student?.profiles

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        <h3 className="text-lg font-bold mb-4">Enregistrer un paiement</h3>

        <p className="text-sm text-muted-foreground mb-4">
          {profile?.first_name} {profile?.last_name} — {student?.matricola ?? '—'}
          <br />
          Montant : <strong>{(Number(fee.amount) + Number(fee.late_fee ?? 0)).toFixed(2)} €</strong>
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Référence de paiement</label>
            <input
              type="text"
              value={ref}
              onChange={e => setRef(e.target.value)}
              placeholder="VIR-2025-001, REF-XYZ..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mode de paiement</label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="bank_transfer">Virement bancaire</option>
              <option value="card">Carte bancaire</option>
              <option value="cash">Espèces</option>
              <option value="check">Chèque</option>
              <option value="online">Paiement en ligne</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex gap-2 justify-end">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
            Annuler
          </button>
          <button
            onClick={handlePay}
            disabled={isPending}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isPending ? 'Enregistrement...' : '✅ Confirmer le paiement'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function FeesTable() {
  const [status, setStatus] = useState('')
  const [payingFee, setPayingFee] = useState<any>(null)
  const feesFilter = status ? { status } : {}
  const { data: fees, isLoading } = useAdminFees(feesFilter)
  const { mutateAsync: waive, isPending: waiving } = useWaiveFee()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {payingFee && <PayModal fee={payingFee} onClose={() => setPayingFee(null)} />}

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`rounded-full px-3 py-1 text-sm transition-all ${
              status === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Récap */}
      {fees && fees.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>{fees.length} frais</span>
          <span className="text-red-600 font-medium">
            En retard : {fees.filter((f: any) => f.status === 'overdue').length}
          </span>
          <span>
            Total dû : {fees
              .filter((f: any) => ['pending', 'overdue'].includes(f.status))
              .reduce((s: number, f: any) => s + Number(f.amount) + Number(f.late_fee ?? 0), 0)
              .toFixed(2)} €
          </span>
        </div>
      )}

      {/* Tableau */}
      {!fees || fees.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Aucun frais trouvé.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left">Étudiant</th>
                <th className="px-4 py-3 text-left">Année</th>
                <th className="px-4 py-3 text-left">Échéance</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-right">Pénalité</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee: any) => {
                const student = fee.students
                const profile = student?.profiles
                const sc      = statusCfg[fee.status] ?? { label: fee.status, cls: 'bg-muted text-muted-foreground' }
                const canAct  = ['pending', 'overdue'].includes(fee.status)

                return (
                  <tr key={fee.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
                      <p className="text-xs text-muted-foreground">{student?.matricola ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
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
                    <td className="px-4 py-3">
                      {canAct && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setPayingFee(fee)}
                            className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                          >
                            Payer
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Exonérer ce frais ?')) return
                              try {
                                await waive({ feeId: fee.id })
                                toast.success('Frais exonéré')
                              } catch (err) {
                                toast.error((err as Error).message)
                              }
                            }}
                            disabled={waiving}
                            className="rounded border px-2 py-1 text-xs hover:bg-accent"
                          >
                            Exonérer
                          </button>
                        </div>
                      )}
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

'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { useAllTheses, useUpdateThesisStatus } from '@/lib/hooks/useThesis'

const STATUS_OPTIONS = [
  { value: '',             label: 'Tous les statuts' },
  { value: 'submitted',    label: 'Soumises' },
  { value: 'under_review', label: 'En révision' },
  { value: 'approved',     label: 'Approuvées' },
  { value: 'rejected',     label: 'Refusées' },
  { value: 'defended',     label: 'Soutenues' },
]

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  draft:        { label: 'Brouillon',   cls: 'bg-muted text-muted-foreground' },
  submitted:    { label: 'Soumise',     cls: 'bg-blue-100 text-blue-700' },
  under_review: { label: 'En révision', cls: 'bg-yellow-100 text-yellow-700' },
  approved:     { label: 'Approuvée',   cls: 'bg-green-100 text-green-700' },
  rejected:     { label: 'Refusée',     cls: 'bg-red-100 text-red-700' },
  defended:     { label: 'Soutenue ✨', cls: 'bg-purple-100 text-purple-700' },
}

function ReviewModal({
  thesis,
  onClose,
}: { thesis: any; onClose: () => void }) {
  const updateM = useUpdateThesisStatus()
  const [status, setStatus]           = useState<string>(thesis.status)
  const [notes, setNotes]             = useState<string>(thesis.notes ?? '')
  const [defenseDate, setDefenseDate] = useState<string>(thesis.defense_date ?? '')

  const student = thesis.students
  const profile = student?.profiles

  async function handleSave() {
    try {
      const body: { id: string; status: string; notes?: string; defenseDate?: string } = {
        id: thesis.id, status,
      }
      if (notes)       body.notes       = notes
      if (defenseDate) body.defenseDate = defenseDate
      await updateM.mutateAsync(body)
      toast.success('Statut mis à jour')
      onClose()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-card shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-bold">Révision de thèse</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <p className="font-semibold">{thesis.title}</p>
            <p className="text-sm text-muted-foreground">
              {profile?.last_name} {profile?.first_name} — {student?.matricola ?? '—'}
            </p>
            {thesis.advisor_name && (
              <p className="text-sm text-muted-foreground">
                Dir. : {thesis.advisor_name}
                {thesis.co_advisor_name && ` • Co-dir. : ${thesis.co_advisor_name}`}
              </p>
            )}
          </div>

          {thesis.abstract && (
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Abstract</p>
              <p className="text-sm leading-relaxed">{thesis.abstract}</p>
            </div>
          )}

          {thesis.document_url && (
            <a href={thesis.document_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary underline">
              📄 Voir le document
            </a>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Nouveau statut</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="submitted">Soumise</option>
                <option value="under_review">En révision</option>
                <option value="approved">Approuvée</option>
                <option value="rejected">Refusée</option>
                <option value="defended">Soutenue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date de soutenance</label>
              <input
                type="date"
                value={defenseDate}
                onChange={e => setDefenseDate(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Commentaire pour l'étudiant</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Remarques, corrections demandées..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>

        <div className="border-t px-6 py-4 flex gap-2 justify-end">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={updateM.isPending}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {updateM.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ThesisManager() {
  const [statusFilter, setStatusFilter] = useState('')
  const [reviewing, setReviewing]       = useState<any>(null)
  const { data: theses, isLoading }     = useAllTheses(statusFilter || undefined)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviewing && <ReviewModal thesis={reviewing} onClose={() => setReviewing(null)} />}

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`rounded-full px-3 py-1 text-sm transition-all ${
              statusFilter === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Récap */}
      {theses && theses.length > 0 && (
        <p className="text-sm text-muted-foreground">{theses.length} thèse(s)</p>
      )}

      {!theses || theses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
          Aucune thèse trouvée.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left">Étudiant</th>
                <th className="px-4 py-3 text-left">Titre</th>
                <th className="px-4 py-3 text-left">Directeur</th>
                <th className="px-4 py-3 text-left">Soumis le</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {theses.map((t: any) => {
                const student = t.students
                const profile = student?.profiles
                const sc      = STATUS_CFG[t.status] ?? { label: t.status, cls: 'bg-muted text-muted-foreground' }

                return (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium">{profile?.last_name} {profile?.first_name}</p>
                      <p className="text-xs text-muted-foreground">{student?.matricola ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs">
                      <p className="truncate font-medium">{t.title}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {t.advisor_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {t.submitted_at
                        ? format(new Date(t.submitted_at), 'd MMM yyyy', { locale: fr })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setReviewing(t)}
                        className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent whitespace-nowrap"
                      >
                        Réviser
                      </button>
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

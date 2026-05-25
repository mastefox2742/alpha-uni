'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  applicationId:   string
  currentStatus:   string
  allDocsVerified: boolean
}

export function ApplicationActions({ applicationId, currentStatus, allDocsVerified }: Props) {
  const router = useRouter()
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm]   = useState(false)
  const [loading, setLoading] = useState(false)

  async function action(type: 'enroll' | 'reject') {
    setLoading(true)
    const endpoint = type === 'enroll'
      ? `/api/students/${applicationId}/enroll`
      : `/api/students/${applicationId}/reject`

    const body = type === 'reject' ? { reason: rejectionReason } : {}

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (res.ok) router.push('/admin/students')
    else alert('Erreur. Réessayez.')
  }

  if (currentStatus === 'approved') {
    return <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">✓ Dossier validé</span>
  }
  if (currentStatus === 'rejected') {
    return <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">✗ Dossier rejeté</span>
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => action('enroll')}
          disabled={loading || !allDocsVerified}
          title={!allDocsVerified ? 'Validez tous les documents d\'abord' : ''}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40">
          {loading ? '⏳' : '✅ Valider l\'immatriculation'}
        </button>
        <button
          onClick={() => setShowRejectForm(v => !v)}
          disabled={loading}
          className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-40">
          ❌ Rejeter
        </button>
      </div>

      {showRejectForm && (
        <div className="w-full max-w-sm space-y-2 rounded-lg border bg-card p-3">
          <label className="text-sm font-medium">Motif du rejet</label>
          <textarea
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            rows={3}
            placeholder="Documents manquants, informations incorrectes…"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => action('reject')}
            disabled={!rejectionReason.trim() || loading}
            className="w-full rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-40">
            Confirmer le rejet
          </button>
        </div>
      )}
    </div>
  )
}

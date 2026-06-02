'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type AppStatus  = 'pending' | 'under_review' | 'approved' | 'refused' | 'incomplete'
type DocStatus  = 'missing' | 'uploaded' | 'verified' | 'rejected'
type Nationality = 'FR' | 'EU' | 'INT'

interface Document {
  id:     string
  label:  string
  status: DocStatus
}

interface Application {
  id:           string
  firstName:    string
  lastName:     string
  email:        string
  program:      string
  year:         string
  nationality:  Nationality
  submittedAt:  string
  status:       AppStatus
  matricola:    string | undefined
  docs:         Document[]
  notes:        string
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const APPLICATIONS: Application[] = [
  {
    id: 'app1',
    firstName: 'Axel', lastName: 'Beaumont', email: 'axel.beaumont@email.fr',
    program: 'M1 Informatique', year: '2026-2027', nationality: 'FR',
    submittedAt: '22/05/2026', status: 'pending', matricola: undefined,
    docs: [
      { id: 'd1', label: 'Pièce d\'identité',       status: 'verified' },
      { id: 'd2', label: 'Diplôme Licence',          status: 'verified' },
      { id: 'd3', label: 'Relevé de notes L3',       status: 'uploaded' },
      { id: 'd4', label: 'Lettre de motivation',     status: 'verified' },
      { id: 'd5', label: 'Attestation financement',  status: 'missing'  },
    ],
    notes: '',
  },
  {
    id: 'app2',
    firstName: 'Sara', lastName: 'Nakamura', email: 'sara.nakamura@email.jp',
    program: 'M2 Informatique', year: '2026-2027', nationality: 'INT',
    submittedAt: '21/05/2026', status: 'under_review', matricola: undefined,
    docs: [
      { id: 'd1', label: 'Passeport',                   status: 'verified' },
      { id: 'd2', label: 'Visa étudiant',               status: 'uploaded' },
      { id: 'd3', label: 'Diplôme équivalence L3',      status: 'verified' },
      { id: 'd4', label: 'Traduction apostillée',       status: 'uploaded' },
      { id: 'd5', label: 'Justificatif financier',      status: 'verified' },
      { id: 'd6', label: 'Assurance maladie',           status: 'missing'  },
    ],
    notes: 'Dossier bien constitué — vérifier équivalence diplôme japonais.',
  },
  {
    id: 'app3',
    firstName: 'Lena', lastName: 'Müller', email: 'lena.muller@tu-berlin.de',
    program: 'M1 Réseaux & Télécoms', year: '2026-2027', nationality: 'EU',
    submittedAt: '20/05/2026', status: 'pending', matricola: undefined,
    docs: [
      { id: 'd1', label: 'Carte d\'identité UE',   status: 'verified' },
      { id: 'd2', label: 'Diplôme Bachelor',        status: 'verified' },
      { id: 'd3', label: 'Relevé de notes',         status: 'verified' },
      { id: 'd4', label: 'Contrat Erasmus+',        status: 'uploaded' },
    ],
    notes: '',
  },
  {
    id: 'app4',
    firstName: 'Kevin', lastName: 'Tremblay', email: 'k.tremblay@uqam.ca',
    program: 'M1 Informatique', year: '2026-2027', nationality: 'INT',
    submittedAt: '18/05/2026', status: 'incomplete', matricola: undefined,
    docs: [
      { id: 'd1', label: 'Passeport',               status: 'verified'  },
      { id: 'd2', label: 'Visa étudiant',            status: 'missing'   },
      { id: 'd3', label: 'Diplôme Bachelor',         status: 'missing'   },
      { id: 'd4', label: 'Relevé de notes',          status: 'rejected'  },
    ],
    notes: 'Dossier incomplet. Relance envoyée le 20/05.',
  },
  {
    id: 'app5',
    firstName: 'Marie', lastName: 'Kowalski', email: 'm.kowalski@uw.edu.pl',
    program: 'M2 Mathématiques', year: '2026-2027', nationality: 'EU',
    submittedAt: '15/05/2026', status: 'approved', matricola: 'MAT20260301',
    docs: [
      { id: 'd1', label: 'Carte d\'identité UE',   status: 'verified' },
      { id: 'd2', label: 'Diplôme Master 1',        status: 'verified' },
      { id: 'd3', label: 'Relevé de notes M1',      status: 'verified' },
    ],
    notes: 'Dossier complet. Matricule attribué le 20/05/2026.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function appStatusInfo(s: AppStatus): { label: string; cls: string } {
  const m: Record<AppStatus, { label: string; cls: string }> = {
    pending:      { label: 'En attente',    cls: 'bg-amber-100 text-amber-700' },
    under_review: { label: 'En révision',   cls: 'bg-blue-100 text-blue-700' },
    approved:     { label: 'Approuvé',      cls: 'bg-emerald-100 text-emerald-700' },
    refused:      { label: 'Refusé',        cls: 'bg-red-100 text-red-700' },
    incomplete:   { label: 'Incomplet',     cls: 'bg-orange-100 text-orange-700' },
  }
  return m[s]
}

function docStatusIcon(s: DocStatus) {
  if (s === 'verified')  return <span className="text-emerald-600 text-xs font-bold">✓</span>
  if (s === 'uploaded')  return <span className="text-blue-500 text-xs">⟳</span>
  if (s === 'rejected')  return <span className="text-red-500 text-xs font-bold">✗</span>
  return <span className="text-slate-400 text-xs">○</span>
}

function natBadge(n: Nationality) {
  const m: Record<Nationality, { label: string; cls: string }> = {
    FR:  { label: '🇫🇷 Français',        cls: 'bg-blue-100 text-blue-700' },
    EU:  { label: '🇪🇺 UE/Erasmus+',     cls: 'bg-indigo-100 text-indigo-700' },
    INT: { label: '🌍 International',    cls: 'bg-violet-100 text-violet-700' },
  }
  const { label, cls } = m[n]
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>{label}</span>
}

// ─── Application Detail Modal ─────────────────────────────────────────────────
function AppModal({
  app,
  onClose,
}: {
  app:     Application
  onClose: () => void
}) {
  const [status, setStatus]   = useState<AppStatus>(app.status)
  const [note,   setNote]     = useState(app.notes)
  const [mat,    setMat]      = useState(app.matricola ?? '')
  const [saved,  setSaved]    = useState(false)

  function decide(s: AppStatus) {
    setStatus(s)
  }

  function save() {
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1500)
  }

  const { label, cls } = appStatusInfo(status)
  const allVerified = app.docs.every(d => d.status === 'verified')
  const missingCount = app.docs.filter(d => d.status === 'missing' || d.status === 'rejected').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-card shadow-xl" style={{ maxHeight: '90vh' }}>
        <div className="border-b px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">Dossier d'immatriculation</h3>
            <p className="text-sm text-muted-foreground">{app.firstName} {app.lastName} · {app.program} · {app.year}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {saved && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 text-center">
              ✅ Décision enregistrée
            </div>
          )}

          {/* Student info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs text-muted-foreground">Email</span><p className="font-medium">{app.email}</p></div>
            <div><span className="text-xs text-muted-foreground">Nationalité</span><div className="mt-0.5">{natBadge(app.nationality)}</div></div>
            <div><span className="text-xs text-muted-foreground">Soumis le</span><p className="font-medium">{app.submittedAt}</p></div>
            <div><span className="text-xs text-muted-foreground">Statut actuel</span><div className="mt-0.5"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span></div></div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Pièces justificatives ({app.docs.filter(d => d.status === 'verified').length}/{app.docs.length} vérifiées)
            </h4>
            <div className="space-y-1.5">
              {app.docs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                  <span>{doc.label}</span>
                  <div className="flex items-center gap-1.5">
                    {docStatusIcon(doc.status)}
                    <span className="text-xs text-muted-foreground capitalize">{
                      doc.status === 'verified' ? 'Vérifié' :
                      doc.status === 'uploaded' ? 'Téléversé' :
                      doc.status === 'rejected' ? 'Rejeté' : 'Manquant'
                    }</span>
                  </div>
                </div>
              ))}
            </div>
            {missingCount > 0 && (
              <p className="mt-2 text-xs text-orange-600">⚠️ {missingCount} pièce{missingCount > 1 ? 's' : ''} manquante{missingCount > 1 ? 's' : ''} ou rejetée{missingCount > 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Matricula */}
          {status === 'approved' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Numéro de matricule</label>
              <input
                type="text"
                value={mat}
                onChange={e => setMat(e.target.value)}
                placeholder="ex. MAT20260312"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Notes internes</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Workflow automation badge */}
          {allVerified && status === 'pending' && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm dark:border-emerald-800 dark:bg-emerald-950/20">
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">✅ Éligible à l'approbation automatique</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Tous les documents sont vérifiés. Un matricule peut être attribué automatiquement.
              </p>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4 flex flex-wrap gap-2">
          <button onClick={() => decide('refused')} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
            ✗ Refuser
          </button>
          <button onClick={() => decide('incomplete')} className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted">
            ⟳ Pièces manquantes
          </button>
          <button onClick={() => decide('under_review')} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
            🔍 Mettre en révision
          </button>
          <button onClick={() => decide('approved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            ✓ Approuver & Matriculer
          </button>
          <button onClick={save} className="ml-auto rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminStudents() {
  const [filter,   setFilter]   = useState<AppStatus | 'all'>('all')
  const [selected, setSelected] = useState<Application | null>(null)
  const [search,   setSearch]   = useState('')

  const filtered = APPLICATIONS.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || `${a.firstName} ${a.lastName} ${a.program} ${a.email}`.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const STATUS_FILTERS: Array<{ value: AppStatus | 'all'; label: string }> = [
    { value: 'all',          label: 'Tous' },
    { value: 'pending',      label: 'En attente' },
    { value: 'under_review', label: 'En révision' },
    { value: 'incomplete',   label: 'Incomplets' },
    { value: 'approved',     label: 'Approuvés' },
    { value: 'refused',      label: 'Refusés' },
  ]

  const pendingCount = APPLICATIONS.filter(a => a.status === 'pending').length

  return (
    <div className="space-y-6">
      {selected && <AppModal app={selected} onClose={() => setSelected(null)} />}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dossiers & Inscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Vérification des pièces, validation et attribution des matricules.</p>
        </div>
        {pendingCount > 0 && (
          <span className="rounded-full bg-rose-600 px-3 py-1 text-sm font-bold text-white">
            {pendingCount} en attente
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUS_FILTERS.filter(f => f.value !== 'all').map(f => {
          const count = APPLICATIONS.filter(a => a.status === f.value).length
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-xl border p-3 text-center shadow-sm transition-colors ${filter === f.value ? 'border-rose-300 bg-rose-50' : 'bg-card hover:bg-muted/50'}`}
            >
              <p className="text-xl font-bold">{count}</p>
              <p className="text-[10px] text-muted-foreground">{f.label}</p>
            </button>
          )
        })}
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Rechercher un étudiant…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.value ? 'bg-rose-600 text-white' : 'border hover:bg-muted text-muted-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 text-left">Étudiant</th>
              <th className="px-4 py-3 text-left">Programme</th>
              <th className="px-4 py-3 text-left">Nationalité</th>
              <th className="px-4 py-3 text-left">Documents</th>
              <th className="px-4 py-3 text-left">Soumis le</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(app => {
              const { label, cls } = appStatusInfo(app.status)
              const verified = app.docs.filter(d => d.status === 'verified').length
              const total    = app.docs.length
              return (
                <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{app.firstName} {app.lastName}</p>
                    <p className="text-xs text-muted-foreground">{app.email}</p>
                    {app.matricola && (
                      <p className="text-xs font-mono text-emerald-600">{app.matricola}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{app.program}</td>
                  <td className="px-4 py-3">{natBadge(app.nationality)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${verified === total ? 'bg-emerald-500' : 'bg-amber-400'}`}
                          style={{ width: `${(verified / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{verified}/{total}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{app.submittedAt}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(app)}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                    >
                      Traiter
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Aucun dossier trouvé.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

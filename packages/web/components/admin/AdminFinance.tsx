'use client'

import { useState } from 'react'

type PayStatus = 'paid' | 'partial' | 'overdue' | 'blocked' | 'exempt'

interface Scholarship { id: string; name: string; reduction: number }
interface FeeRecord {
  id:          string
  firstName:   string
  lastName:    string
  matricola:   string
  program:     string
  year:        string
  totalDue:    number
  paid:        number
  dueDate:     string
  status:      PayStatus
  scholarship: Scholarship | undefined
  blocked:     boolean
  notes:       string
}

const SCHOLARSHIPS: Scholarship[] = [
  { id: 'b1', name: 'Bourse CROUS échelon 5',     reduction: 100 },
  { id: 'b2', name: 'Bourse CROUS échelon 3',     reduction: 60  },
  { id: 'b3', name: 'Bourse excellence mérite',   reduction: 50  },
  { id: 'b4', name: 'Aide spécifique ponctuelle', reduction: 30  },
]

const FEES: FeeRecord[] = [
  { id: 'f1', firstName: 'Lucas',   lastName: 'Moreau',    matricola: 'MAT20240034', program: 'L3 Informatique',    year: '2025-2026', totalDue: 3500, paid: 3500, dueDate: '15/10/2025', status: 'paid',     scholarship: undefined,      blocked: false, notes: '' },
  { id: 'f2', firstName: 'Marie',   lastName: 'Dupont',    matricola: 'MAT20240021', program: 'L3 Informatique',    year: '2025-2026', totalDue: 3500, paid: 1400, dueDate: '15/01/2026', status: 'partial',  scholarship: SCHOLARSHIPS[2], blocked: false, notes: 'Paiement en 3 fois accordé.' },
  { id: 'f3', firstName: 'Théo',    lastName: 'Richard',   matricola: 'MAT20240046', program: 'L3 Bases de données',year: '2025-2026', totalDue: 3500, paid: 0,    dueDate: '15/10/2025', status: 'overdue',  scholarship: undefined,      blocked: true,  notes: 'Relance ×3. Mise en demeure envoyée.' },
  { id: 'f4', firstName: 'Zoé',     lastName: 'Chevalier', matricola: 'MAT20240055', program: 'L2 Informatique',    year: '2025-2026', totalDue: 3500, paid: 0,    dueDate: '15/10/2025', status: 'exempt',   scholarship: SCHOLARSHIPS[0], blocked: false, notes: 'Exonération totale bourse CROUS.' },
  { id: 'f5', firstName: 'Omar',    lastName: 'Khalil',    matricola: 'MAT20230178', program: 'M2 Informatique',    year: '2025-2026', totalDue: 5800, paid: 2900, dueDate: '01/03/2026', status: 'partial',  scholarship: undefined,      blocked: false, notes: '' },
  { id: 'f6', firstName: 'Anaïs',   lastName: 'Perrin',    matricola: 'MAT20240011', program: 'L3 Informatique',    year: '2025-2026', totalDue: 3500, paid: 0,    dueDate: '15/11/2025', status: 'blocked',  scholarship: undefined,      blocked: true,  notes: 'Compte bloqué — accès examens suspendu.' },
  { id: 'f7', firstName: 'Elisa',   lastName: 'Fontaine',  matricola: 'MAT20230145', program: 'M2 Informatique',    year: '2025-2026', totalDue: 5800, paid: 5800, dueDate: '01/10/2025', status: 'paid',     scholarship: SCHOLARSHIPS[1], blocked: false, notes: '' },
]

function statusInfo(s: PayStatus): { label: string; cls: string } {
  const m: Record<PayStatus, { label: string; cls: string }> = {
    paid:     { label: 'Payé',        cls: 'bg-emerald-100 text-emerald-700' },
    partial:  { label: 'Partiel',     cls: 'bg-amber-100 text-amber-700' },
    overdue:  { label: 'En retard',   cls: 'bg-orange-100 text-orange-700' },
    blocked:  { label: 'Bloqué',      cls: 'bg-red-100 text-red-700' },
    exempt:   { label: 'Exonéré',     cls: 'bg-violet-100 text-violet-700' },
  }
  return m[s]
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

// ─── Action Modal ─────────────────────────────────────────────────────────────
function FeeModal({ fee, onClose }: { fee: FeeRecord; onClose: () => void }) {
  const [blocked,  setBlocked]  = useState(fee.blocked)
  const [schol,    setSchol]    = useState(fee.scholarship?.id ?? '')
  const [payment,  setPayment]  = useState('')
  const [note,     setNote]     = useState(fee.notes)
  const [saved,    setSaved]    = useState(false)

  const selectedSchol = SCHOLARSHIPS.find(s => s.id === schol)
  const effectiveDue  = selectedSchol
    ? Math.max(0, fee.totalDue * (1 - selectedSchol.reduction / 100))
    : fee.totalDue

  function save() {
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl space-y-4">
        <h3 className="font-semibold">Gestion financière — {fee.firstName} {fee.lastName}</h3>
        <p className="text-sm text-muted-foreground">{fee.matricola} · {fee.program} · {fee.year}</p>

        {saved && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 text-center">✅ Modifications enregistrées</div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-lg font-bold">{fmt(fee.totalDue)}</p>
            <p className="text-xs text-muted-foreground">Total dû</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-lg font-bold text-emerald-600">{fmt(fee.paid)}</p>
            <p className="text-xs text-muted-foreground">Payé</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className={`text-lg font-bold ${fee.totalDue - fee.paid > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {fmt(fee.totalDue - fee.paid)}
            </p>
            <p className="text-xs text-muted-foreground">Solde</p>
          </div>
        </div>

        {/* Scholarship */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Bourse / Exonération</label>
          <select
            value={schol}
            onChange={e => setSchol(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">— Aucune bourse —</option>
            {SCHOLARSHIPS.map(s => (
              <option key={s.id} value={s.id}>{s.name} (−{s.reduction}%)</option>
            ))}
          </select>
          {selectedSchol && (
            <p className="mt-1 text-xs text-violet-600">
              Frais effectifs après bourse : <strong>{fmt(effectiveDue)}</strong>
            </p>
          )}
        </div>

        {/* Manual payment */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Saisir un paiement manuel (€)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={payment}
              onChange={e => setPayment(e.target.value)}
              placeholder="Montant"
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Valider
            </button>
          </div>
        </div>

        {/* Block toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Bloquer le compte étudiant</p>
            <p className="text-xs text-muted-foreground">Empêche l'inscription aux examens et sessions</p>
          </div>
          <button
            onClick={() => setBlocked(v => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${blocked ? 'bg-red-500' : 'bg-muted-foreground/30'}`}
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: `translateX(${blocked ? '1.375rem' : '0.125rem'}) translateY(0.125rem)` }}
            />
          </button>
        </div>

        {blocked && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/20">
            🔒 Compte bloqué — l'étudiant ne pourra pas se prénoter aux examens.
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Notes internes</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted">Annuler</button>
          <button onClick={save} className="flex-1 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700">Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminFinance() {
  const [filter,   setFilter]   = useState<PayStatus | 'all'>('all')
  const [selected, setSelected] = useState<FeeRecord | null>(null)
  const [search,   setSearch]   = useState('')

  const filtered = FEES.filter(f => {
    const q = search.toLowerCase()
    const matchSearch = !q || `${f.firstName} ${f.lastName} ${f.matricola}`.toLowerCase().includes(q)
    return (filter === 'all' || f.status === filter) && matchSearch
  })

  const totalCollected = FEES.reduce((s, f) => s + f.paid, 0)
  const totalDue       = FEES.reduce((s, f) => s + f.totalDue, 0)
  const blockedCount   = FEES.filter(f => f.blocked).length
  const overdueCount   = FEES.filter(f => f.status === 'overdue' || f.status === 'blocked').length

  return (
    <div className="space-y-6">
      {selected && <FeeModal fee={selected} onClose={() => setSelected(null)} />}

      <div>
        <h1 className="text-2xl font-bold">Comptabilité & Taxes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Suivi des paiements, bourses et gestion des comptes bloqués.</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total collecté',    value: fmt(totalCollected),  color: 'text-emerald-600' },
          { label: 'Restant à recouvrer',value: fmt(totalDue - totalCollected), color: 'text-rose-600' },
          { label: 'En retard / litige', value: overdueCount, color: 'text-orange-600' },
          { label: 'Comptes bloqués',   value: blockedCount,  color: 'text-red-600' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3">
        <input type="search" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
        <div className="flex flex-wrap gap-1.5">
          {(['all','paid','partial','overdue','blocked','exempt'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-rose-600 text-white' : 'border hover:bg-muted text-muted-foreground'}`}>
              {f === 'all' ? 'Tous' : statusInfo(f).label}
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
              <th className="px-4 py-3 text-right">Total dû</th>
              <th className="px-4 py-3 text-right">Payé</th>
              <th className="px-4 py-3 text-left">Bourse</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(fee => {
              const { label, cls } = statusInfo(fee.status)
              const pct = fee.totalDue > 0 ? Math.round((fee.paid / fee.totalDue) * 100) : 100
              return (
                <tr key={fee.id} className={`hover:bg-muted/30 transition-colors ${fee.blocked ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{fee.firstName} {fee.lastName}</p>
                    <p className="text-xs font-mono text-muted-foreground">{fee.matricola}</p>
                    {fee.blocked && <span className="text-[10px] text-red-600 font-bold">🔒 BLOQUÉ</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{fee.program}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{fmt(fee.totalDue)}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-mono text-xs font-semibold text-emerald-600">{fmt(fee.paid)}</p>
                    <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-muted ml-auto">
                      <div className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {fee.scholarship
                      ? <span className="text-xs text-violet-600">−{fee.scholarship.reduction}%</span>
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(fee)} className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                      Gérer
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

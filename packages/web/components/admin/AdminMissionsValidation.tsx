'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type MissionStatus = 'pending' | 'approved' | 'refused' | 'reimbursed'

interface ExpenseLine {
  label:  string
  amount: number
}

interface Mission {
  id:          string
  teacher:     string
  department:  string
  destination: string
  purpose:     string
  startDate:   string
  endDate:     string
  transport:   string
  totalAmount: number
  expenses:    ExpenseLine[]
  status:      MissionStatus
  submittedAt: string
  justification:string
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const MISSIONS: Mission[] = [
  {
    id: 'M001', teacher: 'Prof. Jean Martin', department: 'Informatique',
    destination: 'Berlin, Allemagne', purpose: 'Conférence ICML 2026 — présentation article',
    startDate: '2026-06-15', endDate: '2026-06-19', transport: '✈ Avion',
    totalAmount: 1_240, submittedAt: '2026-05-10', status: 'pending',
    justification: 'Communication orale acceptée sur les travaux de recherche FedMed.',
    expenses: [
      { label: 'Billet avion A/R',     amount: 480 },
      { label: 'Hôtel (4 nuits)',       amount: 580 },
      { label: 'Inscription conférence',amount: 120 },
      { label: 'Transports locaux',     amount: 60  },
    ],
  },
  {
    id: 'M002', teacher: 'Dr. Sophie Roux', department: 'Mathématiques',
    destination: 'Lyon, France', purpose: 'Séminaire SMF — échanges pédagogiques',
    startDate: '2026-06-05', endDate: '2026-06-06', transport: '🚄 Train',
    totalAmount: 380, submittedAt: '2026-05-14', status: 'pending',
    justification: 'Invitation officielle de la Société Mathématique de France.',
    expenses: [
      { label: 'Billet TGV A/R',        amount: 180 },
      { label: 'Hôtel (1 nuit)',         amount: 120 },
      { label: 'Repas (forfait journée)',amount: 80  },
    ],
  },
  {
    id: 'M003', teacher: 'Dr. Amina Chaoui', department: 'Sciences des Données',
    destination: 'Paris, France', purpose: 'Réunion consortium projet ANR DataHealth',
    startDate: '2026-05-28', endDate: '2026-05-28', transport: '🚄 Train',
    totalAmount: 140, submittedAt: '2026-05-20', status: 'approved',
    justification: 'Réunion d\'avancement obligatoire du consortium ANR.',
    expenses: [
      { label: 'Billet TGV A/R',        amount: 90  },
      { label: 'Repas',                  amount: 30  },
      { label: 'Taxi aéroport',          amount: 20  },
    ],
  },
  {
    id: 'M004', teacher: 'Dr. Paul Legrand', department: 'Droit',
    destination: 'Bruxelles, Belgique', purpose: 'Conférence droit international européen',
    startDate: '2026-04-10', endDate: '2026-04-12', transport: '✈ Avion',
    totalAmount: 890, submittedAt: '2026-03-28', status: 'reimbursed',
    justification: 'Présentation communication orale sur l\'arbitrage international.',
    expenses: [
      { label: 'Billet avion A/R',     amount: 320 },
      { label: 'Hôtel (2 nuits)',       amount: 360 },
      { label: 'Inscription',           amount: 150 },
      { label: 'Transports',            amount: 60  },
    ],
  },
  {
    id: 'M005', teacher: 'Prof. Elena Visconti', department: 'Informatique',
    destination: 'Milan, Italie', purpose: 'Retour pour congés personnels',
    startDate: '2026-05-30', endDate: '2026-06-02', transport: '✈ Avion',
    totalAmount: 620, submittedAt: '2026-05-22', status: 'refused',
    justification: 'Voyage pour motif personnel non lié à la recherche ou l\'enseignement.',
    expenses: [
      { label: 'Billet avion A/R',     amount: 490 },
      { label: 'Hôtel',                amount: 130 },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusInfo(s: MissionStatus) {
  const map: Record<MissionStatus, { label: string; cls: string }> = {
    pending:    { label: 'En attente',  cls: 'bg-amber-100 text-amber-700' },
    approved:   { label: 'Approuvé',   cls: 'bg-emerald-100 text-emerald-700' },
    refused:    { label: 'Refusé',     cls: 'bg-rose-100 text-rose-700' },
    reimbursed: { label: 'Remboursé',  cls: 'bg-indigo-100 text-indigo-700' },
  }
  return map[s]
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

// ─── Mission Modal ────────────────────────────────────────────────────────────
function MissionModal({ mission, onClose }: { mission: Mission; onClose: () => void }) {
  const [decision, setDecision] = useState<'approved' | 'refused' | undefined>(
    mission.status === 'approved' || mission.status === 'reimbursed' ? 'approved' :
    mission.status === 'refused' ? 'refused' : undefined
  )
  const [note, setNote]         = useState('')
  const [saved, setSaved]       = useState(mission.status !== 'pending')

  const nights = Math.ceil((new Date(mission.endDate).getTime() - new Date(mission.startDate).getTime()) / 86_400_000)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="border-b px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Ordre de mission</h2>
            <p className="text-sm text-muted-foreground">{mission.teacher} · {mission.department}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Mission info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Destination',  value: mission.destination },
              { label: 'Objet',        value: mission.purpose },
              { label: 'Du',           value: new Date(mission.startDate).toLocaleDateString('fr-FR') },
              { label: 'Au',           value: new Date(mission.endDate).toLocaleDateString('fr-FR') },
              { label: 'Durée',        value: `${nights} nuit${nights > 1 ? 's' : ''}` },
              { label: 'Transport',    value: mission.transport },
            ].map(f => (
              <div key={f.label} className="rounded-lg border p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase">{f.label}</p>
                <p className="font-medium text-xs mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Justification */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            📝 <strong>Justification :</strong> {mission.justification}
          </div>

          {/* Expense breakdown */}
          <div className="rounded-xl border overflow-hidden">
            <div className="border-b bg-slate-50 dark:bg-slate-800 px-4 py-2.5 flex justify-between">
              <span className="text-xs font-semibold">Détail des frais</span>
              <span className="text-xs font-bold">{fmt(mission.totalAmount)}</span>
            </div>
            <div className="divide-y">
              {mission.expenses.map((e, i) => (
                <div key={i} className="flex justify-between px-4 py-2.5 text-sm">
                  <span>{e.label}</span>
                  <span className="font-semibold">{fmt(e.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decision */}
          {!saved ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setDecision('approved')}
                  className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-semibold transition-colors ${
                    decision === 'approved' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-emerald-300'
                  }`}
                >
                  ✓ Approuver
                </button>
                <button
                  onClick={() => setDecision('refused')}
                  className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-semibold transition-colors ${
                    decision === 'refused' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600 hover:border-rose-300'
                  }`}
                >
                  ✗ Refuser
                </button>
              </div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={decision === 'refused' ? 'Motif du refus (obligatoire)…' : 'Note administrative (optionnelle)…'}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800"
              />
              <button
                onClick={() => { if (decision) setSaved(true) }}
                disabled={!decision || (decision === 'refused' && !note.trim())}
                className="w-full rounded-lg bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirmer la décision
              </button>
            </div>
          ) : (
            <div className={`rounded-xl border p-4 text-center ${
              decision === 'approved' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <p className={`font-semibold ${decision === 'approved' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {decision === 'approved' ? '✓ Mission approuvée — notification envoyée à l\'enseignant' : '✗ Mission refusée — motif communiqué à l\'enseignant'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminMissionsValidation() {
  const [selected, setSelected] = useState<Mission | undefined>(undefined)
  const [filter, setFilter]     = useState<MissionStatus | 'all'>('pending')

  const visible = filter === 'all' ? MISSIONS : MISSIONS.filter(m => m.status === filter)
  const totalPending = MISSIONS.filter(m => m.status === 'pending').reduce((a, m) => a + m.totalAmount, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Validation des Missions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Approbation des ordres de mission et notes de frais enseignants</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'En attente',       value: MISSIONS.filter(m => m.status === 'pending').length, color: 'text-amber-600' },
          { label: 'Budget en attente',value: fmt(totalPending), color: 'text-rose-600' },
          { label: 'Approuvées',       value: MISSIONS.filter(m => m.status === 'approved' || m.status === 'reimbursed').length, color: 'text-emerald-600' },
          { label: 'Refusées',         value: MISSIONS.filter(m => m.status === 'refused').length, color: 'text-slate-500' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {([['all','Toutes'],['pending','En attente'],['approved','Approuvées'],['refused','Refusées'],['reimbursed','Remboursées']] as const).map(([k,l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              filter === k ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="divide-y">
          {visible.map(m => {
            const si = statusInfo(m.status)
            return (
              <div
                key={m.id}
                onClick={() => setSelected(m)}
                className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 cursor-pointer"
              >
                <span className="text-2xl mt-0.5 shrink-0">{m.transport.split(' ')[0]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{m.teacher}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${si.cls}`}>{si.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.destination} · {new Date(m.startDate).toLocaleDateString('fr-FR')} → {new Date(m.endDate).toLocaleDateString('fr-FR')}</p>
                  <p className="text-xs mt-0.5 italic text-slate-500">{m.purpose}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">{fmt(m.totalAmount)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Soumis le {new Date(m.submittedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className="text-muted-foreground shrink-0">→</span>
              </div>
            )
          })}
          {visible.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Aucune mission dans cette catégorie</p>
          )}
        </div>
      </div>

      {selected && <MissionModal mission={selected} onClose={() => setSelected(undefined)} />}
    </div>
  )
}

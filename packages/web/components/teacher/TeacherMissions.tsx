'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── Types ────────────────────────────────────────────────────────────────────
type MissionStatus  = 'draft' | 'submitted' | 'approved' | 'refused' | 'reimbursed'
type MissionType    = 'conference' | 'seminar' | 'collaboration' | 'teaching' | 'expertise'
type TransportMode  = 'plane' | 'train' | 'car' | 'other'

interface MissionExpense {
  label:  string
  amount: number
}

interface Mission {
  id:           string
  type:         MissionType
  title:        string
  destination:  string
  country:      string
  departDate:   Date
  returnDate:   Date
  status:       MissionStatus
  transport:    TransportMode
  expenses:     MissionExpense[]
  projectCode:  string | undefined
  justification:string
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const MISSIONS: Mission[] = [
  {
    id: 'm1',
    type: 'conference',
    title: 'NeurIPS 2025 — Présentation poster',
    destination: 'Vancouver',
    country: 'Canada',
    departDate: new Date('2025-12-08'),
    returnDate: new Date('2025-12-16'),
    status: 'reimbursed',
    transport: 'plane',
    expenses: [
      { label: 'Vol aller-retour CDG ↔ YVR', amount: 1240 },
      { label: 'Hébergement (7 nuits × 185 CAD)', amount: 960 },
      { label: 'Inscription NeurIPS',              amount: 550 },
      { label: 'Per diem (8 jours)',               amount: 400 },
    ],
    projectCode: 'FedMed-ANR',
    justification: 'Présentation du poster "Federated Learning under Byzantine Failures" accepté à NeurIPS 2025.',
  },
  {
    id: 'm2',
    type: 'conference',
    title: 'IEEE INFOCOM 2024 — Communication orale',
    destination: 'Vancouver',
    country: 'Canada',
    departDate: new Date('2024-05-20'),
    returnDate: new Date('2024-05-25'),
    status: 'reimbursed',
    transport: 'plane',
    expenses: [
      { label: 'Vol aller-retour',   amount: 1100 },
      { label: 'Hébergement 5 nuits',amount: 820 },
      { label: 'Inscription',        amount: 700 },
      { label: 'Per diem',           amount: 300 },
    ],
    projectCode: 'SecureAI-DGA',
    justification: 'Communication acceptée sur la détection d\'intrusions par GNN.',
  },
  {
    id: 'm3',
    type: 'collaboration',
    title: 'Visite laboratoire INRIA Sophia — Collaboration FedMed',
    destination: 'Sophia Antipolis',
    country: 'France',
    departDate: new Date('2026-06-10'),
    returnDate: new Date('2026-06-12'),
    status: 'approved',
    transport: 'train',
    expenses: [
      { label: 'Train Paris ↔ Nice aller-retour', amount: 280 },
      { label: 'Hébergement (2 nuits)',            amount: 240 },
      { label: 'Per diem',                         amount: 100 },
    ],
    projectCode: 'FedMed-ANR',
    justification: 'Réunion de travail avec l\'équipe STARS-INRIA sur l\'intégration des modèles.',
  },
  {
    id: 'm4',
    type: 'conference',
    title: 'Workshop Sécurité IA — CNRS Paris',
    destination: 'Paris',
    country: 'France',
    departDate: new Date('2026-07-03'),
    returnDate: new Date('2026-07-04'),
    status: 'submitted',
    transport: 'train',
    expenses: [
      { label: 'Train aller-retour',  amount: 95 },
      { label: 'Per diem (2 jours)', amount: 100 },
    ],
    projectCode: 'SecureAI-DGA',
    justification: 'Présentation d\'un exposé invité au workshop IA & Cybersécurité.',
  },
  {
    id: 'm5',
    type: 'seminar',
    title: 'Séminaire LIP6 — Exposé invité',
    destination: 'Paris (Sorbonne)',
    country: 'France',
    departDate: new Date('2026-09-15'),
    returnDate: new Date('2026-09-15'),
    status: 'draft',
    transport: 'train',
    expenses: [
      { label: 'Train aller-retour', amount: 82 },
    ],
    projectCode: undefined,
    justification: 'Exposé invité au séminaire du LIP6 sur le thème apprentissage fédéré.',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusInfo(s: MissionStatus): { label: string; cls: string } {
  const map: Record<MissionStatus, { label: string; cls: string }> = {
    draft:       { label: 'Brouillon',  cls: 'bg-muted text-muted-foreground' },
    submitted:   { label: 'Soumis',     cls: 'bg-blue-100 text-blue-700' },
    approved:    { label: 'Approuvé',   cls: 'bg-emerald-100 text-emerald-700' },
    refused:     { label: 'Refusé',     cls: 'bg-red-100 text-red-700' },
    reimbursed:  { label: 'Remboursé',  cls: 'bg-slate-100 text-slate-500' },
  }
  return map[s]
}

function typeIcon(t: MissionType): string {
  const m: Record<MissionType, string> = {
    conference:    '🎤',
    seminar:       '📢',
    collaboration: '🤝',
    teaching:      '📚',
    expertise:     '🔬',
  }
  return m[t]
}

function transportIcon(t: TransportMode): string {
  const m: Record<TransportMode, string> = {
    plane: '✈️',
    train: '🚄',
    car:   '🚗',
    other: '🚌',
  }
  return m[t]
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

// ─── New Mission Form ─────────────────────────────────────────────────────────
function NewMissionForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    type: 'conference' as MissionType,
    title: '',
    destination: '',
    country: '',
    departDate: '',
    returnDate: '',
    transport: 'plane' as TransportMode,
    justification: '',
    projectCode: '',
  })
  const [expenses, setExpenses] = useState([{ label: '', amount: '' }])
  const [saved, setSaved] = useState(false)

  function addExpenseLine() {
    setExpenses(prev => [...prev, { label: '', amount: '' }])
  }

  function updateExpense(i: number, field: 'label' | 'amount', val: string) {
    setExpenses(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(onDone, 1800)
  }

  if (saved) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
        <p className="text-3xl">✅</p>
        <p className="mt-2 font-semibold text-emerald-700 dark:text-emerald-300">
          Ordre de mission soumis !
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre responsable sera notifié pour validation.
        </p>
      </div>
    )
  }

  const totalAmount = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-semibold">Nouvel ordre de mission</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Type de mission</label>
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value as MissionType }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="conference">Conférence internationale</option>
            <option value="seminar">Séminaire / exposé invité</option>
            <option value="collaboration">Collaboration / visite labo</option>
            <option value="teaching">Enseignement extérieur</option>
            <option value="expertise">Expertise / jury</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Titre de la mission</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="ex. NeurIPS 2026 — Présentation"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Destination</label>
          <input
            type="text"
            required
            value={form.destination}
            onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
            placeholder="Ville"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Pays</label>
          <input
            type="text"
            required
            value={form.country}
            onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
            placeholder="ex. France, Canada…"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Date de départ</label>
          <input
            type="date"
            required
            value={form.departDate}
            onChange={e => setForm(f => ({ ...f, departDate: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Date de retour</label>
          <input
            type="date"
            required
            value={form.returnDate}
            onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Mode de transport</label>
          <select
            value={form.transport}
            onChange={e => setForm(f => ({ ...f, transport: e.target.value as TransportMode }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="plane">✈️ Avion</option>
            <option value="train">🚄 Train</option>
            <option value="car">🚗 Voiture personnelle</option>
            <option value="other">🚌 Autre</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Code projet (optionnel)</label>
          <input
            type="text"
            value={form.projectCode}
            onChange={e => setForm(f => ({ ...f, projectCode: e.target.value }))}
            placeholder="ex. FedMed-ANR"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Justification scientifique</label>
        <textarea
          required
          value={form.justification}
          onChange={e => setForm(f => ({ ...f, justification: e.target.value }))}
          rows={2}
          placeholder="Objectif de la mission, pertinence pour les projets de recherche…"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Expense lines */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-muted-foreground">Lignes de dépenses</label>
          <button
            type="button"
            onClick={addExpenseLine}
            className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
          >
            + Ajouter une ligne
          </button>
        </div>
        <div className="space-y-2">
          {expenses.map((exp, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="Description de la dépense"
                value={exp.label}
                onChange={e => updateExpense(i, 'label', e.target.value)}
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                placeholder="€"
                min="0"
                value={exp.amount}
                onChange={e => updateExpense(i, 'amount', e.target.value)}
                className="w-24 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>
        {totalAmount > 0 && (
          <p className="mt-2 text-right text-sm font-semibold">
            Total estimé : <span className="text-indigo-600">{fmt(totalAmount)}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Soumettre l'ordre de mission
        </button>
      </div>
    </form>
  )
}

// ─── Mission Card ─────────────────────────────────────────────────────────────
function MissionCard({ mission }: { mission: Mission }) {
  const [expanded, setExpanded] = useState(false)
  const { label, cls } = statusInfo(mission.status)
  const total = mission.expenses.reduce((s, e) => s + e.amount, 0)
  const days  = Math.max(1, Math.ceil(
    (mission.returnDate.getTime() - mission.departDate.getTime()) / (1000 * 60 * 60 * 24)
  ))

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-base">{typeIcon(mission.type)}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
            <span className="text-xs text-muted-foreground">
              {transportIcon(mission.transport)}
              {' '}
              {days} jour{days > 1 ? 's' : ''}
            </span>
          </div>
          <p className="font-semibold">{mission.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            📍 {mission.destination}, {mission.country}
          </p>
          <p className="text-sm text-muted-foreground">
            📅 {format(mission.departDate, 'd MMM', { locale: fr })} — {format(mission.returnDate, 'd MMM yyyy', { locale: fr })}
          </p>
          {mission.projectCode && (
            <span className="mt-1 inline-block rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {mission.projectCode}
            </span>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold">{fmt(total)}</p>
          <p className="text-xs text-muted-foreground">total estimé</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(v => !v)}
        className="mt-2 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        {expanded ? '▲ Masquer' : '▼ Détail des dépenses'}
      </button>

      {expanded && (
        <div className="mt-3 rounded-lg border divide-y text-sm overflow-hidden">
          {mission.expenses.map((exp, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2">
              <span className="text-muted-foreground">{exp.label}</span>
              <span className="font-mono font-medium">{fmt(exp.amount)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between bg-muted/50 px-3 py-2 font-semibold">
            <span>Total</span>
            <span className="text-indigo-600">{fmt(total)}</span>
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-2 rounded-lg bg-muted/30 px-3 py-2 text-xs italic text-muted-foreground">
          {mission.justification}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function TeacherMissions() {
  const [showForm,     setShowForm]     = useState(false)
  const [filterStatus, setFilterStatus] = useState<MissionStatus | 'all'>('all')

  const filtered = filterStatus === 'all'
    ? MISSIONS
    : MISSIONS.filter(m => m.status === filterStatus)

  const totalReimbursed = MISSIONS
    .filter(m => m.status === 'reimbursed')
    .reduce((s, m) => s + m.expenses.reduce((es, e) => es + e.amount, 0), 0)
  const pendingAmount = MISSIONS
    .filter(m => m.status === 'submitted' || m.status === 'approved')
    .reduce((s, m) => s + m.expenses.reduce((es, e) => es + e.amount, 0), 0)

  const STATUS_FILTERS: Array<{ value: MissionStatus | 'all'; label: string }> = [
    { value: 'all',        label: 'Toutes' },
    { value: 'draft',      label: 'Brouillons' },
    { value: 'submitted',  label: 'Soumis' },
    { value: 'approved',   label: 'Approuvés' },
    { value: 'reimbursed', label: 'Remboursés' },
    { value: 'refused',    label: 'Refusés' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ordres de mission</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestion des déplacements professionnels et remboursements de frais.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nouveau
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Missions totales',   value: MISSIONS.length, color: 'text-indigo-600' },
          { label: 'En attente',          value: MISSIONS.filter(m => m.status === 'submitted').length, color: 'text-amber-600' },
          { label: 'Total remboursé',     value: fmt(totalReimbursed), color: 'text-emerald-600', isStr: true },
          { label: 'En cours de traitement', value: fmt(pendingAmount), color: 'text-blue-600', isStr: true },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* New mission form */}
      {showForm && (
        <NewMissionForm onDone={() => setShowForm(false)} />
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filterStatus === f.value
                ? 'bg-indigo-600 text-white'
                : 'border hover:bg-muted text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mission cards */}
      <div className="space-y-3">
        {filtered.map(mission => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            Aucune mission dans cette catégorie.
          </div>
        )}
      </div>
    </div>
  )
}

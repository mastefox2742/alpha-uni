'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type CfuStatus = 'validated' | 'in_progress' | 'failed' | 'not_started'

interface CourseEntry {
  code:    string
  name:    string
  cfu:     number
  grade:   number | undefined
  status:  CfuStatus
  session: string
}

interface StudyPlan {
  id:           string
  studentId:    string
  studentName:  string
  program:      string
  year:         number
  totalCfu:     number
  targetCfu:    number
  courses:      CourseEntry[]
  status:       'active' | 'pending_approval' | 'modification_requested' | 'frozen'
  lastModified: string
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const STUDY_PLANS: StudyPlan[] = [
  {
    id: 'sp1', studentId: 'MAT20240001', studentName: 'Camille Lefèvre',
    program: 'Master Informatique', year: 2, totalCfu: 87, targetCfu: 120,
    status: 'active', lastModified: '2026-04-12',
    courses: [
      { code: 'INFO501', name: 'Intelligence Artificielle', cfu: 9, grade: 17, status: 'validated', session: 'Janv. 2026' },
      { code: 'INFO502', name: 'Systèmes Distribués',       cfu: 6, grade: 14, status: 'validated', session: 'Janv. 2026' },
      { code: 'INFO503', name: 'Cryptographie Avancée',     cfu: 6, grade: undefined, status: 'in_progress', session: 'Juin 2026' },
      { code: 'INFO504', name: 'Cloud Computing',           cfu: 6, grade: undefined, status: 'in_progress', session: 'Juin 2026' },
      { code: 'MATH501', name: 'Statistiques & ML',         cfu: 6, grade: 16, status: 'validated', session: 'Janv. 2026' },
      { code: 'INFO505', name: 'Architecture Logicielle',   cfu: 6, grade: undefined, status: 'not_started', session: 'Sept. 2026' },
    ],
  },
  {
    id: 'sp2', studentId: 'MAT20240046', studentName: 'Théo Richard',
    program: 'Licence Mathématiques', year: 3, totalCfu: 152, targetCfu: 180,
    status: 'pending_approval', lastModified: '2026-05-18',
    courses: [
      { code: 'MATH301', name: 'Analyse Complexe',          cfu: 9, grade: 11, status: 'validated', session: 'Janv. 2026' },
      { code: 'MATH302', name: 'Algèbre Linéaire II',       cfu: 9, grade: 8,  status: 'failed',    session: 'Janv. 2026' },
      { code: 'MATH303', name: 'Topologie',                 cfu: 6, grade: undefined, status: 'in_progress', session: 'Juin 2026' },
      { code: 'MATH304', name: 'Probabilités Avancées',     cfu: 6, grade: undefined, status: 'in_progress', session: 'Juin 2026' },
      { code: 'PHYS301', name: 'Physique Mathématique',     cfu: 6, grade: 12, status: 'validated', session: 'Janv. 2026' },
    ],
  },
  {
    id: 'sp3', studentId: 'MAT20250087', studentName: 'Sarah Ben Amar',
    program: 'Master Sciences des Données', year: 1, totalCfu: 42, targetCfu: 60,
    status: 'modification_requested', lastModified: '2026-05-20',
    courses: [
      { code: 'DATA101', name: 'Fondements du Big Data',    cfu: 9, grade: 18, status: 'validated', session: 'Janv. 2026' },
      { code: 'DATA102', name: 'Python pour la Data',       cfu: 6, grade: 17, status: 'validated', session: 'Janv. 2026' },
      { code: 'DATA103', name: 'Visualisation',             cfu: 6, grade: undefined, status: 'in_progress', session: 'Juin 2026' },
      { code: 'DATA104', name: 'Machine Learning Approfon', cfu: 9, grade: undefined, status: 'in_progress', session: 'Juin 2026' },
      { code: 'DATA105', name: 'Bases de Données Avancées', cfu: 6, grade: undefined, status: 'not_started', session: 'Sept. 2026' },
    ],
  },
  {
    id: 'sp4', studentId: 'MAT20230155', studentName: 'Lucas Moreau',
    program: 'Master Droit International', year: 2, totalCfu: 115, targetCfu: 120,
    status: 'frozen', lastModified: '2026-03-01',
    courses: [
      { code: 'DROIT401', name: 'Droit Commercial Int.',    cfu: 9, grade: 15, status: 'validated', session: 'Janv. 2026' },
      { code: 'DROIT402', name: 'Droit des Traités',        cfu: 6, grade: 13, status: 'validated', session: 'Janv. 2026' },
      { code: 'DROIT403', name: 'Arbitrage International',  cfu: 6, grade: undefined, status: 'in_progress', session: 'Juin 2026' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusInfo(s: StudyPlan['status']) {
  const map: Record<StudyPlan['status'], { label: string; cls: string }> = {
    active:                { label: 'Actif',              cls: 'bg-emerald-100 text-emerald-700' },
    pending_approval:      { label: 'En attente d\'approbation', cls: 'bg-amber-100 text-amber-700' },
    modification_requested:{ label: 'Modif. demandée',   cls: 'bg-blue-100 text-blue-700' },
    frozen:                { label: 'Gelé',               cls: 'bg-slate-100 text-slate-600' },
  }
  return map[s]
}

function cfuStatusIcon(s: CfuStatus) {
  if (s === 'validated')   return <span className="text-emerald-600 font-bold">✓</span>
  if (s === 'in_progress') return <span className="text-blue-500">⟳</span>
  if (s === 'failed')      return <span className="text-rose-600 font-bold">✗</span>
  return <span className="text-slate-400">○</span>
}

function gradeColor(g: number) {
  if (g >= 16) return 'text-emerald-700 font-semibold'
  if (g >= 12) return 'text-slate-700'
  if (g >= 10) return 'text-amber-700'
  return 'text-rose-600 font-semibold'
}

// ─── Plan Detail Modal ────────────────────────────────────────────────────────
function PlanModal({ plan, onClose }: { plan: StudyPlan; onClose: () => void }) {
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const pct = Math.round((plan.totalCfu / plan.targetCfu) * 100)

  function handleApprove() { setSaved(true) }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{plan.studentName}</h2>
            <p className="text-sm text-muted-foreground">{plan.studentId} · {plan.program} · Année {plan.year}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* CFU Progress */}
          <div className="rounded-xl border p-4 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Avancement CFU</span>
              <span className="text-sm font-bold">{plan.totalCfu} / {plan.targetCfu} CFU ({pct}%)</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>

          {/* Course table */}
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Code</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Matière</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">CFU</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Note</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Statut</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Session</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {plan.courses.map(c => (
                  <tr key={c.code} className="hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{c.code}</td>
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2 text-center font-semibold">{c.cfu}</td>
                    <td className={`px-3 py-2 text-center ${c.grade !== undefined ? gradeColor(c.grade) : 'text-muted-foreground'}`}>
                      {c.grade !== undefined ? `${c.grade}/20` : '—'}
                    </td>
                    <td className="px-3 py-2 text-center">{cfuStatusIcon(c.status)}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{c.session}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Admin note + actions */}
          {!saved ? (
            <div className="space-y-3">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Note administrative (optionnelle)…"
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  ✓ Approuver le libretto
                </button>
                <button className="flex-1 rounded-lg border border-amber-400 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50">
                  ✎ Demander modification
                </button>
                <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  🔒 Geler
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <p className="text-emerald-700 font-semibold">✓ Libretto approuvé — notification envoyée à l'étudiant</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminStudies() {
  const [selected, setSelected] = useState<StudyPlan | undefined>(undefined)
  const [filter, setFilter]     = useState<StudyPlan['status'] | 'all'>('all')
  const [search, setSearch]     = useState('')

  const visible = STUDY_PLANS.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return p.studentName.toLowerCase().includes(q) || p.studentId.toLowerCase().includes(q) || p.program.toLowerCase().includes(q)
    }
    return true
  })

  const counts = {
    all:                   STUDY_PLANS.length,
    active:                STUDY_PLANS.filter(p => p.status === 'active').length,
    pending_approval:      STUDY_PLANS.filter(p => p.status === 'pending_approval').length,
    modification_requested:STUDY_PLANS.filter(p => p.status === 'modification_requested').length,
    frozen:                STUDY_PLANS.filter(p => p.status === 'frozen').length,
  }

  const tabs: { key: StudyPlan['status'] | 'all'; label: string }[] = [
    { key: 'all',                   label: `Tous (${counts.all})` },
    { key: 'pending_approval',      label: `En attente (${counts.pending_approval})` },
    { key: 'modification_requested',label: `Modif. demandée (${counts.modification_requested})` },
    { key: 'active',                label: `Actifs (${counts.active})` },
    { key: 'frozen',                label: `Gelés (${counts.frozen})` },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plans d'études & Libretti</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Validation et gestion des parcours pédagogiques</p>
        </div>
        <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
          + Nouveau plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Plans actifs',        value: counts.active,                color: 'text-emerald-600' },
          { label: 'En attente approbation', value: counts.pending_approval,   color: 'text-amber-600' },
          { label: 'Modif. demandées',    value: counts.modification_requested,color: 'text-blue-600' },
          { label: 'Plans gelés',         value: counts.frozen,                color: 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              filter === t.key
                ? 'bg-rose-600 text-white border-rose-600'
                : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher étudiant, matricule, programme…"
        className="w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800"
      />

      {/* Plans list */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="divide-y">
          {visible.map(plan => {
            const pct = Math.round((plan.totalCfu / plan.targetCfu) * 100)
            const si  = statusInfo(plan.status)
            const failedCount = plan.courses.filter(c => c.status === 'failed').length
            return (
              <div
                key={plan.id}
                onClick={() => setSelected(plan)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                  {plan.studentName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{plan.studentName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${si.cls}`}>{si.label}</span>
                    {failedCount > 0 && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                        {failedCount} échec{failedCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.studentId} · {plan.program} · An {plan.year}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden max-w-32">
                      <div
                        className={`h-full rounded-full ${pct >= 90 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{plan.totalCfu}/{plan.targetCfu} CFU ({pct}%)</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Modifié le</p>
                  <p className="text-xs font-medium">{new Date(plan.lastModified).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className="text-muted-foreground">→</span>
              </div>
            )
          })}
          {visible.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Aucun plan d'études trouvé</p>
          )}
        </div>
      </div>

      {selected && <PlanModal plan={selected} onClose={() => setSelected(undefined)} />}
    </div>
  )
}

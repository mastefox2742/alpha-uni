'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── Types ────────────────────────────────────────────────────────────────────
type ProjectStatus  = 'active' | 'completed' | 'pending' | 'suspended'
type ExpenseCategory = 'personnel' | 'equipment' | 'travel' | 'overhead' | 'subcontracting' | 'other'

interface BudgetLine {
  id:       string
  category: ExpenseCategory
  label:    string
  budgeted: number
  spent:    number
  date:     Date
}

interface ResearchProject {
  id:         string
  name:       string
  acronym:    string
  funder:     string
  status:     ProjectStatus
  startDate:  Date
  endDate:    Date
  totalBudget:number
  lines:      BudgetLine[]
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const PROJECTS: ResearchProject[] = [
  {
    id: 'rp1',
    name: 'Apprentissage fédéré pour données médicales distribuées',
    acronym: 'FedMed',
    funder: 'ANR — Programme Intelligence Artificielle',
    status: 'active',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2027-12-31'),
    totalBudget: 380000,
    lines: [
      { id: 'l1', category: 'personnel',       label: 'Salaire doctorant (Elisa Fontaine)',  budgeted: 180000, spent: 65000, date: new Date('2024-01-15') },
      { id: 'l2', category: 'personnel',       label: 'Ingénieur de recherche (6 mois)',     budgeted: 40000,  spent: 40000, date: new Date('2024-03-01') },
      { id: 'l3', category: 'equipment',       label: 'Serveur GPU A100 (×4)',               budgeted: 80000,  spent: 78500, date: new Date('2024-02-10') },
      { id: 'l4', category: 'travel',          label: 'Conférences internationales',         budgeted: 20000,  spent: 8200,  date: new Date('2024-06-01') },
      { id: 'l5', category: 'overhead',        label: 'Frais de gestion ANR (20%)',          budgeted: 60000,  spent: 22000, date: new Date('2024-01-01') },
    ],
  },
  {
    id: 'rp2',
    name: 'Sécurité des infrastructures critiques par IA',
    acronym: 'SecureAI',
    funder: 'DGA — Pôle Cybersécurité',
    status: 'active',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2028-03-31'),
    totalBudget: 220000,
    lines: [
      { id: 'm1', category: 'personnel',       label: 'Post-doc (Omar Khalil)',               budgeted: 100000, spent: 28000, date: new Date('2025-04-01') },
      { id: 'm2', category: 'equipment',       label: 'Équipement réseau (testbed)',          budgeted: 45000,  spent: 44200, date: new Date('2025-05-15') },
      { id: 'm3', category: 'subcontracting',  label: 'Expertise industrielle (Thales)',      budgeted: 30000,  spent: 0,     date: new Date('2025-09-01') },
      { id: 'm4', category: 'travel',          label: 'Déplacements et colloques',            budgeted: 15000,  spent: 3800,  date: new Date('2025-06-01') },
      { id: 'm5', category: 'overhead',        label: 'Frais généraux (20%)',                 budgeted: 30000,  spent: 8500,  date: new Date('2025-04-01') },
    ],
  },
  {
    id: 'rp3',
    name: 'Détection d\'anomalies temps réel en environnement IoT',
    acronym: 'IoTGuard',
    funder: 'Région Ile-de-France',
    status: 'completed',
    startDate: new Date('2022-01-01'),
    endDate: new Date('2025-12-31'),
    totalBudget: 150000,
    lines: [
      { id: 'g1', category: 'personnel',       label: 'Master 2 (×3 stagiaires)',             budgeted: 18000,  spent: 17500, date: new Date('2022-03-01') },
      { id: 'g2', category: 'equipment',       label: 'Capteurs IoT et infrastructure',       budgeted: 35000,  spent: 34800, date: new Date('2022-02-15') },
      { id: 'g3', category: 'travel',          label: 'Conférences',                         budgeted: 12000,  spent: 11200, date: new Date('2023-01-01') },
      { id: 'g4', category: 'overhead',        label: 'Frais généraux (15%)',                 budgeted: 22500,  spent: 22500, date: new Date('2022-01-01') },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusInfo(s: ProjectStatus): { label: string; cls: string } {
  const map: Record<ProjectStatus, { label: string; cls: string }> = {
    active:    { label: 'Actif',      cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
    completed: { label: 'Terminé',    cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
    pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
    suspended: { label: 'Suspendu',   cls: 'bg-red-100 text-red-700' },
  }
  return map[s]
}

function categoryIcon(c: ExpenseCategory): string {
  const m: Record<ExpenseCategory, string> = {
    personnel:      '👤',
    equipment:      '🖥️',
    travel:         '✈️',
    overhead:       '🏢',
    subcontracting: '🤝',
    other:          '📦',
  }
  return m[c]
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

// ─── Budget Project Card ──────────────────────────────────────────────────────
function ProjectCard({ project }: { project: ResearchProject }) {
  const [open, setOpen] = useState(false)
  const { label, cls } = statusInfo(project.status)

  const totalSpent    = project.lines.reduce((s, l) => s + l.spent, 0)
  const totalBudgeted = project.lines.reduce((s, l) => s + l.budgeted, 0)
  const pct           = Math.min(100, Math.round((totalSpent / totalBudgeted) * 100))
  const remaining     = project.totalBudget - totalSpent

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {project.acronym}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
            </div>
            <p className="font-semibold leading-snug">{project.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{project.funder}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {format(project.startDate, 'd MMM yyyy', { locale: fr })} → {format(project.endDate, 'd MMM yyyy', { locale: fr })}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold">{fmt(project.totalBudget)}</p>
            <p className="text-xs text-muted-foreground">budget total</p>
            <p className={`mt-0.5 text-sm font-semibold ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {fmt(remaining)} restant
            </p>
          </div>
        </div>

        {/* Spending bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{fmt(totalSpent)} dépensé</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setOpen(v => !v)}
          className="mt-3 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {open ? '▲ Masquer le détail' : '▼ Voir le détail des lignes'}
        </button>
      </div>

      {/* Budget lines */}
      {open && (
        <div className="border-t">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 text-left">Ligne budgétaire</th>
                <th className="px-4 py-2.5 text-right">Prévu</th>
                <th className="px-4 py-2.5 text-right">Dépensé</th>
                <th className="px-4 py-2.5 text-right">Restant</th>
                <th className="px-4 py-2.5 text-left w-28">Avancement</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {project.lines.map(line => {
                const linePct  = line.budgeted > 0 ? Math.min(100, Math.round((line.spent / line.budgeted) * 100)) : 0
                const lineLeft = line.budgeted - line.spent
                return (
                  <tr key={line.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <span className="mr-1.5">{categoryIcon(line.category)}</span>
                      {line.label}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs">{fmt(line.budgeted)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{fmt(line.spent)}</td>
                    <td className={`px-4 py-2.5 text-right font-mono text-xs font-semibold ${lineLeft < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {fmt(lineLeft)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${linePct > 90 ? 'bg-red-500' : linePct > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                            style={{ width: `${linePct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-7 text-right">{linePct}%</span>
                      </div>
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

// ─── Main Component ───────────────────────────────────────────────────────────
export function TeacherBudget() {
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')

  const filtered = filter === 'all'
    ? PROJECTS
    : PROJECTS.filter(p => p.status === filter)

  const totalBudget = PROJECTS.filter(p => p.status === 'active')
    .reduce((s, p) => s + p.totalBudget, 0)
  const totalSpent = PROJECTS.filter(p => p.status === 'active')
    .reduce((s, p) => s + p.lines.reduce((ls, l) => ls + l.spent, 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Budgets & Projets de recherche</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suivi financier de vos projets ANR, DGA, régionaux et européens.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Projets actifs',    value: PROJECTS.filter(p => p.status === 'active').length,    color: 'text-emerald-600' },
          { label: 'Budget actif',      value: fmt(totalBudget),    color: 'text-indigo-600',  isStr: true },
          { label: 'Dépenses à ce jour',value: fmt(totalSpent),     color: 'text-amber-600',   isStr: true },
          { label: 'Projets terminés',  value: PROJECTS.filter(p => p.status === 'completed').length, color: 'text-slate-500' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', 'active', 'pending', 'completed', 'suspended'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'border hover:bg-muted text-muted-foreground'
            }`}
          >
            {f === 'all' ? 'Tous' : statusInfo(f).label}
          </button>
        ))}
      </div>

      {/* Project cards */}
      <div className="space-y-4">
        {filtered.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            Aucun projet dans cette catégorie.
          </div>
        )}
      </div>
    </div>
  )
}

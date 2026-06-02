'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportSection = 'students' | 'results' | 'finance' | 'teachers'

// ─── Demo Data ────────────────────────────────────────────────────────────────
const PASS_RATES = [
  { program: 'Master Informatique M1',       s1: 82, s2: 78, delta: -4 },
  { program: 'Master Informatique M2',       s1: 88, s2: 85, delta: -3 },
  { program: 'Master Sciences des Données M1', s1: 79, s2: 77, delta: -2 },
  { program: 'Licence Mathématiques L3',     s1: 71, s2: 68, delta: -3 },
  { program: 'Master Droit International M2', s1: 90, s2: 89, delta: -1 },
]

const ENROLLMENT_TREND = [
  { year: '2022-23', count: 1_084 },
  { year: '2023-24', count: 1_158 },
  { year: '2024-25', count: 1_209 },
  { year: '2025-26', count: 1_247 },
]

const DROPOUT_REASONS = [
  { reason: 'Réorientation',      pct: 34 },
  { reason: 'Difficultés financières', pct: 22 },
  { reason: 'Échec académique',   pct: 19 },
  { reason: 'Raisons personnelles', pct: 15 },
  { reason: 'Transfert vers autre université', pct: 10 },
]

const NATIONALITY_BREAKDOWN = [
  { label: 'Française',         count: 856, pct: 69 },
  { label: 'Européenne (UE)',   count: 248, pct: 20 },
  { label: 'Internationale',    count: 143, pct: 11 },
]

const FINANCIAL_SUMMARY = [
  { label: 'Droits d\'inscription 2025-26', value: '1 872 500 €', color: 'text-emerald-600' },
  { label: 'Bourses & réductions',          value: '−148 200 €',  color: 'text-rose-600' },
  { label: 'Impayés en cours',              value: '23 400 €',    color: 'text-amber-600' },
  { label: 'Net encaissé',                  value: '1 700 900 €', color: 'text-indigo-600' },
  { label: 'Budget missions (2025-26)',      value: '84 600 €',    color: 'text-slate-600' },
  { label: 'Masse salariale enseignants',   value: '3 240 000 €', color: 'text-slate-600' },
]

const TEACHER_STATS = [
  { label: 'Enseignants permanents',    value: 38 },
  { label: 'Contractuels',              value: 6  },
  { label: 'Vacataires',                value: 4  },
  { label: 'Professeurs invités',       value: 2  },
  { label: 'H. supp. cumulées (S2)',    value: '186h' },
  { label: 'Missions approuvées',       value: 12 },
]

// ─── Bar spark ────────────────────────────────────────────────────────────────
function Sparkbar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right">{value}%</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminReports() {
  const [section, setSection] = useState<ReportSection>('students')
  const [exporting, setExporting] = useState(false)
  const [exported, setExported]   = useState(false)

  function handleExport() {
    setExporting(true)
    setTimeout(() => { setExporting(false); setExported(true); setTimeout(() => setExported(false), 3000) }, 1500)
  }

  const tabs: { key: ReportSection; label: string; icon: string }[] = [
    { key: 'students',  label: 'Effectifs étudiants', icon: '👥' },
    { key: 'results',   label: 'Résultats académiques', icon: '📊' },
    { key: 'finance',   label: 'Données financières',  icon: '💰' },
    { key: 'teachers',  label: 'Données enseignants',  icon: '🎓' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reporting Ministère</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tableaux de bord statistiques — Année universitaire 2025-2026</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
          >
            {exporting ? '⏳ Export…' : exported ? '✓ Exporté' : '📥 Exporter XLSX'}
          </button>
          <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
            📄 Rapport PDF Ministère
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Étudiants inscrits',  value: '1 247',   color: 'text-indigo-600' },
          { label: 'Taux de réussite moy.', value: '79%',   color: 'text-emerald-600' },
          { label: 'Taux d\'abandon',     value: '6.2%',    color: 'text-rose-600' },
          { label: 'Taux d\'encadr.',     value: '1 / 26',  color: 'text-amber-600' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setSection(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              section === t.key ? 'border-rose-600 text-rose-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Sections */}
      {section === 'students' && (
        <div className="space-y-4">
          {/* Enrollment trend */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-4">Évolution des effectifs</h3>
            <div className="flex items-end gap-4 h-32">
              {ENROLLMENT_TREND.map(t => {
                const pct = ((t.count - 1000) / 400) * 100
                return (
                  <div key={t.year} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-indigo-600">{t.count.toLocaleString('fr-FR')}</span>
                    <div className="w-full rounded-t-lg bg-indigo-500" style={{ height: `${pct}%`, minHeight: '20%' }} />
                    <span className="text-[10px] text-muted-foreground">{t.year}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Nationality */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold mb-3">Nationalités</h3>
              <div className="space-y-3">
                {NATIONALITY_BREAKDOWN.map(n => (
                  <div key={n.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{n.label}</span>
                      <span className="font-semibold">{n.count} ({n.pct}%)</span>
                    </div>
                    <Sparkbar value={n.pct} max={100} color="bg-indigo-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Dropout reasons */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold mb-3">Causes d'abandon</h3>
              <div className="space-y-3">
                {DROPOUT_REASONS.map(d => (
                  <div key={d.reason}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{d.reason}</span>
                      <span className="font-semibold">{d.pct}%</span>
                    </div>
                    <Sparkbar value={d.pct} max={40} color="bg-rose-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {section === 'results' && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="border-b px-5 py-3 bg-slate-50 dark:bg-slate-800">
              <h3 className="font-semibold text-sm">Taux de réussite par programme (S1 vs S2)</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-5 py-2 text-left text-xs font-semibold text-muted-foreground">Programme</th>
                  <th className="px-5 py-2 text-center text-xs font-semibold text-muted-foreground">S1</th>
                  <th className="px-5 py-2 text-center text-xs font-semibold text-muted-foreground">S2</th>
                  <th className="px-5 py-2 text-center text-xs font-semibold text-muted-foreground">Évolution</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {PASS_RATES.map(r => (
                  <tr key={r.program} className="hover:bg-muted/30">
                    <td className="px-5 py-3">{r.program}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold">{r.s1}%</span>
                        <Sparkbar value={r.s1} max={100} color="bg-blue-400" />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold">{r.s2}%</span>
                        <Sparkbar value={r.s2} max={100} color="bg-indigo-500" />
                      </div>
                    </td>
                    <td className={`px-5 py-3 text-center font-bold ${r.delta < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {r.delta > 0 ? '+' : ''}{r.delta}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            📊 <strong>Tendance :</strong> Légère baisse des taux de réussite du S1 au S2 — cohérente avec la difficulté croissante des modules. Aucun programme en dessous du seuil ministériel de 65%.
          </div>
        </div>
      )}

      {section === 'finance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FINANCIAL_SUMMARY.map(f => (
              <div key={f.label} className="rounded-xl border bg-card p-4 shadow-sm">
                <p className={`text-xl font-bold ${f.color}`}>{f.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-3 text-sm">Répartition des droits d'inscription par programme</h3>
            <div className="space-y-3">
              {[
                { label: 'Master',   pct: 58, amount: '1 085 650 €' },
                { label: 'Licence',  pct: 32, amount: '599 200 €' },
                { label: 'Doctorat', pct: 10, amount: '187 650 €' },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{r.label}</span>
                    <span className="text-muted-foreground">{r.amount} ({r.pct}%)</span>
                  </div>
                  <Sparkbar value={r.pct} max={100} color="bg-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === 'teachers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TEACHER_STATS.map(s => (
              <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-2xl font-bold text-rose-600">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-3 text-sm">Répartition par département</h3>
            <div className="space-y-3">
              {[
                { label: 'Informatique',       count: 18, pct: 37 },
                { label: 'Mathématiques',      count: 12, pct: 25 },
                { label: 'Sciences des Données', count: 10, pct: 21 },
                { label: 'Droit',              count: 8,  pct: 17 },
              ].map(d => (
                <div key={d.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{d.label}</span>
                    <span className="font-semibold">{d.count} enseignants ({d.pct}%)</span>
                  </div>
                  <Sparkbar value={d.pct} max={50} color="bg-violet-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

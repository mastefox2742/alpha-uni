'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type ContractType = 'permanent' | 'contract' | 'part_time' | 'visiting'
type TeacherStatus = 'active' | 'on_leave' | 'suspended'

interface TeachingLoad {
  courseCode: string
  courseName: string
  hours:      number
  type:       'CM' | 'TD' | 'TP'
  group:      string
}

interface Teacher {
  id:           string
  fullName:     string
  email:        string
  department:   string
  grade:        string
  contract:     ContractType
  status:       TeacherStatus
  hoursTarget:  number
  hoursDone:    number
  hoursSupp:    number
  load:         TeachingLoad[]
  joinDate:     string
  phone:        string
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const TEACHERS: Teacher[] = [
  {
    id: 'T01', fullName: 'Prof. Jean Martin', email: 'j.martin@univ.fr',
    department: 'Informatique', grade: 'Professeur des Universités',
    contract: 'permanent', status: 'active',
    hoursTarget: 192, hoursDone: 168, hoursSupp: 12,
    joinDate: '2010-09-01', phone: '+33 6 12 34 56 78',
    load: [
      { courseCode: 'INFO501', courseName: 'Intelligence Artificielle', hours: 36, type: 'CM', group: 'M1-INFO' },
      { courseCode: 'INFO501', courseName: 'Intelligence Artificielle', hours: 24, type: 'TD', group: 'M1-INFO-A' },
      { courseCode: 'INFO301', courseName: 'Algorithmes Avancés',       hours: 40, type: 'CM', group: 'L3-INFO' },
      { courseCode: 'INFO301', courseName: 'Algorithmes Avancés',       hours: 20, type: 'TP', group: 'L3-INFO-B' },
    ],
  },
  {
    id: 'T02', fullName: 'Dr. Sophie Roux', email: 's.roux@univ.fr',
    department: 'Mathématiques', grade: 'Maître de Conférences',
    contract: 'permanent', status: 'active',
    hoursTarget: 192, hoursDone: 192, hoursSupp: 24,
    joinDate: '2015-09-01', phone: '+33 6 98 76 54 32',
    load: [
      { courseCode: 'MATH501', courseName: 'Statistiques & ML',      hours: 30, type: 'CM', group: 'M1-DATA' },
      { courseCode: 'MATH301', courseName: 'Analyse Complexe',        hours: 42, type: 'CM', group: 'L3-MATH' },
      { courseCode: 'MATH302', courseName: 'Algèbre Linéaire II',     hours: 30, type: 'TD', group: 'L3-MATH-A' },
      { courseCode: 'MATH302', courseName: 'Algèbre Linéaire II',     hours: 30, type: 'TD', group: 'L3-MATH-B' },
    ],
  },
  {
    id: 'T03', fullName: 'Prof. Marc Dubois', email: 'm.dubois@univ.fr',
    department: 'Informatique', grade: 'Professeur des Universités',
    contract: 'permanent', status: 'on_leave',
    hoursTarget: 192, hoursDone: 48, hoursSupp: 0,
    joinDate: '2008-09-01', phone: '+33 6 11 22 33 44',
    load: [
      { courseCode: 'INFO502', courseName: 'Systèmes Distribués', hours: 48, type: 'CM', group: 'M1-INFO' },
    ],
  },
  {
    id: 'T04', fullName: 'Dr. Amina Chaoui', email: 'a.chaoui@univ.fr',
    department: 'Sciences des Données', grade: 'Maître de Conférences',
    contract: 'permanent', status: 'active',
    hoursTarget: 192, hoursDone: 145, hoursSupp: 0,
    joinDate: '2019-09-01', phone: '+33 6 55 44 33 22',
    load: [
      { courseCode: 'DATA101', courseName: 'Fondements du Big Data', hours: 36, type: 'CM', group: 'M1-DATA' },
      { courseCode: 'DATA103', courseName: 'Visualisation',          hours: 24, type: 'TP', group: 'M1-DATA-A' },
      { courseCode: 'DATA104', courseName: 'Machine Learning',       hours: 42, type: 'TD', group: 'M1-DATA' },
    ],
  },
  {
    id: 'T05', fullName: 'Dr. Paul Legrand', email: 'p.legrand@univ.fr',
    department: 'Droit', grade: 'Maître de Conférences',
    contract: 'contract', status: 'active',
    hoursTarget: 96, hoursDone: 80, hoursSupp: 0,
    joinDate: '2022-09-01', phone: '+33 6 77 88 99 00',
    load: [
      { courseCode: 'DROIT401', courseName: 'Droit Commercial Int.', hours: 48, type: 'CM', group: 'M2-DROIT' },
      { courseCode: 'DROIT402', courseName: 'Droit des Traités',     hours: 32, type: 'TD', group: 'M2-DROIT' },
    ],
  },
  {
    id: 'T06', fullName: 'Prof. Elena Visconti', email: 'e.visconti@univ.fr',
    department: 'Informatique', grade: 'Professeure Invitée',
    contract: 'visiting', status: 'active',
    hoursTarget: 60, hoursDone: 60, hoursSupp: 8,
    joinDate: '2026-01-01', phone: '+39 335 123 4567',
    load: [
      { courseCode: 'INFO503', courseName: 'Cryptographie Avancée', hours: 36, type: 'CM', group: 'M1-INFO' },
      { courseCode: 'INFO504', courseName: 'Cloud Computing',       hours: 24, type: 'CM', group: 'M1-INFO' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function contractInfo(c: ContractType) {
  const map: Record<ContractType, { label: string; cls: string }> = {
    permanent:  { label: 'Titulaire',  cls: 'bg-emerald-100 text-emerald-700' },
    contract:   { label: 'Contractuel',cls: 'bg-blue-100 text-blue-700' },
    part_time:  { label: 'Vacataire',  cls: 'bg-violet-100 text-violet-700' },
    visiting:   { label: 'Invité',     cls: 'bg-amber-100 text-amber-700' },
  }
  return map[c]
}

function statusInfo(s: TeacherStatus) {
  const map: Record<TeacherStatus, { label: string; cls: string }> = {
    active:    { label: 'Actif',      cls: 'bg-emerald-100 text-emerald-700' },
    on_leave:  { label: 'En congé',   cls: 'bg-amber-100 text-amber-700' },
    suspended: { label: 'Suspendu',   cls: 'bg-rose-100 text-rose-700' },
  }
  return map[s]
}

function loadPct(done: number, target: number) { return Math.min(Math.round((done / target) * 100), 110) }
function loadColor(pct: number) {
  if (pct > 105) return 'bg-rose-500'
  if (pct >= 90) return 'bg-emerald-500'
  if (pct >= 70) return 'bg-blue-500'
  return 'bg-amber-400'
}

// ─── Teacher Modal ────────────────────────────────────────────────────────────
function TeacherModal({ teacher, onClose }: { teacher: Teacher; onClose: () => void }) {
  const [tab, setTab] = useState<'load' | 'contract' | 'payslip'>('load')
  const pct = loadPct(teacher.hoursDone, teacher.hoursTarget)
  const totalHours = teacher.load.reduce((a, l) => a + l.hours, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-lg">
              {teacher.fullName.split(' ').filter(Boolean).map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold">{teacher.fullName}</h2>
              <p className="text-sm text-muted-foreground">{teacher.grade} · {teacher.department}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b px-4 pt-2">
          {([['load','Charge horaire'],['contract','Contrat & Info'],['payslip','Injection salaire']] as const).map(([k,l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === k ? 'border-rose-600 text-rose-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {tab === 'load' && (
            <div className="space-y-5">
              {/* Hour KPIs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{teacher.hoursDone}h</p>
                  <p className="text-xs text-muted-foreground">Effectuées</p>
                </div>
                <div className="rounded-xl border p-3 text-center">
                  <p className="text-2xl font-bold text-slate-600">{teacher.hoursTarget}h</p>
                  <p className="text-xs text-muted-foreground">Cible contractuelle</p>
                </div>
                <div className="rounded-xl border p-3 text-center">
                  <p className={`text-2xl font-bold ${teacher.hoursSupp > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    +{teacher.hoursSupp}h
                  </p>
                  <p className="text-xs text-muted-foreground">Heures supp.</p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span>Avancement</span>
                  <span className="font-semibold">{pct}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div className={`h-full rounded-full ${loadColor(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                {pct > 105 && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold">⚠ Dépassement du quota — {teacher.hoursSupp}h supplémentaires à valider</p>
                )}
              </div>

              {/* Load table */}
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Cours</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Type</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Heures</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Groupe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {teacher.load.map((l, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <p className="font-medium text-xs">{l.courseName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{l.courseCode}</p>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            l.type === 'CM' ? 'bg-indigo-100 text-indigo-700' :
                            l.type === 'TD' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>{l.type}</span>
                        </td>
                        <td className="px-3 py-2 text-center font-semibold">{l.hours}h</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{l.group}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-xs font-semibold">Total assigné</td>
                      <td className="px-3 py-2 text-center font-bold">{totalHours}h</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {tab === 'contract' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Email professionnel', value: teacher.email },
                  { label: 'Téléphone',           value: teacher.phone },
                  { label: 'Département',         value: teacher.department },
                  { label: 'Grade',               value: teacher.grade },
                  { label: 'Type de contrat',     value: contractInfo(teacher.contract).label },
                  { label: 'Date d\'entrée',      value: new Date(teacher.joinDate).toLocaleDateString('fr-FR') },
                ].map(f => (
                  <div key={f.label} className="rounded-lg border p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{f.label}</p>
                    <p className="font-semibold">{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-2">
                <button className="flex-1 rounded-lg border border-amber-400 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50">
                  ✎ Modifier contrat
                </button>
                <button className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  📄 Générer attestation
                </button>
              </div>
            </div>
          )}

          {tab === 'payslip' && (
            <div className="space-y-4">
              <div className="rounded-xl border p-4 bg-amber-50 border-amber-200">
                <p className="text-sm font-semibold text-amber-800">💡 Injection fiche de paie</p>
                <p className="text-xs text-amber-700 mt-1">Générez et transmettez la fiche de paie mensuelle au système RH pour {teacher.fullName}.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Salaire brut base',  value: '3 850 €' },
                  { label: 'H. supplémentaires', value: teacher.hoursSupp > 0 ? `+${teacher.hoursSupp * 42}€` : '0 €' },
                  { label: 'Charges patronales', value: '−1 246 €' },
                  { label: 'Net à payer',        value: '3 142 €' },
                ].map(f => (
                  <div key={f.label} className="rounded-lg border p-3">
                    <p className="text-[10px] text-muted-foreground mb-1">{f.label}</p>
                    <p className="font-bold text-lg">{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="flex-1 rounded-lg bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                  💳 Injecter fiche mai 2026
                </button>
                <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  📥 Télécharger PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminTeachers() {
  const [selected, setSelected] = useState<Teacher | undefined>(undefined)
  const [filter, setFilter]     = useState<'all' | TeacherStatus>('all')
  const [search, setSearch]     = useState('')

  const visible = TEACHERS.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return t.fullName.toLowerCase().includes(q) || t.department.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
    }
    return true
  })

  const overload = TEACHERS.filter(t => t.hoursDone > t.hoursTarget)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profils, Contrats & Heures</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestion des enseignants et suivi des charges horaires</p>
        </div>
        <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
          + Ajouter enseignant
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Enseignants actifs', value: TEACHERS.filter(t => t.status === 'active').length, color: 'text-emerald-600' },
          { label: 'En congé',           value: TEACHERS.filter(t => t.status === 'on_leave').length, color: 'text-amber-600' },
          { label: 'H. supp. en attente', value: overload.reduce((a, t) => a + t.hoursSupp, 0), color: 'text-rose-600', suffix: 'h' },
          { label: 'Départements',       value: new Set(TEACHERS.map(t => t.department)).size, color: 'text-indigo-600' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}{k.suffix ?? ''}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {overload.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          ⚠ <strong>{overload.length} enseignant{overload.length > 1 ? 's' : ''}</strong> dépassent leur quota horaire contractuel — heures supplémentaires à valider.
        </div>
      )}

      {/* Filter + Search */}
      <div className="flex flex-wrap gap-2 items-center">
        {(['all','active','on_leave','suspended'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              filter === f ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : f === 'on_leave' ? 'En congé' : 'Suspendus'}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="ml-auto rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Enseignant</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Département</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Contrat</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Charge horaire</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {visible.map(t => {
              const pct = loadPct(t.hoursDone, t.hoursTarget)
              const ci  = contractInfo(t.contract)
              const si  = statusInfo(t.status)
              return (
                <tr key={t.id} className="hover:bg-muted/40 cursor-pointer" onClick={() => setSelected(t)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xs shrink-0">
                        {t.fullName.split(' ').filter(Boolean).map(n => n.charAt(0)).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-xs">{t.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{t.department}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ci.cls}`}>{ci.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-full rounded-full ${loadColor(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{t.hoursDone}/{t.hoursTarget}h</span>
                      {t.hoursSupp > 0 && (
                        <span className="text-[10px] font-semibold text-rose-600">+{t.hoursSupp}h</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${si.cls}`}>{si.label}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-right">→</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && <TeacherModal teacher={selected} onClose={() => setSelected(undefined)} />}
    </div>
  )
}

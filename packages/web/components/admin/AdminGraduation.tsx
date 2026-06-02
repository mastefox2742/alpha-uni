'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type GradStatus = 'eligible' | 'incomplete_cfu' | 'balance_due' | 'jury_pending' | 'defended' | 'diploma_issued'

interface JuryMember {
  name:  string
  role:  'president' | 'rapporteur' | 'member'
}

interface GradApplication {
  id:           string
  studentId:    string
  studentName:  string
  program:      string
  cfuAcquired:  number
  cfuRequired:  number
  balance:      number          // 0 = paid
  thesisTitle:  string
  supervisor:   string
  defenseDate:  string | undefined
  jury:         JuryMember[]
  status:       GradStatus
  submittedAt:  string
  grade:        number | undefined
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const APPLICATIONS: GradApplication[] = [
  {
    id: 'G001', studentId: 'MAT20220011', studentName: 'Amélie Gros',
    program: 'Master Informatique (M2)',
    cfuAcquired: 120, cfuRequired: 120, balance: 0,
    thesisTitle: 'Apprentissage Fédéré pour la Protection des Données Médicales',
    supervisor: 'Prof. Jean Martin',
    defenseDate: '2026-07-10',
    status: 'jury_pending', submittedAt: '2026-04-15', grade: undefined,
    jury: [
      { name: 'Prof. Jean Martin',    role: 'president' },
      { name: 'Dr. Amina Chaoui',     role: 'rapporteur' },
    ],
  },
  {
    id: 'G002', studentId: 'MAT20220034', studentName: 'Mohamed Ait Youssef',
    program: 'Master Informatique (M2)',
    cfuAcquired: 120, cfuRequired: 120, balance: 0,
    thesisTitle: 'Architectures Microservices pour l\'IoT Industriel',
    supervisor: 'Prof. Jean Martin',
    defenseDate: '2026-07-12',
    status: 'jury_pending', submittedAt: '2026-04-20', grade: undefined,
    jury: [
      { name: 'Prof. Jean Martin',    role: 'president' },
    ],
  },
  {
    id: 'G003', studentId: 'MAT20220078', studentName: 'Louise Bertrand',
    program: 'Master Sciences des Données (M2)',
    cfuAcquired: 120, cfuRequired: 120, balance: 0,
    thesisTitle: 'Détection d\'Anomalies par Deep Learning dans les Réseaux',
    supervisor: 'Dr. Amina Chaoui',
    defenseDate: '2026-07-15',
    status: 'eligible', submittedAt: '2026-05-01', grade: undefined,
    jury: [],
  },
  {
    id: 'G004', studentId: 'MAT20220099', studentName: 'Carlos Rivera',
    program: 'Licence Informatique (L3)',
    cfuAcquired: 172, cfuRequired: 180, balance: 0,
    thesisTitle: '—',
    supervisor: '—',
    defenseDate: undefined,
    status: 'incomplete_cfu', submittedAt: '2026-05-10', grade: undefined,
    jury: [],
  },
  {
    id: 'G005', studentId: 'MAT20220055', studentName: 'Nora Khelif',
    program: 'Master Mathématiques (M2)',
    cfuAcquired: 120, cfuRequired: 120, balance: 450,
    thesisTitle: 'Topologie Algébrique et Applications en Physique',
    supervisor: 'Dr. Sophie Roux',
    defenseDate: undefined,
    status: 'balance_due', submittedAt: '2026-04-28', grade: undefined,
    jury: [],
  },
  {
    id: 'G006', studentId: 'MAT20210007', studentName: 'Thomas Andrieu',
    program: 'Master Informatique (M2)',
    cfuAcquired: 120, cfuRequired: 120, balance: 0,
    thesisTitle: 'Sécurité Post-Quantique : Implémentation et Évaluation',
    supervisor: 'Prof. Jean Martin',
    defenseDate: '2026-05-12',
    status: 'diploma_issued', submittedAt: '2026-02-01', grade: 19,
    jury: [
      { name: 'Prof. Jean Martin',     role: 'president' },
      { name: 'Prof. Elena Visconti',  role: 'rapporteur' },
      { name: 'Dr. Amina Chaoui',      role: 'member' },
    ],
  },
]

const ALL_TEACHERS = ['Prof. Jean Martin', 'Dr. Sophie Roux', 'Dr. Amina Chaoui', 'Dr. Paul Legrand', 'Prof. Elena Visconti']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function gradStatusInfo(s: GradStatus) {
  const map: Record<GradStatus, { label: string; cls: string }> = {
    eligible:      { label: 'Éligible — jury à constituer', cls: 'bg-emerald-100 text-emerald-700' },
    incomplete_cfu:{ label: 'CFU insuffisants',              cls: 'bg-rose-100 text-rose-700' },
    balance_due:   { label: 'Solde impayé',                  cls: 'bg-rose-100 text-rose-700' },
    jury_pending:  { label: 'Jury partiel',                  cls: 'bg-amber-100 text-amber-700' },
    defended:      { label: 'Soutenu — diplôme en cours',   cls: 'bg-indigo-100 text-indigo-700' },
    diploma_issued:{ label: 'Diplôme émis',                  cls: 'bg-slate-100 text-slate-600' },
  }
  return map[s]
}

function juryRoleLabel(r: JuryMember['role']) {
  return r === 'president' ? 'Président' : r === 'rapporteur' ? 'Rapporteur' : 'Membre'
}

// ─── Application Modal ────────────────────────────────────────────────────────
function GradModal({ app, onClose }: { app: GradApplication; onClose: () => void }) {
  const [jury, setJury]       = useState<JuryMember[]>(app.jury)
  const [addName, setAddName] = useState('')
  const [addRole, setAddRole] = useState<JuryMember['role']>('member')
  const [defDate, setDefDate] = useState(app.defenseDate ?? '')
  const [action, setAction]   = useState<'idle' | 'generating' | 'done'>('idle')

  const cfuOk      = app.cfuAcquired >= app.cfuRequired
  const balanceOk  = app.balance === 0
  const juryOk     = jury.some(j => j.role === 'president') && jury.some(j => j.role === 'rapporteur') && jury.length >= 3
  const canGenerate = cfuOk && balanceOk && juryOk && defDate && app.status !== 'diploma_issued'

  function addMember() {
    if (!addName.trim()) return
    setJury(j => [...j, { name: addName.trim(), role: addRole }])
    setAddName('')
  }

  function handleGenerate() {
    setAction('generating')
    setTimeout(() => setAction('done'), 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="border-b px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{app.studentName}</h2>
            <p className="text-sm text-muted-foreground">{app.studentId} · {app.program}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Eligibility checklist */}
          <div className="rounded-xl border p-4 space-y-3">
            <h3 className="text-sm font-semibold">Vérification d'éligibilité</h3>
            {[
              { ok: cfuOk,     label: `CFU acquis : ${app.cfuAcquired}/${app.cfuRequired}`, detail: !cfuOk ? `Manque ${app.cfuRequired - app.cfuAcquired} CFU` : undefined },
              { ok: balanceOk, label: 'Solde comptable',                                     detail: !balanceOk ? `${app.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} restant` : undefined },
              { ok: !!app.supervisor, label: `Directeur de mémoire : ${app.supervisor}` },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`text-lg ${c.ok ? 'text-emerald-600' : 'text-rose-500'}`}>{c.ok ? '✓' : '✗'}</span>
                <span className="text-sm">{c.label}</span>
                {c.detail && <span className="ml-auto text-xs text-rose-600 font-semibold">{c.detail}</span>}
              </div>
            ))}
          </div>

          {/* Thesis */}
          {app.thesisTitle !== '—' && (
            <div className="rounded-xl border p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Titre du mémoire</h3>
              <p className="text-sm font-medium">{app.thesisTitle}</p>
            </div>
          )}

          {/* Defense date */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Date de soutenance</label>
            <input type="date" value={defDate}
              onChange={e => setDefDate(e.target.value)}
              disabled={app.status === 'diploma_issued'}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-800 disabled:opacity-60"
            />
          </div>

          {/* Jury */}
          <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Composition du jury</h3>
              <span className={`text-xs font-semibold ${juryOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                {juryOk ? '✓ Jury complet' : `${jury.length}/3 membres minimum`}
              </span>
            </div>
            {jury.length > 0 ? (
              <div className="space-y-1.5">
                {jury.map((j, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-1.5">
                    <span className="text-xs font-semibold text-rose-600 w-20 shrink-0">{juryRoleLabel(j.role)}</span>
                    <span className="text-sm">{j.name}</span>
                    {app.status !== 'diploma_issued' && (
                      <button onClick={() => setJury(jj => jj.filter((_, ii) => ii !== i))} className="ml-auto text-slate-400 hover:text-rose-500 text-xs">✗</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Aucun membre ajouté</p>
            )}

            {app.status !== 'diploma_issued' && (
              <div className="flex gap-2 mt-2">
                <select
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  className="flex-1 rounded-lg border px-2 py-1.5 text-sm dark:bg-slate-800"
                >
                  <option value="">— Choisir enseignant —</option>
                  {ALL_TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={addRole}
                  onChange={e => setAddRole(e.target.value as JuryMember['role'])}
                  className="rounded-lg border px-2 py-1.5 text-sm dark:bg-slate-800"
                >
                  <option value="president">Président</option>
                  <option value="rapporteur">Rapporteur</option>
                  <option value="member">Membre</option>
                </select>
                <button onClick={addMember} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">
                  Ajouter
                </button>
              </div>
            )}
          </div>

          {app.grade !== undefined && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-center">
              <p className="text-indigo-700 font-bold text-lg">Note finale : {app.grade}/20</p>
            </div>
          )}

          {/* Generate diploma */}
          {action === 'idle' && (
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full rounded-xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🎓 Générer le diplôme & convoquer le jury
            </button>
          )}
          {action === 'generating' && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-center animate-pulse">
              <p className="text-indigo-700 font-semibold">⏳ Génération du diplôme en cours…</p>
            </div>
          )}
          {action === 'done' && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-2">
              <p className="text-2xl">🎓</p>
              <p className="text-emerald-700 font-bold">Diplôme généré avec succès !</p>
              <p className="text-sm text-emerald-600">Le jury a été convoqué. L'étudiant a été notifié.</p>
              <div className="flex gap-2 justify-center mt-2">
                <button className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                  📥 Télécharger PDF
                </button>
                <button onClick={onClose} className="rounded-lg border border-emerald-400 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                  Fermer
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
export function AdminGraduation() {
  const [selected, setSelected] = useState<GradApplication | undefined>(undefined)
  const [filter, setFilter]     = useState<GradStatus | 'all'>('all')

  const visible  = filter === 'all' ? APPLICATIONS : APPLICATIONS.filter(a => a.status === filter)
  const eligible = APPLICATIONS.filter(a => a.status === 'eligible' || a.status === 'jury_pending')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demandes de Laurea</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Vérification CFU, constitution du jury et génération des diplômes</p>
        </div>
      </div>

      {eligible.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          🎓 <strong>{eligible.length} dossier{eligible.length > 1 ? 's' : ''}</strong> éligible{eligible.length > 1 ? 's' : ''} à la soutenance — jury à constituer avant le 15 juin 2026
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Éligibles',         value: APPLICATIONS.filter(a => a.status === 'eligible').length, color: 'text-emerald-600' },
          { label: 'Jury incomplet',    value: APPLICATIONS.filter(a => a.status === 'jury_pending').length, color: 'text-amber-600' },
          { label: 'Diplômes émis',     value: APPLICATIONS.filter(a => a.status === 'diploma_issued').length, color: 'text-indigo-600' },
          { label: 'Bloqués',          value: APPLICATIONS.filter(a => a.status === 'incomplete_cfu' || a.status === 'balance_due').length, color: 'text-rose-600' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all','eligible','jury_pending','incomplete_cfu','balance_due','defended','diploma_issued'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              filter === f ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {f === 'all' ? 'Tous' : gradStatusInfo(f).label}
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="divide-y">
          {visible.map(app => {
            const si       = gradStatusInfo(app.status)
            const cfuOk    = app.cfuAcquired >= app.cfuRequired
            const balOk    = app.balance === 0
            const jurySize = app.jury.length
            return (
              <div
                key={app.id}
                onClick={() => setSelected(app)}
                className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 cursor-pointer"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold text-sm">
                  🎓
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{app.studentName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${si.cls}`}>{si.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{app.studentId} · {app.program}</p>
                  <div className="flex gap-3 mt-1 text-[10px]">
                    <span className={cfuOk ? 'text-emerald-600' : 'text-rose-600'}>
                      {cfuOk ? '✓' : '✗'} {app.cfuAcquired}/{app.cfuRequired} CFU
                    </span>
                    <span className={balOk ? 'text-emerald-600' : 'text-rose-600'}>
                      {balOk ? '✓' : '✗'} Solde
                    </span>
                    <span className={jurySize >= 3 ? 'text-emerald-600' : 'text-amber-600'}>
                      {jurySize >= 3 ? '✓' : `${jurySize}/3`} Jury
                    </span>
                    {app.defenseDate && (
                      <span className="text-blue-600">📅 {new Date(app.defenseDate).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                </div>
                <span className="text-muted-foreground shrink-0">→</span>
              </div>
            )
          })}
          {visible.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Aucune demande dans cette catégorie</p>
          )}
        </div>
      </div>

      {selected && <GradModal app={selected} onClose={() => setSelected(undefined)} />}
    </div>
  )
}

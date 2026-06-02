'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type VerbaleStatus = 'published' | 'contested' | 'under_review' | 'corrected' | 'draft'

interface GradeEntry {
  studentId:   string
  studentName: string
  grade:       number | 'ABS' | 'AJOURNÉ'
  original:    number | 'ABS' | 'AJOURNÉ' | undefined
  corrected:   boolean
}

interface Verbale {
  id:           string
  courseCode:   string
  courseName:   string
  teacher:      string
  session:      string
  date:         string
  status:       VerbaleStatus
  otpSigned:    boolean
  contestReason:string | undefined
  grades:       GradeEntry[]
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const VERBALES: Verbale[] = [
  {
    id: 'V001', courseCode: 'INFO301', courseName: 'Algorithmes Avancés',
    teacher: 'Prof. Jean Martin', session: 'Mai 2026', date: '2026-05-20',
    status: 'contested', otpSigned: true,
    contestReason: 'Erreur de saisie signalée — étudiant MAT20240099 présent le jour de l\'examen mais marqué ABS',
    grades: [
      { studentId: 'MAT20240001', studentName: 'Camille Lefèvre', grade: 16, original: undefined, corrected: false },
      { studentId: 'MAT20240046', studentName: 'Théo Richard',    grade: 11, original: undefined, corrected: false },
      { studentId: 'MAT20240099', studentName: 'Jade Fontaine',   grade: 'ABS', original: undefined, corrected: false },
      { studentId: 'MAT20240102', studentName: 'Noah Petit',      grade: 14, original: undefined, corrected: false },
      { studentId: 'MAT20240115', studentName: 'Emma Garcia',     grade: 9, original: undefined, corrected: false },
    ],
  },
  {
    id: 'V002', courseCode: 'INFO501', courseName: 'Intelligence Artificielle',
    teacher: 'Prof. Jean Martin', session: 'Janvier 2026', date: '2026-01-22',
    status: 'published', otpSigned: true,
    contestReason: undefined,
    grades: [
      { studentId: 'MAT20240001', studentName: 'Camille Lefèvre', grade: 17, original: undefined, corrected: false },
      { studentId: 'MAT20240087', studentName: 'Sarah Ben Amar',  grade: 18, original: undefined, corrected: false },
      { studentId: 'MAT20240033', studentName: 'Lucas Chen',      grade: 13, original: undefined, corrected: false },
    ],
  },
  {
    id: 'V003', courseCode: 'MATH301', courseName: 'Analyse Complexe',
    teacher: 'Dr. Sophie Roux', session: 'Janvier 2026', date: '2026-01-18',
    status: 'corrected', otpSigned: true,
    contestReason: 'Correction administrative — erreur de calcul dans note finale',
    grades: [
      { studentId: 'MAT20240046', studentName: 'Théo Richard', grade: 11, original: 9, corrected: true },
      { studentId: 'MAT20240078', studentName: 'Inès Moreau',  grade: 15, original: undefined, corrected: false },
    ],
  },
  {
    id: 'V004', courseCode: 'DATA101', courseName: 'Fondements du Big Data',
    teacher: 'Dr. Amina Chaoui', session: 'Janvier 2026', date: '2026-01-25',
    status: 'published', otpSigned: true,
    contestReason: undefined,
    grades: [
      { studentId: 'MAT20250087', studentName: 'Sarah Ben Amar', grade: 18, original: undefined, corrected: false },
      { studentId: 'MAT20250044', studentName: 'Ali Karimi',     grade: 16, original: undefined, corrected: false },
    ],
  },
  {
    id: 'V005', courseCode: 'MATH302', courseName: 'Algèbre Linéaire II',
    teacher: 'Dr. Sophie Roux', session: 'Janvier 2026', date: '2026-01-20',
    status: 'under_review', otpSigned: false,
    contestReason: 'Verbale non signé — enseignante en congé maladie',
    grades: [
      { studentId: 'MAT20240046', studentName: 'Théo Richard', grade: 8, original: undefined, corrected: false },
      { studentId: 'MAT20240078', studentName: 'Inès Moreau',  grade: 14, original: undefined, corrected: false },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function verbaleStatusInfo(s: VerbaleStatus) {
  const map: Record<VerbaleStatus, { label: string; cls: string }> = {
    published:    { label: 'Publié',          cls: 'bg-emerald-100 text-emerald-700' },
    contested:    { label: 'Contesté',        cls: 'bg-rose-100 text-rose-700' },
    under_review: { label: 'En révision',     cls: 'bg-amber-100 text-amber-700' },
    corrected:    { label: 'Corrigé (Admin)', cls: 'bg-indigo-100 text-indigo-700' },
    draft:        { label: 'Brouillon',       cls: 'bg-slate-100 text-slate-600' },
  }
  return map[s]
}

function gradeDisplay(g: number | 'ABS' | 'AJOURNÉ') {
  if (g === 'ABS') return <span className="text-slate-400 font-semibold">ABS</span>
  if (g === 'AJOURNÉ') return <span className="text-amber-600 font-semibold">AJOURNÉ</span>
  const color = g >= 16 ? 'text-emerald-700' : g >= 12 ? 'text-slate-700' : g >= 10 ? 'text-amber-700' : 'text-rose-600'
  return <span className={`font-semibold ${color}`}>{g}/20</span>
}

// ─── Override Modal ───────────────────────────────────────────────────────────
function OverrideModal({ verbale, onClose }: { verbale: Verbale; onClose: () => void }) {
  const [grades, setGrades] = useState<GradeEntry[]>(verbale.grades.map(g => ({ ...g })))
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [override, setOverride] = useState(false)

  function handleGradeChange(idx: number, val: string) {
    setGrades(prev => prev.map((g, i) => {
      if (i !== idx) return g
      const num = parseFloat(val)
      return {
        ...g,
        grade:    isNaN(num) ? g.grade : Math.min(20, Math.max(0, num)),
        original: g.original ?? g.grade,
        corrected: true,
      }
    }))
  }

  function handleSubmit() {
    if (!reason.trim()) { alert('Motif de correction obligatoire'); return }
    setConfirmed(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="border-b px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Audit PV — {verbale.courseCode}</h2>
            <p className="text-sm text-muted-foreground">{verbale.courseName} · {verbale.teacher} · {verbale.session}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {verbale.contestReason && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              🔴 <strong>Motif du litige :</strong> {verbale.contestReason}
            </div>
          )}

          {!confirmed ? (
            <>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                ⚠ Toute modification de ce verbale sera tracée dans le journal d'audit et attribuée à votre compte administrateur.
              </div>

              {/* Grade override table */}
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Étudiant</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Note originale</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground">Correction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {grades.map((g, idx) => (
                      <tr key={g.studentId} className={g.corrected ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''}>
                        <td className="px-3 py-2">
                          <p className="font-medium text-xs">{g.studentName}</p>
                          <p className="text-[10px] text-muted-foreground">{g.studentId}</p>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {gradeDisplay(g.grade)}
                          {g.corrected && g.original !== undefined && (
                            <span className="ml-1 line-through text-slate-400 text-xs">
                              {g.original === 'ABS' ? 'ABS' : `${g.original}/20`}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min={0} max={20} step={0.5}
                            placeholder="—"
                            disabled={!override}
                            onChange={e => handleGradeChange(idx, e.target.value)}
                            className="w-16 rounded border px-2 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:opacity-40 dark:bg-slate-800"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={override} onChange={e => setOverride(e.target.checked)} className="accent-rose-600" />
                <span className="text-sm font-medium text-rose-700">J'active la modification des notes (pouvoir administrateur)</span>
              </label>

              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Motif de correction obligatoire (ex: erreur de saisie, présence confirmée par liste d'émargement…)"
                rows={3}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!override || !reason.trim()}
                  className="flex-1 rounded-lg bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ✓ Valider la correction administrative
                </button>
                <button onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Annuler
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
              <p className="text-2xl">✅</p>
              <p className="text-emerald-700 font-semibold">Verbale corrigé et enregistré dans le journal d'audit</p>
              <p className="text-sm text-emerald-600">Les étudiants concernés seront notifiés de la mise à jour de leur note.</p>
              <button onClick={onClose} className="mt-3 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminExamsAudit() {
  const [selected, setSelected] = useState<Verbale | undefined>(undefined)
  const [filter, setFilter]     = useState<VerbaleStatus | 'all'>('all')

  const visible = filter === 'all' ? VERBALES : VERBALES.filter(v => v.status === filter)
  const contested = VERBALES.filter(v => v.status === 'contested' || v.status === 'under_review')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit des Examens (PV)</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Contrôle, correction et validation des verbales d'examen</p>
        </div>
      </div>

      {contested.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-700 mb-2">🔴 {contested.length} verbale{contested.length > 1 ? 's' : ''} en litige ou révision</p>
          <div className="space-y-1">
            {contested.map(v => (
              <div key={v.id} className="flex items-center justify-between text-xs">
                <span className="text-rose-600">{v.courseCode} — {v.courseName} ({v.teacher})</span>
                <button onClick={() => setSelected(v)} className="rounded bg-rose-600 px-2 py-0.5 text-white font-semibold hover:bg-rose-700">
                  Traiter →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Verbales publiés',  value: VERBALES.filter(v => v.status === 'published' || v.status === 'corrected').length, color: 'text-emerald-600' },
          { label: 'Contestés',         value: VERBALES.filter(v => v.status === 'contested').length, color: 'text-rose-600' },
          { label: 'En révision',       value: VERBALES.filter(v => v.status === 'under_review').length, color: 'text-amber-600' },
          { label: 'Corrigés (admin)',  value: VERBALES.filter(v => v.status === 'corrected').length, color: 'text-indigo-600' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all','published','contested','under_review','corrected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              filter === f ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {f === 'all' ? 'Tous' : verbaleStatusInfo(f).label}
          </button>
        ))}
      </div>

      {/* Verbales list */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="divide-y">
          {visible.map(v => {
            const si = verbaleStatusInfo(v.status)
            return (
              <div
                key={v.id}
                onClick={() => setSelected(v)}
                className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 cursor-pointer"
              >
                <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                  v.status === 'contested' ? 'bg-rose-500' :
                  v.status === 'under_review' ? 'bg-amber-400' :
                  v.status === 'corrected' ? 'bg-indigo-500' :
                  'bg-emerald-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{v.courseCode} — {v.courseName}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${si.cls}`}>{si.label}</span>
                    {!v.otpSigned && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Non signé OTP</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.teacher} · Session {v.session} · {new Date(v.date).toLocaleDateString('fr-FR')}</p>
                  {v.contestReason && (
                    <p className="text-xs text-rose-600 mt-1 italic">« {v.contestReason.slice(0, 80)}… »</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{v.grades.length} étudiant{v.grades.length > 1 ? 's' : ''}</p>
                </div>
                <span className="text-muted-foreground shrink-0">→</span>
              </div>
            )
          })}
        </div>
      </div>

      {selected && <OverrideModal verbale={selected} onClose={() => setSelected(undefined)} />}
    </div>
  )
}

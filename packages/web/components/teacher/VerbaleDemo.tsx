'use client'

import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
type GradeStatus = 'draft' | 'proposed' | 'accepted' | 'rejected' | 'absent'

interface DemoStudent {
  id:        string
  firstName: string
  lastName:  string
  matricola: string
  grade:     number | null
  honors:    boolean
  notes:     string
  status:    GradeStatus
}

interface DemoSession {
  examId:     string
  courseId:   string
  courseName: string
  date:       Date
  room:       string
  published:  boolean
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const SESSIONS: Record<string, DemoSession> = {
  es1: {
    examId: 'es1',
    courseId: 'c1',
    courseName: 'Algorithmique & Structures de données',
    date: new Date('2026-05-10T09:00:00'),
    room: 'Amphi A',
    published: false,
  },
  es4: {
    examId: 'es4',
    courseId: 'c3',
    courseName: 'Bases de données',
    date: new Date('2026-06-20T14:00:00'),
    room: 'Salle C302',
    published: false,
  },
  es5: {
    examId: 'es5',
    courseId: 'c3',
    courseName: 'Bases de données',
    date: new Date('2026-05-05T14:00:00'),
    room: 'Salle C302',
    published: true,
  },
}

const FALLBACK_SESSION: DemoSession = {
  examId: 'demo',
  courseId: 'c1',
  courseName: 'Cours de démonstration',
  date: new Date('2026-05-10T09:00:00'),
  room: 'Salle A',
  published: false,
}

const INITIAL_STUDENTS: Record<string, DemoStudent[]> = {
  es1: [
    { id: 's1',  firstName: 'Lucas',   lastName: 'Moreau',    matricola: 'MAT20240034', grade: 30,   honors: true,  notes: 'Excellent travail, projet remarquable', status: 'accepted' },
    { id: 's2',  firstName: 'Marie',   lastName: 'Dupont',    matricola: 'MAT20240021', grade: 28,   honors: false, notes: '', status: 'accepted' },
    { id: 's3',  firstName: 'Sophie',  lastName: 'Bernard',   matricola: 'MAT20240015', grade: 25,   honors: false, notes: '', status: 'proposed' },
    { id: 's4',  firstName: 'Antoine', lastName: 'Laurent',   matricola: 'MAT20240042', grade: 22,   honors: false, notes: 'Bonnes bases, à approfondir', status: 'proposed' },
    { id: 's5',  firstName: 'Camille', lastName: 'Petit',     matricola: 'MAT20240058', grade: 27,   honors: false, notes: '', status: 'proposed' },
    { id: 's6',  firstName: 'Thomas',  lastName: 'Martin',    matricola: 'MAT20240009', grade: 21,   honors: false, notes: '', status: 'rejected' },
    { id: 's7',  firstName: 'Julie',   lastName: 'Rousseau',  matricola: 'MAT20240031', grade: null, honors: false, notes: '', status: 'absent' },
    { id: 's8',  firstName: 'Nicolas', lastName: 'Leroy',     matricola: 'MAT20240067', grade: null, honors: false, notes: '', status: 'draft' },
    { id: 's9',  firstName: 'Emma',    lastName: 'Dubois',    matricola: 'MAT20240044', grade: null, honors: false, notes: '', status: 'draft' },
    { id: 's10', firstName: 'Paul',    lastName: 'Simon',     matricola: 'MAT20240073', grade: 24,   honors: false, notes: '', status: 'proposed' },
    { id: 's11', firstName: 'Léa',     lastName: 'Fontaine',  matricola: 'MAT20240052', grade: 26,   honors: false, notes: '', status: 'proposed' },
    { id: 's12', firstName: 'Hugo',    lastName: 'Garnier',   matricola: 'MAT20240088', grade: 19,   honors: false, notes: '', status: 'proposed' },
    { id: 's13', firstName: 'Manon',   lastName: 'Blanc',     matricola: 'MAT20240017', grade: null, honors: false, notes: '', status: 'draft' },
    { id: 's14', firstName: 'Pierre',  lastName: 'Bonnet',    matricola: 'MAT20240039', grade: 30,   honors: false, notes: '', status: 'proposed' },
    { id: 's15', firstName: 'Laura',   lastName: 'Girard',    matricola: 'MAT20240025', grade: null, honors: false, notes: '', status: 'absent' },
  ],
  es4: [
    { id: 'b1', firstName: 'Anaïs',    lastName: 'Perrin',    matricola: 'MAT20240011', grade: 27, honors: false, notes: '', status: 'proposed' },
    { id: 'b2', firstName: 'Julien',   lastName: 'Morel',     matricola: 'MAT20240028', grade: 23, honors: false, notes: '', status: 'proposed' },
    { id: 'b3', firstName: 'Zoé',      lastName: 'Chevalier', matricola: 'MAT20240055', grade: 29, honors: false, notes: 'Très bonne maîtrise SQL', status: 'proposed' },
    { id: 'b4', firstName: 'Romain',   lastName: 'Bertrand',  matricola: 'MAT20240063', grade: 21, honors: false, notes: '', status: 'proposed' },
    { id: 'b5', firstName: 'Inès',     lastName: 'Lambert',   matricola: 'MAT20240037', grade: 18, honors: false, notes: 'Travail insuffisant', status: 'proposed' },
    { id: 'b6', firstName: 'Théo',     lastName: 'Richard',   matricola: 'MAT20240046', grade: 30, honors: true,  notes: '', status: 'proposed' },
    { id: 'b7', firstName: 'Mathilde', lastName: 'Roux',      matricola: 'MAT20240019', grade: 25, honors: false, notes: '', status: 'proposed' },
    { id: 'b8', firstName: 'Adrien',   lastName: 'Dupont',    matricola: 'MAT20240082', grade: 22, honors: false, notes: '', status: 'proposed' },
  ],
  es5: [
    { id: 'c1', firstName: 'Clément',  lastName: 'Vasseur',   matricola: 'MAT20230011', grade: 26,   honors: false, notes: '', status: 'accepted' },
    { id: 'c2', firstName: 'Noémie',   lastName: 'Colin',     matricola: 'MAT20230028', grade: 22,   honors: false, notes: '', status: 'accepted' },
    { id: 'c3', firstName: 'Baptiste', lastName: 'Renard',    matricola: 'MAT20230055', grade: 28,   honors: false, notes: '', status: 'accepted' },
    { id: 'c4', firstName: 'Fanny',    lastName: 'Carpentier',matricola: 'MAT20230063', grade: 19,   honors: false, notes: '', status: 'accepted' },
    { id: 'c5', firstName: 'Samuel',   lastName: 'Vidal',     matricola: 'MAT20230037', grade: 21,   honors: false, notes: '', status: 'rejected' },
    { id: 'c6', firstName: 'Pauline',  lastName: 'Meunier',   matricola: 'MAT20230046', grade: 30,   honors: true,  notes: '', status: 'accepted' },
    { id: 'c7', firstName: 'Arthur',   lastName: 'Lemaire',   matricola: 'MAT20230019', grade: 24,   honors: false, notes: '', status: 'accepted' },
    { id: 'c8', firstName: 'Chloé',    lastName: 'Faure',     matricola: 'MAT20230082', grade: null, honors: false, notes: '', status: 'absent' },
  ],
}

const GRADES = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function gradeColor(v: number, honors: boolean) {
  if (honors) return 'text-violet-700 font-bold'
  if (v >= 27) return 'text-emerald-600 font-bold'
  if (v >= 24) return 'text-blue-600'
  if (v >= 18) return 'text-orange-600'
  return 'text-destructive'
}

function statusBadge(s: GradeStatus) {
  const map: Record<GradeStatus, string> = {
    draft:    'bg-muted text-muted-foreground',
    proposed: 'bg-amber-100 text-amber-700',
    accepted: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    absent:   'bg-slate-100 text-slate-500',
  }
  const label: Record<GradeStatus, string> = {
    draft:    'À saisir',
    proposed: 'Proposée',
    accepted: 'Acceptée',
    rejected: 'Refusée',
    absent:   'Absent',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[s]}`}>
      {label[s]}
    </span>
  )
}

// ─── OTP Modal ────────────────────────────────────────────────────────────────
function OtpModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const DEMO_OTP = '482617'

  function handleSubmit() {
    if (code === DEMO_OTP) {
      onConfirm()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
        <h3 className="text-base font-semibold">Signature électronique OTP</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Un code de confirmation a été envoyé à votre adresse institutionnelle.
        </p>
        <p className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-center font-mono text-lg font-bold tracking-widest text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
          Code de démo : {DEMO_OTP}
        </p>
        <input
          type="text"
          maxLength={6}
          placeholder="Entrez le code à 6 chiffres"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className={`mt-4 w-full rounded-lg border bg-background px-3 py-2 text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error ? 'border-red-400 ring-2 ring-red-300' : ''}`}
        />
        {error && <p className="mt-1 text-center text-xs text-red-500">Code incorrect, réessayez</p>}
        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={code.length !== 6}
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            Confirmer et publier
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CSV Import Modal ─────────────────────────────────────────────────────────
function CsvImportModal({
  students,
  onImport,
  onClose,
}: {
  students:  DemoStudent[]
  onImport:  (grades: Record<string, number>) => void
  onClose:   () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'idle' | 'parsing' | 'preview' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<Record<string, number>>({})

  function simulateParse() {
    setStep('parsing')
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          // Build fake parsed grades (random 18-30 for unlocked students)
          const grades: Record<string, number> = {}
          students.forEach(s => {
            if (s.status === 'draft') {
              grades[s.id] = Math.floor(Math.random() * 13) + 18
            }
          })
          setPreview(grades)
          setStep('preview')
          return 100
        }
        return prev + 20
      })
    }, 150)
  }

  function confirmImport() {
    onImport(preview)
    setStep('done')
    setTimeout(onClose, 1500)
  }

  const previewCount = Object.keys(preview).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
        <h3 className="text-base font-semibold">Import CSV des notes</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Format attendu : <code className="rounded bg-muted px-1 py-0.5 text-xs">matricola,note</code> — une ligne par étudiant.
        </p>

        {step === 'idle' && (
          <>
            {/* Template download hint */}
            <div className="mt-4 rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Sélectionnez votre fichier CSV ou glissez-déposez ici
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Choisir un fichier
              </button>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={simulateParse} />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              ou{' '}
              <button
                onClick={simulateParse}
                className="text-indigo-600 underline hover:no-underline dark:text-indigo-400"
              >
                simuler l'import avec des données test
              </button>
            </p>
          </>
        )}

        {step === 'parsing' && (
          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-muted-foreground">Analyse du fichier…</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">{progress}%</p>
          </div>
        )}

        {step === 'preview' && (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
              {previewCount} note{previewCount !== 1 ? 's' : ''} détectée{previewCount !== 1 ? 's' : ''} pour des étudiants en attente.
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border divide-y text-sm">
              {students
                .filter(s => preview[s.id] !== undefined)
                .map(s => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2">
                    <span>{s.firstName} {s.lastName}</span>
                    <span className="font-mono font-semibold text-indigo-600">{preview[s.id]}/30</span>
                  </div>
                ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={confirmImport}
                className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Importer {previewCount} note{previewCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="mt-6 text-center">
            <p className="text-2xl">✅</p>
            <p className="mt-2 text-sm font-medium text-emerald-600">Import réussi !</p>
          </div>
        )}

        {step !== 'done' && step !== 'preview' && (
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Fermer
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Grade Row ────────────────────────────────────────────────────────────────
function GradeRow({
  student,
  published,
  selected,
  onSelect,
  onUpdate,
}: {
  student:   DemoStudent
  published: boolean
  selected:  boolean
  onSelect:  (id: string, val: boolean) => void
  onUpdate:  (id: string, patch: Partial<DemoStudent>) => void
}) {
  const [toast, setToast] = useState<string | null>(null)

  function save() {
    if (student.honors && student.grade !== 30) {
      setToast('Pour 30L, la note doit être 30')
      setTimeout(() => setToast(null), 2500)
      return
    }
    onUpdate(student.id, { status: 'proposed' })
    setToast('Note enregistrée')
    setTimeout(() => setToast(null), 2000)
  }

  const locked = published || student.status === 'accepted' || student.status === 'rejected'

  return (
    <tr className={`border-b last:border-0 transition-colors ${selected ? 'bg-indigo-50 dark:bg-indigo-950/20' : ''}`}>
      {/* Checkbox */}
      <td className="py-3 pl-4 pr-2">
        {!locked && (
          <input
            type="checkbox"
            checked={selected}
            onChange={e => onSelect(student.id, e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
          />
        )}
      </td>

      {/* Student */}
      <td className="py-3 pr-4">
        <p className="text-sm font-medium">{student.firstName} {student.lastName}</p>
        <p className="text-xs text-muted-foreground">{student.matricola}</p>
      </td>

      {/* Grade */}
      <td className="py-3 pr-4">
        {locked ? (
          <span className={`text-sm ${student.grade ? gradeColor(student.grade, student.honors) : 'text-muted-foreground'}`}>
            {student.grade
              ? (student.honors ? '30L' : String(student.grade))
              : (student.status === 'absent' ? 'Absent' : '—')}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={student.grade ?? 18}
              onChange={e => onUpdate(student.id, { grade: Number(e.target.value) })}
              className="rounded border bg-background px-2 py-1 text-sm"
            >
              {GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={student.honors}
                disabled={student.grade !== 30}
                onChange={e => onUpdate(student.id, { honors: e.target.checked })}
              />
              <span>30L</span>
            </label>
          </div>
        )}
      </td>

      {/* Notes */}
      <td className="py-3 pr-4">
        {locked ? (
          <span className="text-xs italic text-muted-foreground">{student.notes || '—'}</span>
        ) : (
          <input
            type="text"
            placeholder="Remarques (optionnel)"
            value={student.notes}
            onChange={e => onUpdate(student.id, { notes: e.target.value })}
            className="w-40 rounded border bg-background px-2 py-1 text-xs"
          />
        )}
      </td>

      {/* Status */}
      <td className="py-3 pr-4">{statusBadge(student.status)}</td>

      {/* Action */}
      <td className="py-3">
        {toast ? (
          <span className="text-xs font-medium text-emerald-600">{toast}</span>
        ) : !locked && student.status !== 'absent' ? (
          <button
            onClick={save}
            className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90"
          >
            {student.status === 'draft' ? 'Saisir' : 'Modifier'}
          </button>
        ) : null}
      </td>
    </tr>
  )
}

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────
function BulkBar({
  count,
  onApplyGrade,
  onMarkAbsent,
  onClear,
}: {
  count:         number
  onApplyGrade:  (g: number) => void
  onMarkAbsent:  () => void
  onClear:       () => void
}) {
  const [bulkGrade, setBulkGrade] = useState(25)

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 dark:border-indigo-800 dark:bg-indigo-950/30">
      <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
        {count} étudiant{count !== 1 ? 's' : ''} sélectionné{count !== 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-2">
        <select
          value={bulkGrade}
          onChange={e => setBulkGrade(Number(e.target.value))}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <button
          onClick={() => onApplyGrade(bulkGrade)}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
        >
          Appliquer note
        </button>
      </div>
      <button
        onClick={onMarkAbsent}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        Marquer absents
      </button>
      <button
        onClick={onClear}
        className="ml-auto text-xs text-muted-foreground hover:text-foreground"
      >
        Désélectionner
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function VerbaleDemo({
  courseId,
  examId,
}: {
  courseId: string
  examId:   string
}) {
  const session  = SESSIONS[examId] ?? FALLBACK_SESSION
  const initRows = INITIAL_STUDENTS[examId] ?? []

  const [students,   setStudents]   = useState<DemoStudent[]>(initRows)
  const [published,  setPublished]  = useState(session.published)
  const [pubToast,   setPubToast]   = useState<string | null>(null)
  const [selected,   setSelected]   = useState<Set<string>>(new Set())
  const [showOtp,    setShowOtp]    = useState(false)
  const [showCsv,    setShowCsv]    = useState(false)

  function updateStudent(id: string, patch: Partial<DemoStudent>) {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }

  // Selection helpers
  const unlocked = students.filter(
    s => !published && s.status !== 'accepted' && s.status !== 'rejected'
  )
  const allSelected = unlocked.length > 0 && unlocked.every(s => selected.has(s.id))
  const someSelected = selected.size > 0

  function toggleAll(val: boolean) {
    setSelected(val ? new Set(unlocked.map(s => s.id)) : new Set())
  }

  function toggleOne(id: string, val: boolean) {
    setSelected(prev => {
      const next = new Set(prev)
      if (val) { next.add(id) } else { next.delete(id) }
      return next
    })
  }

  function bulkApplyGrade(grade: number) {
    setStudents(prev =>
      prev.map(s => selected.has(s.id) ? { ...s, grade, status: 'proposed' } : s),
    )
    setSelected(new Set())
  }

  function bulkMarkAbsent() {
    setStudents(prev =>
      prev.map(s => selected.has(s.id) ? { ...s, grade: null, honors: false, status: 'absent' } : s),
    )
    setSelected(new Set())
  }

  function handleCsvImport(grades: Record<string, number>) {
    setStudents(prev =>
      prev.map(s => {
        const g = grades[s.id]
        return g !== undefined ? { ...s, grade: g, status: 'proposed' } : s
      }),
    )
  }

  const allProposed = students.every(
    s => s.status === 'proposed' || s.status === 'accepted' || s.status === 'absent',
  )
  const someProposed = students.some(s => s.status === 'proposed')
  const canPublish   = someProposed && !published

  function handlePublish() {
    setShowOtp(true)
  }

  function confirmPublish() {
    setShowOtp(false)
    setPublished(true)
    setStudents(prev =>
      prev.map(s => s.status === 'proposed' ? { ...s, status: 'accepted' } : s),
    )
    setPubToast('Verbale signé et publié — les notes sont définitives.')
    setTimeout(() => setPubToast(null), 4000)
  }

  // Stats
  const passed       = students.filter(s => s.status === 'accepted' && s.grade !== null).length
  const absent       = students.filter(s => s.status === 'absent').length
  const rejected     = students.filter(s => s.status === 'rejected').length
  const enteredCount = students.filter(s => s.grade !== null).length
  const avgGrade     = enteredCount > 0
    ? (students.reduce((sum, s) => sum + (s.grade ?? 0), 0) / enteredCount).toFixed(1)
    : '—'

  return (
    <div className="space-y-6">

      {showOtp && (
        <OtpModal
          onConfirm={confirmPublish}
          onClose={() => setShowOtp(false)}
        />
      )}

      {showCsv && (
        <CsvImportModal
          students={students}
          onImport={handleCsvImport}
          onClose={() => setShowCsv(false)}
        />
      )}

      {/* Session header */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{session.courseName}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              📅 {format(session.date, 'd MMMM yyyy · HH:mm', { locale: fr })} · 📍 {session.room}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {students.length} étudiant{students.length !== 1 ? 's' : ''} inscrit{students.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!published && (
              <button
                onClick={() => setShowCsv(true)}
                className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                📥 Import CSV
              </button>
            )}
            {published ? (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                ✅ Verbale publié
              </span>
            ) : canPublish ? (
              <button
                onClick={handlePublish}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                🔏 Signer & Publier (OTP)
              </button>
            ) : null}
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>✅ {passed} reçu{passed !== 1 ? 's' : ''}</span>
          <span>❌ {rejected} refusé{rejected !== 1 ? 's' : ''}</span>
          <span>🚫 {absent} absent{absent !== 1 ? 's' : ''}</span>
          <span>📊 Moyenne : {avgGrade}</span>
          <span>✏️ {enteredCount}/{students.length} notes saisies</span>
        </div>

        {pubToast && (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            {pubToast}
          </p>
        )}
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <BulkBar
          count={selected.size}
          onApplyGrade={bulkApplyGrade}
          onMarkAbsent={bulkMarkAbsent}
          onClear={() => setSelected(new Set())}
        />
      )}

      {/* Grade table */}
      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Aucune prénotation pour cette session.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="pl-4 pr-2 py-3">
                  {!published && (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={e => toggleAll(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                      title="Tout sélectionner"
                    />
                  )}
                </th>
                <th className="px-4 py-3 text-left">Étudiant</th>
                <th className="px-4 py-3 text-left">Note</th>
                <th className="px-4 py-3 text-left">Remarques</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map(student => (
                <GradeRow
                  key={student.id}
                  student={student}
                  published={published}
                  selected={selected.has(student.id)}
                  onSelect={toggleOne}
                  onUpdate={updateStudent}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Back */}
      <Link
        href={`/teacher/courses/${courseId}`}
        className="inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Retour au cours
      </Link>
    </div>
  )
}

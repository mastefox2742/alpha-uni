'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────
type SessionStatus = 'draft' | 'open' | 'grading' | 'published' | 'closed'
type HubTab = 'sessions' | 'prenotati'

interface ExamSession {
  id:          string
  courseId:    string
  courseName:  string
  courseCode:  string
  date:        Date
  room:        string
  maxSeats:    number
  enrolled:    number
  status:      SessionStatus
  verbaleReady: boolean
}

interface EnrolledStudent {
  id:         string
  firstName:  string
  lastName:   string
  matricola:  string
  year:       number
  confirmedAt: Date
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const SESSIONS: ExamSession[] = [
  {
    id: 'es1',
    courseId: 'c1',
    courseName: 'Algorithmique & Structures de données',
    courseCode: 'INFO301',
    date: new Date('2026-05-10T09:00:00'),
    room: 'Amphi A',
    maxSeats: 60,
    enrolled: 15,
    status: 'grading',
    verbaleReady: true,
  },
  {
    id: 'es2',
    courseId: 'c1',
    courseName: 'Algorithmique & Structures de données',
    courseCode: 'INFO301',
    date: new Date('2026-06-15T09:00:00'),
    room: 'Amphi A',
    maxSeats: 60,
    enrolled: 8,
    status: 'open',
    verbaleReady: false,
  },
  {
    id: 'es3',
    courseId: 'c2',
    courseName: 'Réseaux & Systèmes distribués',
    courseCode: 'INFO401',
    date: new Date('2026-06-03T14:00:00'),
    room: 'Salle B201',
    maxSeats: 40,
    enrolled: 22,
    status: 'open',
    verbaleReady: false,
  },
  {
    id: 'es4',
    courseId: 'c3',
    courseName: 'Bases de données',
    courseCode: 'INFO201',
    date: new Date('2026-06-20T14:00:00'),
    room: 'Salle C302',
    maxSeats: 50,
    enrolled: 8,
    status: 'grading',
    verbaleReady: true,
  },
  {
    id: 'es5',
    courseId: 'c3',
    courseName: 'Bases de données',
    courseCode: 'INFO201',
    date: new Date('2026-05-05T14:00:00'),
    room: 'Salle C302',
    maxSeats: 50,
    enrolled: 8,
    status: 'published',
    verbaleReady: false,
  },
]

const ENROLLED_STUDENTS: Record<string, EnrolledStudent[]> = {
  es1: [
    { id: 's1',  firstName: 'Lucas',   lastName: 'Moreau',   matricola: 'MAT20240034', year: 3, confirmedAt: new Date('2026-04-20T10:14:00') },
    { id: 's2',  firstName: 'Marie',   lastName: 'Dupont',   matricola: 'MAT20240021', year: 3, confirmedAt: new Date('2026-04-20T11:02:00') },
    { id: 's3',  firstName: 'Sophie',  lastName: 'Bernard',  matricola: 'MAT20240015', year: 3, confirmedAt: new Date('2026-04-21T09:30:00') },
    { id: 's4',  firstName: 'Antoine', lastName: 'Laurent',  matricola: 'MAT20240042', year: 3, confirmedAt: new Date('2026-04-21T14:15:00') },
    { id: 's5',  firstName: 'Camille', lastName: 'Petit',    matricola: 'MAT20240058', year: 3, confirmedAt: new Date('2026-04-22T08:45:00') },
    { id: 's6',  firstName: 'Thomas',  lastName: 'Martin',   matricola: 'MAT20240009', year: 3, confirmedAt: new Date('2026-04-22T16:00:00') },
    { id: 's7',  firstName: 'Julie',   lastName: 'Rousseau', matricola: 'MAT20240031', year: 3, confirmedAt: new Date('2026-04-23T10:00:00') },
    { id: 's8',  firstName: 'Nicolas', lastName: 'Leroy',    matricola: 'MAT20240067', year: 3, confirmedAt: new Date('2026-04-23T11:30:00') },
    { id: 's9',  firstName: 'Emma',    lastName: 'Dubois',   matricola: 'MAT20240044', year: 3, confirmedAt: new Date('2026-04-24T09:00:00') },
    { id: 's10', firstName: 'Paul',    lastName: 'Simon',    matricola: 'MAT20240073', year: 3, confirmedAt: new Date('2026-04-24T13:45:00') },
    { id: 's11', firstName: 'Léa',     lastName: 'Fontaine', matricola: 'MAT20240052', year: 3, confirmedAt: new Date('2026-04-25T10:20:00') },
    { id: 's12', firstName: 'Hugo',    lastName: 'Garnier',  matricola: 'MAT20240088', year: 3, confirmedAt: new Date('2026-04-25T15:00:00') },
    { id: 's13', firstName: 'Manon',   lastName: 'Blanc',    matricola: 'MAT20240017', year: 3, confirmedAt: new Date('2026-04-26T09:15:00') },
    { id: 's14', firstName: 'Pierre',  lastName: 'Bonnet',   matricola: 'MAT20240039', year: 3, confirmedAt: new Date('2026-04-26T11:00:00') },
    { id: 's15', firstName: 'Laura',   lastName: 'Girard',   matricola: 'MAT20240025', year: 3, confirmedAt: new Date('2026-04-27T08:30:00') },
  ],
  es2: [
    { id: 'r1', firstName: 'Alexis',  lastName: 'Renaud',  matricola: 'MAT20250011', year: 3, confirmedAt: new Date('2026-05-01T10:00:00') },
    { id: 'r2', firstName: 'Béatrice',lastName: 'Coste',   matricola: 'MAT20250028', year: 3, confirmedAt: new Date('2026-05-02T09:30:00') },
    { id: 'r3', firstName: 'Dylan',   lastName: 'Mercier', matricola: 'MAT20250035', year: 3, confirmedAt: new Date('2026-05-03T14:00:00') },
    { id: 'r4', firstName: 'Émilie',  lastName: 'Brochard',matricola: 'MAT20250042', year: 3, confirmedAt: new Date('2026-05-04T11:00:00') },
    { id: 'r5', firstName: 'Fabien',  lastName: 'Caron',   matricola: 'MAT20250056', year: 3, confirmedAt: new Date('2026-05-05T16:15:00') },
    { id: 'r6', firstName: 'Gaëlle',  lastName: 'Tissot',  matricola: 'MAT20250061', year: 3, confirmedAt: new Date('2026-05-06T08:45:00') },
    { id: 'r7', firstName: 'Henri',   lastName: 'Aubert',  matricola: 'MAT20250078', year: 3, confirmedAt: new Date('2026-05-07T10:30:00') },
    { id: 'r8', firstName: 'Isabelle',lastName: 'Ferrand', matricola: 'MAT20250083', year: 3, confirmedAt: new Date('2026-05-08T13:00:00') },
  ],
  es3: [
    { id: 'n1', firstName: 'Jacques',  lastName: 'Pelletier',matricola: 'MAT20240101', year: 4, confirmedAt: new Date('2026-05-10T09:00:00') },
    { id: 'n2', firstName: 'Karine',   lastName: 'Barbier',  matricola: 'MAT20240112', year: 4, confirmedAt: new Date('2026-05-10T10:30:00') },
    { id: 'n3', firstName: 'Laurent',  lastName: 'Guérin',   matricola: 'MAT20240125', year: 4, confirmedAt: new Date('2026-05-11T09:15:00') },
    { id: 'n4', firstName: 'Mélanie',  lastName: 'Jacobs',   matricola: 'MAT20240138', year: 4, confirmedAt: new Date('2026-05-11T14:00:00') },
    { id: 'n5', firstName: 'Nathan',   lastName: 'Collin',   matricola: 'MAT20240145', year: 4, confirmedAt: new Date('2026-05-12T08:30:00') },
    { id: 'n6', firstName: 'Olivia',   lastName: 'Marchand', matricola: 'MAT20240159', year: 4, confirmedAt: new Date('2026-05-12T11:00:00') },
    { id: 'n7', firstName: 'Patrick',  lastName: 'Lefèvre',  matricola: 'MAT20240162', year: 4, confirmedAt: new Date('2026-05-13T09:45:00') },
    { id: 'n8', firstName: 'Quentin',  lastName: 'Moreau',   matricola: 'MAT20240177', year: 4, confirmedAt: new Date('2026-05-13T15:30:00') },
    { id: 'n9', firstName: 'Rachel',   lastName: 'Noel',     matricola: 'MAT20240183', year: 4, confirmedAt: new Date('2026-05-14T10:00:00') },
    { id: 'n10',firstName: 'Sébastien',lastName: 'Picard',   matricola: 'MAT20240196', year: 4, confirmedAt: new Date('2026-05-14T13:15:00') },
    { id: 'n11',firstName: 'Tiffany',  lastName: 'Royer',    matricola: 'MAT20240201', year: 4, confirmedAt: new Date('2026-05-15T09:00:00') },
    { id: 'n12',firstName: 'Ugo',      lastName: 'Sauvage',  matricola: 'MAT20240215', year: 4, confirmedAt: new Date('2026-05-15T10:45:00') },
    { id: 'n13',firstName: 'Valérie',  lastName: 'Tessier',  matricola: 'MAT20240228', year: 4, confirmedAt: new Date('2026-05-16T08:15:00') },
    { id: 'n14',firstName: 'William',  lastName: 'Verne',    matricola: 'MAT20240234', year: 4, confirmedAt: new Date('2026-05-16T14:30:00') },
    { id: 'n15',firstName: 'Xavier',   lastName: 'Wolf',     matricola: 'MAT20240247', year: 4, confirmedAt: new Date('2026-05-17T09:30:00') },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusInfo(s: SessionStatus): { label: string; cls: string } {
  const map: Record<SessionStatus, { label: string; cls: string }> = {
    draft:     { label: 'Brouillon',     cls: 'bg-muted text-muted-foreground' },
    open:      { label: 'Ouvert',        cls: 'bg-blue-100 text-blue-700' },
    grading:   { label: 'Notation',      cls: 'bg-amber-100 text-amber-700' },
    published: { label: 'Publié',        cls: 'bg-emerald-100 text-emerald-700' },
    closed:    { label: 'Archivé',       cls: 'bg-slate-100 text-slate-500' },
  }
  return map[s]
}

// ─── Prenotati Modal ──────────────────────────────────────────────────────────
function PrenotatiModal({
  session,
  students,
  onClose,
}: {
  session:  ExamSession
  students: EnrolledStudent[]
  onClose:  () => void
}) {
  const [exportToast, setExportToast] = useState<string | null>(null)

  function simulateExport(type: 'csv' | 'pdf') {
    setExportToast(`Export ${type.toUpperCase()} en cours…`)
    setTimeout(() => {
      setExportToast(`✅ ${type.toUpperCase()} téléchargé (simulation)`)
      setTimeout(() => setExportToast(null), 2500)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-card shadow-xl" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold">Liste des prénotés</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {session.courseName} · {format(session.date, 'd MMM yyyy', { locale: fr })} · {session.room}
              </p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {students.length} prénoté{students.length !== 1 ? 's' : ''} / {session.maxSeats} places
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => simulateExport('csv')}
                className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-muted"
              >
                📊 Export CSV
              </button>
              <button
                onClick={() => simulateExport('pdf')}
                className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-muted"
              >
                📄 Export PDF
              </button>
            </div>
          </div>
          {exportToast && (
            <p className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">{exportToast}</p>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur">
              <tr className="border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Étudiant</th>
                <th className="px-4 py-3 text-left">Matricule</th>
                <th className="px-4 py-3 text-left">Année</th>
                <th className="px-4 py-3 text-left">Confirmé le</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s, i) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{s.matricola}</td>
                  <td className="px-4 py-2.5">L{s.year}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {format(s.confirmedAt, 'd MMM · HH:mm', { locale: fr })}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Aucun étudiant prénoté pour cette session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Session Card ─────────────────────────────────────────────────────────────
function SessionCard({
  session,
  onViewPrenotati,
}: {
  session:         ExamSession
  onViewPrenotati: (s: ExamSession) => void
}) {
  const { label, cls } = statusInfo(session.status)
  const isPast = session.date < new Date('2026-05-26')
  const fillPct = Math.min(100, Math.round((session.enrolled / session.maxSeats) * 100))

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {session.courseCode}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
            {session.verbaleReady && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                ✏️ Notes à saisir
              </span>
            )}
          </div>
          <p className="mt-1.5 font-medium truncate">{session.courseName}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            📅 {format(session.date, 'EEEE d MMMM yyyy · HH:mm', { locale: fr })}
          </p>
          <p className="text-sm text-muted-foreground">📍 {session.room}</p>
        </div>
      </div>

      {/* Enrollment bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{session.enrolled} / {session.maxSeats} prénotés</span>
          <span>{fillPct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${fillPct > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => onViewPrenotati(session)}
          className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          👥 Voir prénotés ({session.enrolled})
        </button>
        {session.verbaleReady && (
          <Link
            href={`/teacher/courses/${session.courseId}/verbale/${session.id}`}
            className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
          >
            ✏️ Saisir les notes
          </Link>
        )}
        {session.status === 'published' && (
          <Link
            href={`/teacher/courses/${session.courseId}/verbale/${session.id}`}
            className="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
          >
            📋 Voir verbale
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── New Session Form ─────────────────────────────────────────────────────────
function NewSessionForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    course: 'c1',
    date: '',
    time: '09:00',
    room: '',
    maxSeats: '40',
  })
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(onDone, 1500)
  }

  if (saved) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
        <p className="text-2xl">✅</p>
        <p className="mt-2 font-medium text-emerald-700 dark:text-emerald-300">Session créée avec succès !</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <h3 className="font-semibold">Nouvelle session d'examen</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Cours</label>
          <select
            value={form.course}
            onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="c1">INFO301 — Algorithmique</option>
            <option value="c2">INFO401 — Réseaux</option>
            <option value="c3">INFO201 — Bases de données</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Salle</label>
          <input
            type="text"
            placeholder="ex. Amphi A"
            value={form.room}
            onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
            required
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Heure</label>
          <input
            type="time"
            value={form.time}
            onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
            required
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Places max</label>
          <input
            type="number"
            min="1"
            max="500"
            value={form.maxSeats}
            onChange={e => setForm(f => ({ ...f, maxSeats: e.target.value }))}
            required
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Créer la session
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function TeacherExamsHub() {
  const [filter,        setFilter]     = useState<SessionStatus | 'all'>('all')
  const [showNewForm,   setShowNewForm] = useState(false)
  const [prenotatiFor,  setPrenotatiFor]= useState<ExamSession | null>(null)

  const filtered = filter === 'all'
    ? SESSIONS
    : SESSIONS.filter(s => s.status === filter)

  // KPIs
  const totalEnrolled   = SESSIONS.reduce((sum, s) => sum + s.enrolled, 0)
  const gradingCount    = SESSIONS.filter(s => s.status === 'grading').length
  const publishedCount  = SESSIONS.filter(s => s.status === 'published').length
  const upcomingCount   = SESSIONS.filter(s => s.status === 'open').length

  const STATUS_FILTERS: Array<{ value: SessionStatus | 'all'; label: string }> = [
    { value: 'all',       label: 'Toutes' },
    { value: 'open',      label: 'Ouvertes' },
    { value: 'grading',   label: 'Notation' },
    { value: 'published', label: 'Publiées' },
    { value: 'draft',     label: 'Brouillons' },
    { value: 'closed',    label: 'Archivées' },
  ]

  return (
    <div className="space-y-6">

      {prenotatiFor && (
        <PrenotatiModal
          session={prenotatiFor}
          students={ENROLLED_STUDENTS[prenotatiFor.id] ?? []}
          onClose={() => setPrenotatiFor(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hub des Examens</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez vos sessions, consultez les prénotés et saisissez les verbales.
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(v => !v)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nouvelle session
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Sessions ouvertes',  value: upcomingCount,  color: 'text-blue-600'    },
          { label: 'En notation',         value: gradingCount,   color: 'text-amber-600'   },
          { label: 'Verbales publiés',    value: publishedCount, color: 'text-emerald-600' },
          { label: 'Étudiants prénotés',  value: totalEnrolled,  color: 'text-indigo-600'  },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* New session form */}
      {showNewForm && (
        <NewSessionForm onDone={() => setShowNewForm(false)} />
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? 'bg-indigo-600 text-white'
                : 'border hover:bg-muted text-muted-foreground'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1 opacity-70">
                ({SESSIONS.filter(s => s.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sessions grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          Aucune session dans cette catégorie.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onViewPrenotati={setPrenotatiFor}
            />
          ))}
        </div>
      )}
    </div>
  )
}

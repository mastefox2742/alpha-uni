'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── Types ────────────────────────────────────────────────────────────────────
type VerbaleState = 'incomplete' | 'ready' | 'published'
type ActivityKind = 'accepted' | 'rejected' | 'booked' | 'withdrawal'

interface ScheduleSlot {
  courseId:  string
  name:      string
  code:      string
  startTime: string
  endTime:   string
  room:      string
  building:  string
  students:  number
}

interface ExamSession {
  id:          string
  courseName:  string
  courseCode:  string
  date:        Date
  deadline:    Date
  room:        string
  enrolled:    number
  maxStudents: number
}

interface Verbale {
  id:         string
  courseName: string
  courseCode: string
  examDate:   Date
  total:      number
  entered:    number
  status:     VerbaleState
}

interface Activity {
  id:          string
  studentName: string
  kind:        ActivityKind
  courseName:  string
  detail:      string
  at:          Date
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const NOW_DATE = new Date('2026-05-26T10:00:00')

const SCHEDULE: ScheduleSlot[] = [
  {
    courseId: 'c1',
    name: 'Algorithmique & Structures de données',
    code: 'INFO301',
    startTime: '09:00',
    endTime: '11:00',
    room: 'Salle B104',
    building: 'Bât. Sciences',
    students: 45,
  },
  {
    courseId: 'c3',
    name: 'Bases de données',
    code: 'INFO201',
    startTime: '14:00',
    endTime: '16:00',
    room: 'Salle A201',
    building: 'Bât. Principal',
    students: 52,
  },
]

const UPCOMING_SESSIONS: ExamSession[] = [
  {
    id: 's1',
    courseName: 'Algorithmique & Structures de données',
    courseCode: 'INFO301',
    date: new Date('2026-06-15T09:00:00'),
    deadline: new Date('2026-05-28T23:59:00'),  // 2 days → amber
    room: 'Amphi A',
    enrolled: 12,
    maxStudents: 40,
  },
  {
    id: 's2',
    courseName: 'Bases de données',
    courseCode: 'INFO201',
    date: new Date('2026-06-20T14:00:00'),
    deadline: new Date('2026-06-13T23:59:00'),  // 18 days → green
    room: 'Salle C302',
    enrolled: 8,
    maxStudents: 30,
  },
  {
    id: 's3',
    courseName: 'Génie logiciel',
    courseCode: 'INFO401',
    date: new Date('2026-07-02T09:00:00'),
    deadline: new Date('2026-06-25T23:59:00'),  // 30 days → green
    room: 'Amphi B',
    enrolled: 5,
    maxStudents: 35,
  },
]

const VERBALES: Verbale[] = [
  {
    id: 'v1',
    courseName: 'Algorithmique & Structures de données',
    courseCode: 'INFO301',
    examDate: new Date('2026-05-10T09:00:00'),
    total: 15,
    entered: 12,
    status: 'incomplete',
  },
  {
    id: 'v2',
    courseName: 'Bases de données',
    courseCode: 'INFO201',
    examDate: new Date('2026-05-05T14:00:00'),
    total: 8,
    entered: 8,
    status: 'ready',
  },
]

const ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    studentName: 'Marie Dupont',
    kind: 'accepted',
    courseName: 'Algorithmique',
    detail: 'Note 28/30 acceptée',
    at: new Date('2026-05-26T08:10:00'),
  },
  {
    id: 'a2',
    studentName: 'Thomas Martin',
    kind: 'rejected',
    courseName: 'Bases de données',
    detail: 'Note 21/30 refusée',
    at: new Date('2026-05-26T05:00:00'),
  },
  {
    id: 'a3',
    studentName: 'Sophie Bernard',
    kind: 'booked',
    courseName: 'Algorithmique',
    detail: 'Prénotation – session 15 juin',
    at: new Date('2026-05-25T14:30:00'),
  },
  {
    id: 'a4',
    studentName: 'Lucas Moreau',
    kind: 'accepted',
    courseName: 'Algorithmique',
    detail: 'Note 30L acceptée',
    at: new Date('2026-05-25T11:00:00'),
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function greeting(h: number): string {
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function isSlotActive(slot: ScheduleSlot, now: Date): boolean {
  const [sh = 0, sm = 0] = slot.startTime.split(':').map(Number)
  const [eh = 0, em = 0] = slot.endTime.split(':').map(Number)
  const nowM   = now.getHours() * 60 + now.getMinutes()
  const startM = sh * 60 + sm
  const endM   = eh * 60 + em
  return nowM >= startM && nowM < endM
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - NOW_DATE.getTime()) / 86_400_000)
}

function DeadlinePill({ d }: { d: number }) {
  if (d < 0)  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Fermé</span>
  if (d === 0) return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Aujourd'hui</span>
  if (d <= 3)  return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">J−{d}</span>
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">J−{d}</span>
}

const KIND_CFG: Record<ActivityKind, { icon: string; cls: string }> = {
  accepted:   { icon: '✅', cls: 'bg-green-100 text-green-700' },
  rejected:   { icon: '❌', cls: 'bg-red-100 text-red-700' },
  booked:     { icon: '📋', cls: 'bg-blue-100 text-blue-700' },
  withdrawal: { icon: '↩️', cls: 'bg-orange-100 text-orange-700' },
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-28 rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-52 rounded-xl bg-muted" />
          <div className="h-56 rounded-xl bg-muted" />
        </div>
        <div className="space-y-5">
          <div className="h-52 rounded-xl bg-muted" />
          <div className="h-44 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )
}

// ─── Welcome Header ───────────────────────────────────────────────────────────
function WelcomeHeader({ now }: { now: Date }) {
  const dayStr  = format(now, 'EEEE d MMMM yyyy', { locale: fr })
  const timeStr = format(now, 'HH:mm')
  const pending = VERBALES.filter(v => v.status !== 'published').length

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white shadow-lg">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium capitalize text-indigo-200">{dayStr}</p>
          <h1 className="mt-1 text-2xl font-bold">
            {greeting(now.getHours())}, Dr. Ferrari 👋
          </h1>
          <p className="mt-1 text-sm text-indigo-200">Département d'Informatique</p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-4xl font-bold tabular-nums">{timeStr}</p>
          <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
              📚 3 cours actifs
            </span>
            {pending > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                ⚠️ {pending} verbale{pending > 1 ? 's' : ''} en attente
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  icon,
  label,
  value,
  sub,
  variant = 'default',
  href,
}: {
  icon:     string
  label:    string
  value:    number | string
  sub?:     string | undefined
  variant?: 'default' | 'warning' | 'danger' | 'success' | undefined
  href?:    string | undefined
}) {
  const ringCls = {
    default: 'bg-card border shadow-sm',
    warning: 'border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800 dark:bg-amber-950/30',
    danger:  'border-red-200 bg-red-50 shadow-sm dark:border-red-800 dark:bg-red-950/30',
    success: 'border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30',
  }
  const valCls = {
    default: 'text-foreground',
    warning: 'text-amber-700 dark:text-amber-400',
    danger:  'text-red-700 dark:text-red-400',
    success: 'text-emerald-700 dark:text-emerald-400',
  }

  const inner = (
    <div className={`rounded-xl border p-5 ${ringCls[variant]}`}>
      <p className="text-2xl">{icon}</p>
      <p className={`mt-3 text-3xl font-bold ${valCls[variant]}`}>{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block transition-transform hover:-translate-y-0.5">
        {inner}
      </Link>
    )
  }
  return inner
}

// ─── Cours du jour ────────────────────────────────────────────────────────────
function CourseDuJourWidget({ now }: { now: Date }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Cours du jour —{' '}
        <span className="capitalize">{format(now, 'EEEE d MMMM', { locale: fr })}</span>
      </h2>

      {SCHEDULE.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun cours programmé aujourd'hui.</p>
      ) : (
        <div className="space-y-3">
          {SCHEDULE.map(slot => {
            const active = isSlotActive(slot, now)
            return (
              <Link
                key={slot.courseId}
                href={`/teacher/courses/${slot.courseId}`}
                className={[
                  'group flex items-start gap-4 rounded-xl border p-4 transition-all',
                  'hover:border-indigo-300 hover:shadow-sm dark:hover:border-indigo-700',
                  active
                    ? 'border-indigo-200 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-950/20'
                    : 'bg-card',
                ].join(' ')}
              >
                {/* Time pillar */}
                <div className="w-14 shrink-0 text-center">
                  <p className="text-sm font-bold tabular-nums">{slot.startTime}</p>
                  <div className="mx-auto my-1 h-5 w-px bg-border" />
                  <p className="text-xs tabular-nums text-muted-foreground">{slot.endTime}</p>
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                      {slot.name}
                    </p>
                    {active && (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                        En cours
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {slot.code} · {slot.room} · {slot.building}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    👥 {slot.students} étudiants
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Prochaines sessions ──────────────────────────────────────────────────────
function SessionsWidget() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Prochaines sessions d'examen
        </h2>
        <Link
          href="/teacher/courses"
          className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Gérer les cours →
        </Link>
      </div>

      <div className="space-y-3">
        {UPCOMING_SESSIONS.map(s => {
          const pct = Math.round((s.enrolled / s.maxStudents) * 100)
          return (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-lg bg-muted/40 p-3"
            >
              {/* Date block */}
              <div className="flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {format(s.date, 'd MMM', { locale: fr })}
                </p>
                <p className="text-[10px] text-indigo-500 dark:text-indigo-400">
                  {format(s.date, 'HH:mm')}
                </p>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.courseName}</p>
                <p className="text-xs text-muted-foreground">
                  {s.room} · {s.enrolled}/{s.maxStudents} inscrits ({pct}%)
                </p>
              </div>

              {/* Deadline pill — shows time until registration closes */}
              <div className="shrink-0">
                <DeadlinePill d={daysUntil(s.deadline)} />
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        * Délai affiché : clôture des inscriptions étudiantes
      </p>
    </div>
  )
}

// ─── Verbales en attente ──────────────────────────────────────────────────────
function VerbalesWidget() {
  const pendingCount = VERBALES.filter(v => v.status !== 'published').length

  const statusCfg = {
    incomplete: { label: 'Incomplet',       cls: 'bg-amber-100 text-amber-700' },
    ready:      { label: 'Prêt à publier',  cls: 'bg-emerald-100 text-emerald-700' },
    published:  { label: 'Publié',          cls: 'bg-blue-100 text-blue-700' },
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Verbales en attente
        </h2>
        {pendingCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            {pendingCount}
          </span>
        )}
      </div>

      {VERBALES.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun verbale en attente. ✅</p>
      ) : (
        <div className="space-y-3">
          {VERBALES.map(v => {
            const pct = Math.round((v.entered / v.total) * 100)
            const cfg = statusCfg[v.status]

            return (
              <div key={v.id} className="rounded-lg border p-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{v.courseName}</p>
                    <p className="text-xs text-muted-foreground">
                      Session du {format(v.examDate, 'd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{v.entered}/{v.total} notes saisies</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* CTA */}
                {v.status !== 'published' && (
                  <div className="mt-2.5">
                    <Link
                      href="/teacher/courses"
                      className={[
                        'inline-block rounded-md px-3 py-1 text-xs font-medium transition-colors',
                        v.status === 'ready'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90',
                      ].join(' ')}
                    >
                      {v.status === 'ready' ? '✅ Publier le verbale' : '📝 Saisir les notes'}
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Activité récente ─────────────────────────────────────────────────────────
function ActivityWidget() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Activité récente
      </h2>

      <div className="space-y-3">
        {ACTIVITIES.map(a => {
          const cfg  = KIND_CFG[a.kind]
          const dist = formatDistanceToNow(a.at, { locale: fr, addSuffix: true })
          return (
            <div key={a.id} className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${cfg.cls}`}>
                {cfg.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{a.studentName}</span>
                  <span className="text-muted-foreground"> · {a.detail}</span>
                </p>
                <p className="text-xs text-muted-foreground">{a.courseName} · {dist}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function TeacherDashboard() {
  const [now,   setNow]   = useState<Date>(NOW_DATE)
  const [ready, setReady] = useState(false)

  // Skeleton delay
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 800)
    return () => clearTimeout(id)
  }, [])

  // Real-time clock (updates every 30 s once skeleton is gone)
  useEffect(() => {
    if (!ready) return
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [ready])

  if (!ready) return <DashboardSkeleton />

  const notesToEnter = VERBALES
    .filter(v => v.status === 'incomplete')
    .reduce((s, v) => s + (v.total - v.entered), 0)

  const toPublish = VERBALES.filter(v => v.status === 'ready').length

  return (
    <div className="space-y-6">

      {/* ── Welcome header ── */}
      <WelcomeHeader now={now} />

      {/* ── KPI row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon="📚"
          label="Cours actifs"
          value={3}
          sub="A.A. 2025/2026"
          href="/teacher/courses"
        />
        <KpiCard
          icon="👨‍🎓"
          label="Étudiants inscrits"
          value={135}
          sub="3 cours confondus"
          href="/teacher/courses"
        />
        <KpiCard
          icon="📝"
          label="Notes à saisir"
          value={notesToEnter}
          sub={notesToEnter > 0 ? 'Sur 1 session' : 'À jour ✓'}
          variant={notesToEnter > 0 ? 'warning' : 'success'}
          href="/teacher/courses"
        />
        <KpiCard
          icon="🗓️"
          label="Sessions à venir"
          value={UPCOMING_SESSIONS.length}
          sub="Dans les 6 semaines"
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left — teaching content */}
        <div className="space-y-6 lg:col-span-2">
          <CourseDuJourWidget now={now} />
          <SessionsWidget />
        </div>

        {/* Right — tasks & activity */}
        <div className="space-y-5">
          <VerbalesWidget />
          <ActivityWidget />
        </div>
      </div>

      {toPublish > 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            ✅ Vous avez <strong>{toPublish}</strong> verbale{toPublish > 1 ? 's' : ''} prêt{toPublish > 1 ? 's' : ''} à publier — toutes les notes sont saisies.
          </p>
          <Link
            href="/teacher/courses"
            className="mt-1 inline-block text-sm text-emerald-600 underline hover:text-emerald-700 dark:text-emerald-400"
          >
            Publier maintenant →
          </Link>
        </div>
      )}
    </div>
  )
}

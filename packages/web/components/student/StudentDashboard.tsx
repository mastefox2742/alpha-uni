'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Constantes démo ──────────────────────────────────────────────────────────
const NOW_DATE  = new Date('2026-05-26T10:00:00')   // "aujourd'hui" en démo
const STUDENT   = {
  firstName:     'Demo',
  fullName:      'Demo Étudiant',
  matricola:     'M-2024-001',
  degree:        'Sciences de l\'Informatique',
  degreeCode:    'L-31',
  year:          2,
  semester:      2,
  semesterWeek:  12,
}

// ── Données libretto ──────────────────────────────────────────────────────────
const LIBRETTO  = { cfuEarned: 39, cfuTotal: 180, weightedMean: 28.08, laureaEst: 102.9 }

// ── Cours du jour (mardi 26 mai) ──────────────────────────────────────────────
type CourseMode = 'presential' | 'online' | 'recorded'
interface DaySlot {
  id:        string
  startTime: string
  endTime:   string
  course:    string
  code:      string
  teacher:   string
  room:      string | null
  mode:      CourseMode
  link:      string | null
  color:     string
}

const TODAY_SLOTS: DaySlot[] = [
  {
    id: 'c1', startTime: '08:30', endTime: '10:30',
    course: 'Analyse Mathématique II', code: 'MAT201',
    teacher: 'Prof. Rossi Marco',
    room: 'Salle B201 — Bât. Sciences',
    mode: 'presential', link: null,
    color: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
  },
  {
    id: 'c2', startTime: '11:00', endTime: '13:00',
    course: 'Réseaux Informatiques', code: 'INF302',
    teacher: 'Prof. Conti Paolo',
    room: null,
    mode: 'online', link: 'https://meet.unigest.fr/conti-inf302',
    color: 'border-l-violet-500 bg-violet-50 dark:bg-violet-950/20',
  },
  {
    id: 'c3', startTime: '14:30', endTime: '16:30',
    course: 'Bases de données (TD)', code: 'INF301',
    teacher: 'Prof. Ferrari Anna',
    room: 'Salle D102 — Bât. Informatique',
    mode: 'presential', link: null,
    color: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
  },
]

// ── Prochaines échéances (toutes sources confondues) ──────────────────────────
type DeadlineType = 'exam_reg' | 'payment' | 'project' | 'exam'
interface Deadline {
  id:       string
  type:     DeadlineType
  label:    string
  detail:   string
  daysLeft: number
  href:     string
}

const DEADLINES: Deadline[] = [
  {
    id: 'd1', type: 'exam_reg',
    label: 'Fermeture — Analyse Mathématique II',
    detail: 'Inscriptions examen (session juin)',
    daysLeft: 2,
    href: '/student/exams',
  },
  {
    id: 'd2', type: 'payment',
    label: '2ème tranche 2025/2026 — 450 €',
    detail: 'Date limite de paiement des frais',
    daysLeft: 5,
    href: '/student/fees',
  },
  {
    id: 'd3', type: 'exam_reg',
    label: 'Fermeture — Réseaux Informatiques',
    detail: 'Inscriptions examen (session juin)',
    daysLeft: 6,
    href: '/student/exams',
  },
  {
    id: 'd4', type: 'project',
    label: 'Rendu projet — Programmation Avancée',
    detail: 'Dépôt du projet final sur la plateforme',
    daysLeft: 14,
    href: '/student/courses',
  },
  {
    id: 'd5', type: 'exam',
    label: 'Examen — Analyse Mathématique II',
    detail: 'Session de juin · 09:00 Salle B201',
    daysLeft: 20,
    href: '/student/exams',
  },
]

// ── Annonces ──────────────────────────────────────────────────────────────────
interface Announcement {
  id:     string
  from:   string
  role:   'teacher' | 'admin'
  msg:    string
  ago:    string
  urgent: boolean
  href:   string
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1', from: 'Prof. Conti Paolo', role: 'teacher',
    msg: 'Le cours de Réseaux de demain se déroulera en visioconférence uniquement. Lien disponible sur l\'espace cours.',
    ago: 'il y a 2 h', urgent: true,
    href: '/student/courses',
  },
  {
    id: 'a2', from: 'Secrétariat', role: 'admin',
    msg: 'Rappel : la session de juin ouvre les inscriptions aux examens le 25 mai. Vérifiez vos appels disponibles.',
    ago: 'il y a 1 j', urgent: false,
    href: '/student/exams',
  },
  {
    id: 'a3', from: 'Prof. Ferrari Anna', role: 'teacher',
    msg: 'La correction du TP3 est désormais disponible dans l\'espace cours INF301. Bonne révision.',
    ago: 'il y a 3 j', urgent: false,
    href: '/student/courses',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function greeting(h: number) {
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function deadlineConfig(type: DeadlineType, days: number) {
  const icons: Record<DeadlineType, string> = {
    exam_reg: '📅',
    payment:  '💰',
    project:  '📋',
    exam:     '📝',
  }
  const icon = icons[type]
  const urgency =
    days <= 2  ? { cls: 'border-red-200 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400',     pill: 'bg-red-100 text-red-800 border-red-200'           } :
    days <= 7  ? { cls: 'border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400', pill: 'bg-amber-100 text-amber-800 border-amber-200' } :
                 { cls: 'border-border bg-muted/20 text-foreground',                                           pill: 'bg-muted text-muted-foreground border-border'      }
  return { icon, ...urgency }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pb-8">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>
      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Jauge circulaire CFU ─────────────────────────────────────────────────────
function CfuGauge({ earned, total }: { earned: number; total: number }) {
  const r    = 46
  const circ = 2 * Math.PI * r
  const pct  = Math.min(1, earned / total)
  const dash = pct * circ

  return (
    <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0">
      {/* Track */}
      <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      {/* Progress */}
      <circle
        cx="60" cy="60" r={r} fill="none"
        stroke="hsl(var(--primary))" strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 60 60)"
      />
      {/* Labels */}
      <text x="60" y="54" textAnchor="middle" fontSize="18" fontWeight="700" fill="currentColor">{earned}</text>
      <text x="60" y="68" textAnchor="middle" fontSize="10" fill="#6b7280">/ {total} CFU</text>
      <text x="60" y="82" textAnchor="middle" fontSize="9" fill="#6b7280">{Math.round(pct * 100)}%</text>
    </svg>
  )
}

// ─── Widget : Cours du jour ───────────────────────────────────────────────────
function CourseDuJourWidget({ slots }: { slots: DaySlot[] }) {
  const [now, setNow] = useState(NOW_DATE)
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  // Déterminer le cours en cours
  const currentSlot = slots.find((s) => {
    const [startH = 0, startM = 0] = s.startTime.split(':').map(Number)
    const [endH   = 0, endM   = 0] = s.endTime.split(':').map(Number)
    const nowM = now.getHours() * 60 + now.getMinutes()
    return nowM >= startH * 60 + startM && nowM < endH * 60 + endM
  })

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* En-tête widget */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-base">🏫</span>
          <h2 className="font-semibold text-sm">Cours du jour</h2>
        </div>
        <Link
          href="/student/schedule"
          className="text-[11px] text-primary hover:underline underline-offset-2"
        >
          Emploi du temps complet →
        </Link>
      </div>

      {slots.length === 0 ? (
        <div className="px-5 py-10 text-center space-y-2">
          <p className="text-3xl">🌿</p>
          <p className="font-medium text-sm">Aucun cours aujourd'hui</p>
          <p className="text-[12px] text-muted-foreground">Profitez-en pour avancer sur vos projets ou réviser vos examens à venir.</p>
          <Link href="/student/libretto" className="inline-block mt-2 text-[12px] text-primary hover:underline">
            Voir votre libretto →
          </Link>
        </div>
      ) : (
        <div className="divide-y">
          {slots.map((slot) => {
            const isCurrent = slot.id === currentSlot?.id
            return (
              <div
                key={slot.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors border-l-4 ${slot.color} ${isCurrent ? 'ring-1 ring-inset ring-primary/20' : ''}`}
              >
                {/* Horaire */}
                <div className="shrink-0 text-center min-w-[52px]">
                  <p className="text-[11px] font-bold tabular-nums">{slot.startTime}</p>
                  <div className="my-0.5 h-px w-4 bg-border mx-auto" />
                  <p className="text-[10px] text-muted-foreground tabular-nums">{slot.endTime}</p>
                  {isCurrent && (
                    <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm leading-tight">{slot.course}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        👤 {slot.teacher}
                        {slot.room && <> · 📍 {slot.room}</>}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="shrink-0 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                        En cours
                      </span>
                    )}
                  </div>
                  {slot.mode === 'online' && slot.link && (
                    <a
                      href={slot.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-violet-700 transition-colors"
                    >
                      🎥 Rejoindre le cours en ligne
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Widget : Prochaines échéances ────────────────────────────────────────────
function EcheancesWidget({ deadlines }: { deadlines: Deadline[] }) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-base">⏰</span>
          <h2 className="font-semibold text-sm">Prochaines échéances</h2>
        </div>
        <span className="text-[11px] text-muted-foreground">{deadlines.length} à venir</span>
      </div>

      <div className="divide-y">
        {deadlines.map((dl) => {
          const cfg = deadlineConfig(dl.type, dl.daysLeft)
          return (
            <Link
              key={dl.id}
              href={dl.href}
              className={`flex items-center gap-3 px-5 py-3.5 border-l-4 hover:brightness-95 transition-all group ${cfg.cls}`}
            >
              <span className="text-lg shrink-0">{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold leading-tight truncate group-hover:text-primary transition-colors">
                  {dl.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{dl.detail}</p>
              </div>
              <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${cfg.pill}`}>
                {dl.daysLeft <= 1 ? 'Demain !' : `J−${dl.daysLeft}`}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Widget : Libretto Flash ──────────────────────────────────────────────────
function LibrettoFlashWidget() {
  const { cfuEarned, cfuTotal, weightedMean, laureaEst } = LIBRETTO

  return (
    <Link href="/student/libretto" className="block group">
      <div className="rounded-2xl border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <h2 className="font-semibold text-sm">Libretto</h2>
          </div>
          <span className="text-[11px] text-primary group-hover:underline underline-offset-2">Voir tout →</span>
        </div>

        <div className="p-5 flex items-center gap-4">
          {/* Jauge circulaire */}
          <CfuGauge earned={cfuEarned} total={cfuTotal} />

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Moyenne pondérée</p>
              <p className="text-2xl font-black text-primary tabular-nums leading-tight">
                {weightedMean.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ 30</span>
              </p>
            </div>
            <div className="h-px bg-border" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Estimation Laurea</p>
              <p className="text-xl font-bold text-primary/80 tabular-nums leading-tight">
                {laureaEst.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ 110</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Widget : Annonces ────────────────────────────────────────────────────────
function AnnoncesWidget({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-base">📢</span>
          <h2 className="font-semibold text-sm">Dernières annonces</h2>
        </div>
        {announcements.some((a) => a.urgent) && (
          <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
        )}
      </div>

      <div className="divide-y">
        {announcements.map((ann) => (
          <Link
            key={ann.id}
            href={ann.href}
            className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
          >
            <div className={`mt-1 shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              ann.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {ann.role === 'admin' ? '🏛' : '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-[11px] font-semibold leading-none">{ann.from}</p>
                {ann.urgent && <span className="rounded-full bg-orange-100 text-orange-700 px-1.5 py-0.5 text-[9px] font-bold">Urgent</span>}
                <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{ann.ago}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 group-hover:text-foreground transition-colors">
                {ann.msg}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="px-5 py-2.5 border-t bg-muted/10 text-center">
        <Link href="/student/courses" className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
          Voir toutes les annonces →
        </Link>
      </div>
    </div>
  )
}

// ─── Header de bienvenue ──────────────────────────────────────────────────────
function WelcomeHeader() {
  const [time, setTime] = useState(NOW_DATE)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const hour    = time.getHours()
  const hello   = greeting(hour)
  const dayStr  = time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-background shadow-sm overflow-hidden">
      <div className="px-6 py-5 flex flex-wrap items-start justify-between gap-4">
        {/* Gauche */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            {hello}, {STUDENT.firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Prêt pour vos cours d'aujourd'hui ?
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-primary/10 text-primary px-3 py-1 text-[11px] font-semibold">
              🎓 {STUDENT.degreeCode} — {STUDENT.degree}
            </span>
            <span className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
              {STUDENT.year}ème année
            </span>
            <span className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
              Sem. {STUDENT.semester} · Semaine {STUDENT.semesterWeek}
            </span>
          </div>
        </div>

        {/* Droite : horloge */}
        <div className="rounded-xl border bg-background/80 px-5 py-3 text-center shadow-sm shrink-0">
          <p className="text-3xl font-black tabular-nums tracking-tight text-primary">{timeStr}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">{dayStr}</p>
        </div>
      </div>

      {/* Barre de progression CFU intégrée */}
      <div className="px-6 pb-5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
          <span>Progression du cursus</span>
          <span className="font-semibold tabular-nums">{LIBRETTO.cfuEarned} / {LIBRETTO.cfuTotal} CFU</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.round((LIBRETTO.cfuEarned / LIBRETTO.cfuTotal) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function StudentDashboard() {
  const [loading, setLoading] = useState(true)

  // Simuler le chargement des données (skeleton 800ms)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  // Filtrer les échéances urgentes (≤2j) pour zero-noise
  const urgentDeadlines = useMemo(() => DEADLINES.filter((d) => d.daysLeft <= 2), [])
  const hasFinancialAlert = urgentDeadlines.some((d) => d.type === 'payment')

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header de bienvenue ──────────────────────────────────────────── */}
      <WelcomeHeader />

      {/* ── Alerte urgente (frais en retard) — zéro bruit sinon ──────────── */}
      {hasFinancialAlert && (
        <Link href="/student/fees" className="block">
          <div className="flex items-center gap-3 rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/20 px-5 py-3.5 hover:brightness-95 transition-all">
            <span className="text-xl animate-pulse">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800 dark:text-red-400">Paiement urgent à régler</p>
              <p className="text-[12px] text-red-600 dark:text-red-500">Vous avez une échéance de frais dans moins de 48 h. Cliquez pour régler.</p>
            </div>
            <span className="text-red-600 text-sm font-bold shrink-0">→</span>
          </div>
        </Link>
      )}

      {/* ── Layout 2+1 colonnes ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Zone centrale (2/3) ─────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          <CourseDuJourWidget slots={TODAY_SLOTS} />
          <EcheancesWidget deadlines={DEADLINES} />
        </div>

        {/* ── Zone latérale (1/3) ─────────────────────────────────────── */}
        <div className="space-y-6">
          <LibrettoFlashWidget />
          <AnnoncesWidget announcements={ANNOUNCEMENTS} />
        </div>
      </div>
    </div>
  )
}

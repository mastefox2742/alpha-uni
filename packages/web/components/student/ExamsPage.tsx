'use client'

import { useState, useMemo } from 'react'
import { format, differenceInDays, differenceInHours, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ────────────────────────────────────────────────────────────────────
type ExamType   = 'Écrit' | 'Oral' | 'Projet'
type ExamStatus = 'available' | 'booked' | 'pending_grade' | 'accepted' | 'rejected'

interface DemoExam {
  id:                   string
  courseName:           string
  courseCode:           string
  cfu:                  number
  teacher:              string
  examDate:             Date
  examType:             ExamType
  room:                 string | null   // null = en ligne
  onlineLink:           string | null
  registrationDeadline: Date
  maxStudents:          number
  enrolledCount:        number
  status:               ExamStatus
  // Tab 2
  bookingNumber?:       number | undefined
  bookedAt?:            Date   | undefined
  // Tab 3
  proposedGrade?:       string | undefined   // '30L', '28', …
  gradeDeadline?:       Date   | undefined   // 14 jours depuis la proposition
  teacherNote?:         string | undefined
  examPassedDate?:      Date   | undefined
}

// ─── Données démo ─────────────────────────────────────────────────────────────
// Today = 2026-05-26
const NOW = new Date('2026-05-26T10:00:00')

function d(s: string) { return new Date(s) }

const INITIAL_EXAMS: DemoExam[] = [
  // ── Tab 1 : Disponibles ──────────────────────────────────────────────────
  {
    id: 'a1',
    courseName: 'Analyse Mathématique II',
    courseCode: 'MAT201',
    cfu: 9,
    teacher: 'Prof. Rossi Marco',
    examDate: d('2026-06-15T09:00:00'),
    examType: 'Écrit',
    room: 'Salle B201 — Bât. Sciences',
    onlineLink: null,
    registrationDeadline: d('2026-05-28T23:59:00'),  // 2 jours → ROUGE
    maxStudents: 40,
    enrolledCount: 24,
    status: 'available',
  },
  {
    id: 'a2',
    courseName: 'Réseaux Informatiques',
    courseCode: 'INF302',
    cfu: 6,
    teacher: 'Prof. Conti Paolo',
    examDate: d('2026-06-18T14:00:00'),
    examType: 'Écrit',
    room: 'Salle A104 — Bât. Informatique',
    onlineLink: null,
    registrationDeadline: d('2026-06-01T23:59:00'),  // 6 jours → AMBER
    maxStudents: 35,
    enrolledCount: 18,
    status: 'available',
  },
  {
    id: 'a3',
    courseName: 'Systèmes d\'exploitation',
    courseCode: 'INF303',
    cfu: 6,
    teacher: 'Prof. Marini Giulia',
    examDate: d('2026-06-25T10:00:00'),
    examType: 'Oral',
    room: 'Bureau 3.12 — Bât. Informatique',
    onlineLink: null,
    registrationDeadline: d('2026-06-20T23:59:00'),  // 25 jours → VERT
    maxStudents: 20,
    enrolledCount: 7,
    status: 'available',
  },
  {
    id: 'a4',
    courseName: 'Programmation Avancée',
    courseCode: 'INF401',
    cfu: 6,
    teacher: 'Prof. Bianchi Laura',
    examDate: d('2026-07-02T09:00:00'),
    examType: 'Projet',
    room: null,
    onlineLink: 'https://meet.unigest.fr/bianchi-inf401',
    registrationDeadline: d('2026-06-25T23:59:00'),
    maxStudents: 30,
    enrolledCount: 11,
    status: 'available',
  },
  {
    id: 'a5',
    courseName: 'Algèbre & Structures',
    courseCode: 'MAT301',
    cfu: 6,
    teacher: 'Prof. Rossi Marco',
    examDate: d('2026-07-07T08:30:00'),
    examType: 'Écrit',
    room: 'Amphi A — Bât. Principal',
    onlineLink: null,
    registrationDeadline: d('2026-07-01T23:59:00'),
    maxStudents: 80,
    enrolledCount: 42,
    status: 'available',
  },
  // ── Tab 2 : Prénotés ─────────────────────────────────────────────────────
  {
    id: 'b1',
    courseName: 'Bases de données',
    courseCode: 'INF301',
    cfu: 6,
    teacher: 'Prof. Ferrari Anna',
    examDate: d('2026-06-28T10:00:00'),
    examType: 'Oral',
    room: 'Salle D102 — Bât. Informatique',
    onlineLink: null,
    registrationDeadline: d('2026-06-22T23:59:00'),
    maxStudents: 25,
    enrolledCount: 14,
    status: 'booked',
    bookingNumber: 7,
    bookedAt: d('2026-05-18T14:32:00'),
  },
  {
    id: 'b2',
    courseName: 'Communication Scientifique Avancée',
    courseCode: 'COM201',
    cfu: 3,
    teacher: 'Prof. Moretti Chiara',
    examDate: d('2026-07-03T11:00:00'),
    examType: 'Projet',
    room: null,
    onlineLink: 'https://meet.unigest.fr/moretti-com201',
    registrationDeadline: d('2026-06-28T23:59:00'),
    maxStudents: 20,
    enrolledCount: 3,
    status: 'booked',
    bookingNumber: 3,
    bookedAt: d('2026-05-20T09:15:00'),
  },
  // ── Tab 3 : Notes proposées ──────────────────────────────────────────────
  {
    id: 'g1',
    courseName: 'Analyse Mathématique I',
    courseCode: 'MAT101',
    cfu: 9,
    teacher: 'Prof. Rossi Marco',
    examDate: d('2026-07-10T09:00:00'),
    examType: 'Écrit',
    room: 'Salle B201',
    onlineLink: null,
    registrationDeadline: d('2026-05-01T23:59:00'),
    maxStudents: 40,
    enrolledCount: 30,
    status: 'pending_grade',
    proposedGrade: '26',
    gradeDeadline: d('2026-05-29T23:59:00'),  // 3 jours → URGENT
    teacherNote: 'Résultats corrects, quelques lacunes en intégration. Bonne participation orale.',
    examPassedDate: d('2026-05-15T09:00:00'),
  },
  {
    id: 'g2',
    courseName: 'Programmation Orientée Objet',
    courseCode: 'INF201',
    cfu: 6,
    teacher: 'Prof. Bianchi Laura',
    examDate: d('2026-02-10T14:00:00'),
    examType: 'Projet',
    room: null,
    onlineLink: null,
    registrationDeadline: d('2026-01-25T23:59:00'),
    maxStudents: 30,
    enrolledCount: 18,
    status: 'pending_grade',
    proposedGrade: '30L',
    gradeDeadline: d('2026-06-03T23:59:00'),  // 8 jours
    teacherNote: 'Excellent travail. Projet très bien structuré, présentation claire et maîtrisée. Félicitations.',
    examPassedDate: d('2026-02-10T14:00:00'),
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ordinal(n: number): string {
  if (n === 1) return '1er'
  return `${n}ème`
}

function gradeVariantCls(grade: string): string {
  if (grade === '30L') return 'bg-violet-100 text-violet-800 border-violet-200'
  const n = Number(grade)
  if (n >= 27) return 'bg-green-100 text-green-800 border-green-200'
  if (n >= 24) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-orange-100 text-orange-800 border-orange-200'
}

function examTypeConfig(type: ExamType) {
  const cfg = {
    Écrit:  { icon: '✏️', cls: 'bg-blue-100 text-blue-800'   },
    Oral:   { icon: '🎤', cls: 'bg-violet-100 text-violet-800' },
    Projet: { icon: '💻', cls: 'bg-amber-100 text-amber-800'  },
  }
  return cfg[type]
}

/** Temps restant avant la deadline d'inscription */
function deadlineStatus(deadline: Date, now: Date = new Date()) {
  if (isPast(deadline)) return { label: 'Inscriptions fermées', cls: 'bg-muted text-muted-foreground', urgent: false, closed: true }
  const hours = differenceInHours(deadline, now)
  const days  = differenceInDays(deadline, now)
  if (hours < 24)    return { label: `Ferme dans ${hours}h !`,    cls: 'bg-red-100 text-red-800',    urgent: true,  closed: false }
  if (days  <= 3)    return { label: `Plus que ${days} jour${days > 1 ? 's' : ''}`,  cls: 'bg-amber-100 text-amber-800', urgent: true,  closed: false }
  return { label: `Ouvert jusqu'au ${format(deadline, 'd MMM', { locale: fr })}`, cls: 'bg-emerald-100 text-emerald-800', urgent: false, closed: false }
}

/** Compte à rebours d'acceptation de note */
function gradeCountdown(deadline: Date, now: Date = new Date()) {
  if (isPast(deadline)) return { label: 'Acceptation automatique effectuée', cls: 'bg-muted text-muted-foreground', urgent: false }
  const days  = differenceInDays(deadline, now)
  const hours = differenceInHours(deadline, now)
  if (hours < 24)   return { label: `Expire dans ${hours}h !`,         cls: 'bg-red-100 text-red-800',    urgent: true  }
  if (days  <= 3)   return { label: `Plus que ${days} jour${days > 1 ? 's' : ''} pour refuser`, cls: 'bg-red-100 text-red-800',    urgent: true  }
  if (days  <= 7)   return { label: `Expire dans ${days} jours`,       cls: 'bg-amber-100 text-amber-800', urgent: false }
  return               { label: `${days} jours restants`,              cls: 'bg-sky-100 text-sky-800',    urgent: false }
}

/** Génère le mémo de convocation HTML pour impression */
function buildMemoHtml(exam: DemoExam, bookingNumber: number) {
  const examDateStr = format(exam.examDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })
  const deadlineDateStr = format(exam.registrationDeadline, "d MMMM yyyy", { locale: fr })
  const bookedAtStr = exam.bookedAt ? format(exam.bookedAt, "d MMMM yyyy 'à' HH:mm", { locale: fr }) : '—'
  const location = exam.room ?? exam.onlineLink ?? '—'

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Mémo de convocation — ${exam.courseCode}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#111827; background:#fff; padding:40px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #111827; padding-bottom:16px; margin-bottom:28px; }
    .logo { font-size:20px; font-weight:800; }
    .title { font-size:18px; font-weight:700; margin-bottom:4px; }
    .sub { font-size:12px; color:#6b7280; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:24px 0; }
    .field label { font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:#6b7280; display:block; margin-bottom:3px; }
    .field span { font-size:14px; font-weight:500; }
    .badge { display:inline-block; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:6px; padding:4px 12px; font-size:13px; font-weight:600; }
    .number-box { border:2px solid #4f46e5; border-radius:12px; padding:16px 24px; text-align:center; margin:24px 0; }
    .number-box p:first-child { font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:.06em; }
    .number-box p:last-child { font-size:32px; font-weight:800; color:#4f46e5; }
    .footer { margin-top:40px; border-top:1px solid #e5e7eb; padding-top:12px; font-size:10px; color:#9ca3af; display:flex; justify-content:space-between; }
    .qr-placeholder { width:80px; height:80px; border:1px dashed #d1d5db; display:flex; align-items:center; justify-content:center; font-size:10px; color:#9ca3af; text-align:center; }
    @media print { body { padding:20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">🎓 UniGest</div>
      <div class="sub">Mémo de Convocation — Document officiel</div>
    </div>
    <div style="text-align:right">
      <p style="font-size:11px;color:#6b7280">Imprimé le ${format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
    </div>
  </div>

  <div>
    <p class="title">${exam.courseName}</p>
    <p class="sub">${exam.courseCode} · ${exam.cfu} CFU · ${exam.examType} · ${exam.teacher}</p>
  </div>

  <div class="number-box">
    <p>Numéro d'ordre de passage</p>
    <p>${bookingNumber}</p>
    <p style="font-size:12px;color:#6b7280;margin-top:4px">Vous êtes le ${ordinal(bookingNumber)} sur la liste</p>
  </div>

  <div class="grid">
    <div class="field"><label>Date & heure</label><span>${examDateStr}</span></div>
    <div class="field"><label>Lieu</label><span>${location}</span></div>
    <div class="field"><label>Type d'épreuve</label><span><span class="badge">${exam.examType}</span></span></div>
    <div class="field"><label>Date d'inscription</label><span>${bookedAtStr}</span></div>
  </div>

  <p style="font-size:12px;background:#fef9c3;padding:12px 16px;border-radius:8px;border:1px solid #fde047;color:#854d0e;">
    ⚠️ Ce document peut vous être demandé à l'entrée de la salle d'examen. Présentez-le au secrétariat si nécessaire.
  </p>

  <div class="footer">
    <span>UniGest — Système de Gestion Universitaire</span>
    <span>Document non contractuel — généré automatiquement le ${format(new Date(), "d/MM/yyyy", { locale: fr })}</span>
  </div>
</body>
</html>`
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <Skeleton className="h-8 w-28 rounded-lg" />
    </div>
  )
}

// ─── Modal de confirmation ─────────────────────────────────────────────────────
function ConfirmModal({
  title, message, confirmLabel, confirmCls, onConfirm, onCancel, children,
}: {
  title:        string
  message:      string
  confirmLabel: string
  confirmCls:   string
  onConfirm:    () => void
  onCancel:     () => void
  children?:    React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border shadow-xl p-6 space-y-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        {children}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-colors ${confirmCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Onglet 1 : Sessions disponibles ─────────────────────────────────────────
function AvailableTab({
  exams, onBook,
}: {
  exams:  DemoExam[]
  onBook: (id: string) => void
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const available = exams.filter((e) => e.status === 'available')
  const exam = available.find((e) => e.id === confirmId)

  return (
    <>
      {available.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-16 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm text-muted-foreground">Aucun appel disponible pour ce semestre.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {available.map((e) => {
            const dl     = deadlineStatus(e.registrationDeadline)
            const type   = examTypeConfig(e.examType)
            const pct    = Math.round((e.enrolledCount / e.maxStudents) * 100)
            const isFull = e.enrolledCount >= e.maxStudents

            return (
              <div
                key={e.id}
                className={`rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow ${dl.closed || isFull ? 'opacity-60' : ''}`}
              >
                {/* En-tête */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${type.cls}`}>
                          {type.icon} {e.examType}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">{e.courseCode}</span>
                        <span className="text-[11px] text-muted-foreground">· {e.cfu} CFU</span>
                      </div>
                      <h3 className="font-semibold text-base leading-tight">{e.courseName}</h3>
                      <p className="text-[12px] text-muted-foreground mt-0.5">👤 {e.teacher}</p>
                    </div>
                  </div>
                </div>

                {/* Infos */}
                <div className="px-5 pb-4 space-y-2">
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
                    <span>📅 {format(e.examDate, "EEE d MMM yyyy · HH:mm", { locale: fr })}</span>
                    {e.room
                      ? <span>📍 {e.room}</span>
                      : <span>💻 <a href={e.onlineLink ?? '#'} className="text-primary underline-offset-2 hover:underline" target="_blank" rel="noreferrer">Lien visio</a></span>
                    }
                  </div>

                  {/* Inscrits */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>👥 {e.enrolledCount} / {e.maxStudents} inscrits</span>
                      {isFull && <span className="text-red-600 font-semibold">Complet</span>}
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer : deadline + bouton */}
                <div className="flex items-center justify-between gap-3 border-t px-5 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold w-fit ${dl.cls}`}>
                      {dl.urgent ? '⚡' : '🕐'} {dl.label}
                    </span>
                    {!dl.closed && (
                      <span className="text-[10px] text-muted-foreground pl-1">
                        Ferme le {format(e.registrationDeadline, "d MMM 'à' HH:mm", { locale: fr })}
                      </span>
                    )}
                  </div>
                  {dl.closed || isFull ? (
                    <span className="text-[11px] text-muted-foreground italic">Inscription impossible</span>
                  ) : (
                    <button
                      onClick={() => setConfirmId(e.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
                    >
                      S'inscrire →
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de confirmation d'inscription */}
      {confirmId && exam && (
        <ConfirmModal
          title="Confirmer l'inscription"
          message={`Vous allez vous inscrire à l'examen de ${exam.courseName} le ${format(exam.examDate, "d MMMM yyyy 'à' HH:mm", { locale: fr })}.`}
          confirmLabel="✅ Confirmer l'inscription"
          confirmCls="bg-primary text-primary-foreground hover:bg-primary/90"
          onConfirm={() => { onBook(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        >
          <div className="rounded-xl bg-muted/50 p-3 text-[12px] text-muted-foreground space-y-1">
            <p>📍 <strong>Lieu :</strong> {exam.room ?? 'En ligne'}</p>
            <p>⏰ <strong>Inscription avant :</strong> {format(exam.registrationDeadline, "d MMM 'à' HH:mm", { locale: fr })}</p>
            <p>👥 <strong>Places restantes :</strong> {exam.maxStudents - exam.enrolledCount}</p>
          </div>
        </ConfirmModal>
      )}
    </>
  )
}

// ─── Onglet 2 : Mes prénotations ──────────────────────────────────────────────
function BookedTab({
  exams, onCancel,
}: {
  exams:    DemoExam[]
  onCancel: (id: string) => void
}) {
  const [cancelId, setCancelId] = useState<string | null>(null)
  const booked = exams.filter((e) => e.status === 'booked')

  function printMemo(exam: DemoExam) {
    if (!exam.bookingNumber) return
    const html = buildMemoHtml(exam, exam.bookingNumber)
    const win  = window.open('', '_blank', 'width=800,height=650')
    if (!win) { alert('Autorisez les popups pour imprimer le mémo.'); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }

  const cancelExam = booked.find((e) => e.id === cancelId)

  return (
    <>
      {booked.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm text-muted-foreground">Aucune inscription active.</p>
          <p className="text-xs text-muted-foreground mt-1">Inscrivez-vous à un examen dans le premier onglet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {booked.map((e) => {
            const dl       = deadlineStatus(e.registrationDeadline)
            const canCancel = !dl.closed
            const type     = examTypeConfig(e.examType)

            return (
              <div key={e.id} className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                {/* Bande de statut */}
                <div className="bg-primary/5 border-b px-5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[12px] font-semibold text-primary">Prénoté — Confirmation envoyée</span>
                  </div>
                  {e.bookedAt && (
                    <span className="text-[10px] text-muted-foreground">
                      Inscrit le {format(e.bookedAt, "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  {/* En-tête */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${type.cls}`}>
                          {type.icon} {e.examType}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">{e.courseCode}</span>
                      </div>
                      <h3 className="font-semibold text-base">{e.courseName}</h3>
                      <p className="text-[12px] text-muted-foreground">👤 {e.teacher}</p>
                    </div>

                    {/* Numéro de passage */}
                    {e.bookingNumber && (
                      <div className="shrink-0 rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-2 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">N° d'ordre</p>
                        <p className="text-2xl font-black text-primary tabular-nums">{e.bookingNumber}</p>
                        <p className="text-[10px] text-muted-foreground">{ordinal(e.bookingNumber)} sur la liste</p>
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
                    <span>📅 {format(e.examDate, "EEE d MMM yyyy · HH:mm", { locale: fr })}</span>
                    {e.room
                      ? <span>📍 {e.room}</span>
                      : <span>💻 Examen en ligne</span>
                    }
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => printMemo(e)}
                      className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      🖨 Mémo de convocation
                    </button>
                    {canCancel ? (
                      <button
                        onClick={() => setCancelId(e.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        ✕ Annuler l'inscription
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">Délai d'annulation expiré</span>
                    )}
                  </div>

                  {/* Deadline */}
                  {!dl.closed && (
                    <p className="text-[11px] text-muted-foreground">
                      Annulation possible jusqu'au {format(e.registrationDeadline, "d MMMM 'à' HH:mm", { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal annulation */}
      {cancelId && cancelExam && (
        <ConfirmModal
          title="Annuler l'inscription ?"
          message={`Êtes-vous sûr de vouloir annuler votre inscription à l'examen de ${cancelExam.courseName} ? Votre place sera libérée et vous devrez vous réinscrire si vous changez d'avis.`}
          confirmLabel="Oui, annuler l'inscription"
          confirmCls="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onConfirm={() => { onCancel(cancelId); setCancelId(null) }}
          onCancel={() => setCancelId(null)}
        />
      )}
    </>
  )
}

// ─── Onglet 3 : Notes proposées ───────────────────────────────────────────────
function GradesTab({
  exams, onAccept, onReject,
}: {
  exams:    DemoExam[]
  onAccept: (id: string) => void
  onReject: (id: string) => void
}) {
  const [rejectId, setRejectId] = useState<string | null>(null)
  const grades = exams.filter((e) => e.status === 'pending_grade')
  const rejectExam = grades.find((e) => e.id === rejectId)

  return (
    <>
      {grades.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-16 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm text-muted-foreground">Aucune note en attente de votre réponse.</p>
          <p className="text-xs text-muted-foreground mt-1">Les notes proposées par vos professeurs apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grades.map((e) => {
            const cd      = e.gradeDeadline ? gradeCountdown(e.gradeDeadline) : null
            const gradeCls = gradeVariantCls(e.proposedGrade ?? '')

            return (
              <div
                key={e.id}
                className={`rounded-2xl border bg-card shadow-sm overflow-hidden ${cd?.urgent ? 'border-red-300' : ''}`}
              >
                {/* Alerte urgence */}
                {cd?.urgent && (
                  <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900 px-5 py-2 flex items-center gap-2">
                    <span className="animate-pulse text-red-600">🔴</span>
                    <span className="text-[12px] font-semibold text-red-700 dark:text-red-400">{cd.label} — Répondez avant l'acceptation automatique !</span>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* En-tête : course + note */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] text-muted-foreground">{e.courseCode}</span>
                        <span className="text-[11px] text-muted-foreground">· {e.cfu} CFU</span>
                      </div>
                      <h3 className="font-bold text-base">{e.courseName}</h3>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        👤 {e.teacher}
                        {e.examPassedDate && (
                          <span className="ml-2">· Passé le {format(e.examPassedDate, "d MMM yyyy", { locale: fr })}</span>
                        )}
                      </p>
                    </div>

                    {/* Note proposée */}
                    <div className="shrink-0 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Note proposée</p>
                      <span className={`inline-flex items-center justify-center rounded-xl border-2 px-4 py-2 text-2xl font-black tabular-nums ${gradeCls}`}>
                        {e.proposedGrade === '30L' ? '30L ✦' : e.proposedGrade}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1">/ 30</p>
                    </div>
                  </div>

                  {/* Commentaire du prof */}
                  {e.teacherNote && (
                    <div className="rounded-xl bg-muted/40 border px-4 py-3 text-[12px] text-muted-foreground italic leading-relaxed">
                      💬 « {e.teacherNote} »
                    </div>
                  )}

                  {/* Compte à rebours */}
                  {cd && e.gradeDeadline && (
                    <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${cd.cls}`}>
                      <span className="text-[12px] font-semibold">{cd.label}</span>
                      <span className="text-[11px]">
                        Expire le {format(e.gradeDeadline, "d MMMM 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>
                  )}

                  {/* Info légale */}
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    En l'absence de réponse avant la date limite, la note sera <strong>automatiquement acceptée</strong> et inscrite à votre Libretto.
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => onAccept(e.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      ✅ Accepter la note
                    </button>
                    <button
                      onClick={() => setRejectId(e.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/50 px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
                    >
                      ❌ Refuser et retenter
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Note informative */}
          <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
            ℹ️ Les notes acceptées sont automatiquement transmises à votre Libretto.<br />
            En cas de refus, vous pourrez vous réinscrire lors de la prochaine session d'examens.
          </p>
        </div>
      )}

      {/* Modal refus */}
      {rejectId && rejectExam && (
        <ConfirmModal
          title="Refuser la note ?"
          message={`Vous allez refuser la note de ${rejectExam.proposedGrade === '30L' ? '30 e Lode' : `${rejectExam.proposedGrade}/30`} en ${rejectExam.courseName}. Cette note ne sera pas inscrite à votre Libretto et vous devrez repasser cet examen lors d'une prochaine session.`}
          confirmLabel="❌ Confirmer le refus"
          confirmCls="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onConfirm={() => { onReject(rejectId); setRejectId(null) }}
          onCancel={() => setRejectId(null)}
        >
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-3 text-[12px] text-amber-800 dark:text-amber-300">
            ⚠️ Cette action est irréversible. La décision de refus sera notifiée au professeur.
          </div>
        </ConfirmModal>
      )}
    </>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function ExamsPage() {
  const [tab,   setTab]   = useState<'available' | 'booked' | 'grades'>('available')
  const [exams, setExams] = useState<DemoExam[]>(INITIAL_EXAMS)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Comptes pour les badges
  const bookedCount  = useMemo(() => exams.filter((e) => e.status === 'booked').length,        [exams])
  const gradesCount  = useMemo(() => exams.filter((e) => e.status === 'pending_grade').length, [exams])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  function handleBook(id: string) {
    setExams((prev) => prev.map((e) =>
      e.id === id
        ? { ...e, status: 'booked', bookingNumber: e.enrolledCount + 1, bookedAt: NOW, enrolledCount: e.enrolledCount + 1 }
        : e
    ))
    showToast('Inscription confirmée ! Retrouvez-la dans "Mes Prénotations".')
    setTab('booked')
  }

  function handleCancel(id: string) {
    setExams((prev) => prev.map((e) =>
      e.id === id
        ? { ...e, status: 'available', bookingNumber: undefined, bookedAt: undefined, enrolledCount: Math.max(0, e.enrolledCount - 1) }
        : e
    ))
    showToast('Inscription annulée. Vous pouvez vous réinscrire dans "Sessions disponibles".')
    setTab('available')
  }

  function handleAccept(id: string) {
    setExams((prev) => prev.map((e) => e.id === id ? { ...e, status: 'accepted' } : e))
    showToast('🎉 Note acceptée — elle sera inscrite à votre Libretto sous 24h.')
  }

  function handleReject(id: string) {
    setExams((prev) => prev.map((e) => e.id === id ? { ...e, status: 'rejected' } : e))
    showToast('Note refusée. Inscrivez-vous à la prochaine session depuis l\'onglet "Sessions disponibles".')
    setTab('available')
  }

  // ── Tabs config ────────────────────────────────────────────────────────────
  const tabs = [
    { key: 'available' as const, label: '📅 Sessions',        badge: 0            },
    { key: 'booked'    as const, label: '📋 Prénotations',    badge: bookedCount  },
    { key: 'grades'    as const, label: '📝 Notes proposées', badge: gradesCount  },
  ]

  return (
    <div className="space-y-6 pb-8">

      {/* ── En-tête ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold">📝 Examens</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inscrivez-vous aux appels, gérez vos prénotations et répondez aux notes proposées.
        </p>
      </div>

      {/* ── Navigation par onglets ───────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-xl bg-muted p-1 w-fit">
        {tabs.map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
            {badge > 0 && (
              <span className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
                key === 'grades' ? 'bg-orange-500' : 'bg-primary'
              }`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Contenu ──────────────────────────────────────────────────────── */}
      {tab === 'available' && <AvailableTab  exams={exams} onBook={handleBook}     />}
      {tab === 'booked'    && <BookedTab     exams={exams} onCancel={handleCancel} />}
      {tab === 'grades'    && <GradesTab     exams={exams} onAccept={handleAccept} onReject={handleReject} />}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-2xl px-5 py-3 shadow-xl text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white'
              : 'bg-destructive text-destructive-foreground'
          }`}
        >
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </div>
  )
}

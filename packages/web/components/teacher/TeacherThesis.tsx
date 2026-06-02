'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── Types ────────────────────────────────────────────────────────────────────
type ThesisTab     = 'requests' | 'active' | 'defenses'
type RequestStatus = 'pending' | 'accepted' | 'refused'
type ThesisStatus  = 'in_progress' | 'revision' | 'submitted' | 'defended'
type ChapterStatus = 'not_started' | 'draft' | 'submitted' | 'approved'

interface ThesisRequest {
  id:        string
  firstName: string
  lastName:  string
  matricola: string
  program:   string
  topic:     string
  summary:   string
  date:      Date
  status:    RequestStatus
}

interface ThesisChapter {
  num:    number
  title:  string
  status: ChapterStatus
}

interface ActiveThesis {
  id:        string
  firstName: string
  lastName:  string
  matricola: string
  program:   string
  title:     string
  startDate: Date
  deadline:  Date
  status:    ThesisStatus
  chapters:  ThesisChapter[]
  lastMsg:   string
  lastMsgDate: Date
}

interface Defense {
  id:        string
  firstName: string
  lastName:  string
  title:     string
  date:      Date
  room:      string
  jury:      string[]
  grade:     string | undefined
  passed:    boolean | undefined
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const REQUESTS: ThesisRequest[] = [
  {
    id: 'req1',
    firstName: 'Axel',
    lastName: 'Beaumont',
    matricola: 'MAT20240301',
    program: 'M2 Informatique',
    topic: 'Optimisation des algorithmes de clustering pour données de grande dimension',
    summary: 'Ce travail propose d\'explorer les limites des algorithmes k-means et DBSCAN sur des jeux de données dépassant 10^7 points, avec une approche hybride GPU/CPU.',
    date: new Date('2026-05-20T14:30:00'),
    status: 'pending',
  },
  {
    id: 'req2',
    firstName: 'Sara',
    lastName: 'Nakamura',
    matricola: 'MAT20240318',
    program: 'M2 Informatique',
    topic: 'Sécurité des APIs REST dans les environnements microservices',
    summary: 'Étude comparative des méthodes d\'authentification JWT, OAuth2 et mTLS dans des architectures cloud-native Kubernetes.',
    date: new Date('2026-05-22T09:00:00'),
    status: 'pending',
  },
  {
    id: 'req3',
    firstName: 'Kevin',
    lastName: 'Tremblay',
    matricola: 'MAT20240325',
    program: 'M1 Informatique',
    topic: 'Analyse comparative des frameworks de deep learning',
    summary: 'Benchmark TensorFlow vs PyTorch vs JAX pour des tâches de vision par ordinateur.',
    date: new Date('2026-05-15T11:00:00'),
    status: 'refused',
  },
]

const ACTIVE_THESES: ActiveThesis[] = [
  {
    id: 'th1',
    firstName: 'Elisa',
    lastName: 'Fontaine',
    matricola: 'MAT20230145',
    program: 'M2 Informatique',
    title: 'Apprentissage fédéré et confidentialité différentielle pour IoT médicaux',
    startDate: new Date('2025-10-01'),
    deadline: new Date('2026-09-30'),
    status: 'in_progress',
    lastMsg: 'J\'ai terminé la section 3.2 sur l\'analyse de confidentialité, merci pour les retours !',
    lastMsgDate: new Date('2026-05-24T16:00:00'),
    chapters: [
      { num: 1, title: 'Introduction et état de l\'art',   status: 'approved' },
      { num: 2, title: 'Fondements théoriques',            status: 'approved' },
      { num: 3, title: 'Architecture proposée',            status: 'submitted' },
      { num: 4, title: 'Évaluation expérimentale',         status: 'draft' },
      { num: 5, title: 'Conclusion et perspectives',       status: 'not_started' },
    ],
  },
  {
    id: 'th2',
    firstName: 'Omar',
    lastName: 'Khalil',
    matricola: 'MAT20230178',
    program: 'M2 Informatique',
    title: 'Génération de code par LLMs : évaluation de la sécurité des sorties',
    startDate: new Date('2025-10-15'),
    deadline: new Date('2026-10-15'),
    status: 'revision',
    lastMsg: 'Chapitre 2 révisé selon vos commentaires. Je passe à la section expérimentale.',
    lastMsgDate: new Date('2026-05-23T10:30:00'),
    chapters: [
      { num: 1, title: 'Introduction',                     status: 'approved' },
      { num: 2, title: 'Revue de littérature',             status: 'approved' },
      { num: 3, title: 'Méthodologie d\'évaluation',       status: 'draft' },
      { num: 4, title: 'Expériences et résultats',         status: 'not_started' },
      { num: 5, title: 'Discussion et conclusion',         status: 'not_started' },
    ],
  },
  {
    id: 'th3',
    firstName: 'Amélie',
    lastName: 'Gros',
    matricola: 'MAT20230201',
    program: 'M2 Réseaux',
    title: 'Routage adaptatif dans les réseaux SDN pour le trafic multimédia temps réel',
    startDate: new Date('2025-09-01'),
    deadline: new Date('2026-06-30'),
    status: 'submitted',
    lastMsg: 'Manuscrit déposé ! J\'attends votre validation avant la soutenance.',
    lastMsgDate: new Date('2026-05-18T14:00:00'),
    chapters: [
      { num: 1, title: 'Introduction',                     status: 'approved' },
      { num: 2, title: 'État de l\'art SDN',               status: 'approved' },
      { num: 3, title: 'Architecture de routage',          status: 'approved' },
      { num: 4, title: 'Évaluation et simulation',         status: 'approved' },
      { num: 5, title: 'Conclusion',                       status: 'approved' },
    ],
  },
]

const DEFENSES: Defense[] = [
  {
    id: 'd1',
    firstName: 'Amélie',
    lastName: 'Gros',
    title: 'Routage adaptatif dans les réseaux SDN pour le trafic multimédia temps réel',
    date: new Date('2026-06-28T10:00:00'),
    room: 'Salle des soutenances A',
    jury: ['Prof. Martin (directeur)', 'Dr. Dupont (rapporteur)', 'Prof. Leroy (examinateur)'],
    grade: undefined,
    passed: undefined,
  },
  {
    id: 'd2',
    firstName: 'Lucas',
    lastName: 'Bernard',
    title: 'Méthodes d\'inférence bayésienne pour la détection d\'anomalies en cybersécurité',
    date: new Date('2026-02-14T14:00:00'),
    room: 'Amphi B',
    jury: ['Prof. Martin (directeur)', 'Dr. Garcia (rapporteur)', 'Prof. Morel (examinateur)'],
    grade: '18/20',
    passed: true,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function chapterStatusInfo(s: ChapterStatus): { label: string; cls: string } {
  const map: Record<ChapterStatus, { label: string; cls: string }> = {
    not_started: { label: 'Non débuté',  cls: 'bg-muted text-muted-foreground' },
    draft:       { label: 'Brouillon',   cls: 'bg-blue-100 text-blue-700' },
    submitted:   { label: 'Soumis',      cls: 'bg-amber-100 text-amber-700' },
    approved:    { label: 'Approuvé',    cls: 'bg-emerald-100 text-emerald-700' },
  }
  return map[s]
}

function progressPct(chapters: ThesisChapter[]): number {
  const weights: Record<ChapterStatus, number> = {
    not_started: 0,
    draft:       0.33,
    submitted:   0.66,
    approved:    1,
  }
  const total = chapters.reduce((sum, c) => sum + (weights[c.status] ?? 0), 0)
  return Math.round((total / chapters.length) * 100)
}

function thesisStatusBadge(s: ThesisStatus) {
  const map: Record<ThesisStatus, { label: string; cls: string }> = {
    in_progress: { label: 'En cours',    cls: 'bg-blue-100 text-blue-700' },
    revision:    { label: 'Révision',    cls: 'bg-amber-100 text-amber-700' },
    submitted:   { label: 'Déposé',      cls: 'bg-violet-100 text-violet-700' },
    defended:    { label: 'Soutenu',     cls: 'bg-emerald-100 text-emerald-700' },
  }
  const { label, cls } = map[s]
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}

// ─── Comment Modal ────────────────────────────────────────────────────────────
function CommentModal({
  thesis,
  onClose,
}: {
  thesis:  ActiveThesis
  onClose: () => void
}) {
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)

  function handleSend() {
    if (!msg.trim()) return
    setSent(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
        <h3 className="font-semibold">Retour à {thesis.firstName} {thesis.lastName}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{thesis.title}</p>

        {/* Last message from student */}
        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
          <p className="text-xs font-semibold text-muted-foreground mb-1">
            Dernier message de l'étudiant · {format(thesis.lastMsgDate, 'd MMM', { locale: fr })}
          </p>
          <p className="italic">"{thesis.lastMsg}"</p>
        </div>

        {sent ? (
          <div className="mt-4 text-center">
            <p className="text-2xl">✅</p>
            <p className="mt-1 text-sm font-medium text-emerald-600">Message envoyé !</p>
          </div>
        ) : (
          <>
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="Votre retour…"
              rows={4}
              className="mt-4 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                disabled={!msg.trim()}
                className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                Envoyer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Requests Tab ─────────────────────────────────────────────────────────────
function RequestsTab() {
  const [statuses, setStatuses] = useState<Record<string, RequestStatus>>(() => {
    const init: Record<string, RequestStatus> = {}
    REQUESTS.forEach(r => { init[r.id] = r.status })
    return init
  })
  const [expanded, setExpanded] = useState<string | null>(null)

  function decide(id: string, decision: 'accepted' | 'refused') {
    setStatuses(prev => ({ ...prev, [id]: decision }))
  }

  const pending  = REQUESTS.filter(r => statuses[r.id] === 'pending')
  const resolved = REQUESTS.filter(r => statuses[r.id] !== 'pending')

  return (
    <div className="space-y-4">
      {pending.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Aucune demande en attente. 🎉
        </div>
      )}

      {pending.map(req => (
        <div key={req.id} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">{req.firstName} {req.lastName}</p>
              <p className="text-xs text-muted-foreground">{req.matricola} · {req.program}</p>
              <p className="mt-2 text-sm font-semibold">{req.topic}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Reçu le {format(req.date, 'd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                {expanded === req.id ? 'Masquer' : 'Voir résumé'}
              </button>
              <button
                onClick={() => decide(req.id, 'refused')}
                className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400"
              >
                Refuser
              </button>
              <button
                onClick={() => decide(req.id, 'accepted')}
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Accepter
              </button>
            </div>
          </div>
          {expanded === req.id && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground italic">
              {req.summary}
            </div>
          )}
        </div>
      ))}

      {resolved.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Traitées
          </h3>
          {resolved.map(req => (
            <div key={req.id} className="mb-2 flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm opacity-70">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                statuses[req.id] === 'accepted'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {statuses[req.id] === 'accepted' ? 'Acceptée' : 'Refusée'}
              </span>
              <span className="font-medium">{req.firstName} {req.lastName}</span>
              <span className="text-muted-foreground truncate">{req.topic}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Active Tab ───────────────────────────────────────────────────────────────
function ActiveTab() {
  const [commentFor, setCommentFor] = useState<ActiveThesis | null>(null)
  const [approving,  setApproving]  = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {commentFor && (
        <CommentModal thesis={commentFor} onClose={() => setCommentFor(null)} />
      )}

      {ACTIVE_THESES.map(thesis => {
        const pct = progressPct(thesis.chapters)
        return (
          <div key={thesis.id} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {thesisStatusBadge(thesis.status)}
                  <span className="text-xs text-muted-foreground">{thesis.program}</span>
                </div>
                <p className="mt-1.5 font-semibold leading-snug">{thesis.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {thesis.firstName} {thesis.lastName} · {thesis.matricola}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Début {format(thesis.startDate, 'd MMM yyyy', { locale: fr })} · Limite {format(thesis.deadline, 'd MMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-2xl font-bold text-indigo-600">{pct}%</span>
                <p className="text-xs text-muted-foreground">Avancement</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Chapters */}
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {thesis.chapters.map(ch => {
                const { label, cls } = chapterStatusInfo(ch.status)
                const canApprove = ch.status === 'submitted'
                return (
                  <div
                    key={ch.num}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs"
                  >
                    <span className="font-medium truncate mr-2">Ch. {ch.num} — {ch.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`rounded-full px-1.5 py-0.5 font-medium ${cls}`}>{label}</span>
                      {canApprove && (
                        <button
                          onClick={() => setApproving(`${thesis.id}-${ch.num}`)}
                          className="rounded bg-emerald-600 px-1.5 py-0.5 text-white hover:bg-emerald-700"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Last message + actions */}
            <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  Dernier message · {format(thesis.lastMsgDate, 'd MMM', { locale: fr })}
                </p>
                <p className="text-sm truncate italic text-muted-foreground">"{thesis.lastMsg}"</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setCommentFor(thesis)}
                  className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  💬 Commenter
                </button>
                {thesis.status === 'submitted' && (
                  <button className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700">
                    ✅ Valider manuscrit
                  </button>
                )}
              </div>
            </div>

            {approving?.startsWith(thesis.id) && (
              <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
                ✅ Chapitre approuvé (simulation) —{' '}
                <button className="underline" onClick={() => setApproving(null)}>OK</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Defenses Tab ─────────────────────────────────────────────────────────────
function DefensesTab() {
  return (
    <div className="space-y-4">
      {DEFENSES.map(d => (
        <div key={d.id} className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                {d.passed === true  && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Soutenue ✓</span>}
                {d.passed === false && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Ajournée</span>}
                {d.passed === undefined && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Planifiée</span>}
              </div>
              <p className="mt-1.5 font-semibold leading-snug">{d.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{d.firstName} {d.lastName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                📅 {format(d.date, 'EEEE d MMMM yyyy · HH:mm', { locale: fr })}
              </p>
              <p className="text-sm text-muted-foreground">📍 {d.room}</p>
            </div>
            {d.grade && (
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">{d.grade}</p>
                <p className="text-xs text-muted-foreground">Note finale</p>
              </div>
            )}
          </div>

          {/* Jury */}
          <div className="mt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Jury</p>
            <div className="flex flex-wrap gap-1.5">
              {d.jury.map(j => (
                <span key={j} className="rounded-full border bg-muted px-2.5 py-0.5 text-xs">{j}</span>
              ))}
            </div>
          </div>

          {d.passed === undefined && (
            <div className="mt-3 flex gap-2">
              <button className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                📄 Rapport de soutenance
              </button>
              <button className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                Saisir la note
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function TeacherThesis() {
  const [tab, setTab] = useState<ThesisTab>('requests')

  const pendingCount = REQUESTS.filter(r => r.status === 'pending').length

  const TABS: Array<{ id: ThesisTab; label: string; count?: number | undefined }> = [
    { id: 'requests', label: 'Demandes',   count: pendingCount > 0 ? pendingCount : undefined },
    { id: 'active',   label: 'En cours',   count: ACTIVE_THESES.length },
    { id: 'defenses', label: 'Soutenances',count: DEFENSES.filter(d => d.passed === undefined).length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Thèses dirigées</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les demandes d'encadrement, suivez l'avancement et planifiez les soutenances.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Demandes en attente</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-2xl font-bold text-indigo-600">{ACTIVE_THESES.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Thèses encadrées</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">
            {DEFENSES.filter(d => d.passed === undefined).length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Soutenances planifiées</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border bg-muted/30 p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                tab === t.id ? 'bg-indigo-100 text-indigo-700' : 'bg-muted text-muted-foreground'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'requests'  && <RequestsTab />}
      {tab === 'active'    && <ActiveTab />}
      {tab === 'defenses'  && <DefensesTab />}
    </div>
  )
}

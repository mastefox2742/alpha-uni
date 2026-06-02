'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { format, isPast, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── Types ────────────────────────────────────────────────────────────────────
type CourseTab  = 'exams' | 'material' | 'syllabus' | 'avvisi'
type DegreeType = 'bachelor' | 'master'
type FileKind   = 'slides' | 'td' | 'dataset' | 'link'
type VerbaleState = 'incomplete' | 'ready' | 'published'

interface DemoCourse {
  id: string; name: string; code: string; cfu: number
  year: number; semester: 1 | 2; students: number
  degreeType: DegreeType; degreeName: string
  description: string; syllabusNote: string
}
interface DemoSession {
  id: string; courseId: string; date: Date; deadline: Date
  room: string; maxStudents: number; enrolled: number
  verbaleState: VerbaleState; verbaleTotal: number; verbaleEntered: number
}
interface DemoFile {
  id: string; courseId: string; kind: FileKind
  name: string; size: string; uploadedAt: Date; url: string
}
interface Modality { id: string; label: string; pct: number; detail: string }
interface Topic    { id: string; week: number; title: string }
interface Book     { id: string; authors: string; title: string; publisher: string; year: number }
interface Avviso   { id: string; subject: string; body: string; urgent: boolean; sentAt: Date; recipients: number }

// ─── Demo data ────────────────────────────────────────────────────────────────
const COURSES: Record<string, DemoCourse> = {
  c1: { id:'c1', name:'Algorithmique & Structures de données', code:'INFO301', cfu:9, year:3, semester:1, students:45, degreeType:'bachelor', degreeName:'Licence Informatique', description:'Algorithmes classiques, complexité temporelle et spatiale, arbres, graphes.', syllabusNote:'CM 2h/sem + TD 2h/sem. Examen final 3h.' },
  c2: { id:'c2', name:'Génie logiciel', code:'INFO401', cfu:6, year:4, semester:2, students:38, degreeType:'master', degreeName:'Master Informatique', description:'Design patterns GoF, méthodes agiles, tests automatisés, DevOps.', syllabusNote:'CM 2h/sem + TP 2h/sem. Projet groupe + exam final.' },
  c3: { id:'c3', name:'Bases de données', code:'INFO201', cfu:9, year:2, semester:1, students:52, degreeType:'bachelor', degreeName:'Licence Informatique', description:'Modèle relationnel, SQL avancé, transactions, indexation, bases NoSQL.', syllabusNote:'CM 2h/sem + TP 2h/sem. Projet semestre + exam final.' },
}
const FALLBACK_COURSE: DemoCourse = { id:'demo', name:'Cours démo', code:'DEMO101', cfu:6, year:1, semester:1, students:30, degreeType:'bachelor', degreeName:'Licence', description:'', syllabusNote:'' }

const SESSIONS: DemoSession[] = [
  { id:'es1', courseId:'c1', date:new Date('2026-06-15T09:00:00'), deadline:new Date('2026-05-28T23:59:00'), room:'Amphi A', maxStudents:40, enrolled:12, verbaleState:'incomplete', verbaleTotal:15, verbaleEntered:12 },
  { id:'es2', courseId:'c1', date:new Date('2026-07-10T09:00:00'), deadline:new Date('2026-07-03T23:59:00'), room:'Salle B104', maxStudents:30, enrolled:0, verbaleState:'published', verbaleTotal:0, verbaleEntered:0 },
  { id:'es3', courseId:'c2', date:new Date('2026-07-02T09:00:00'), deadline:new Date('2026-06-25T23:59:00'), room:'Amphi B', maxStudents:35, enrolled:5, verbaleState:'published', verbaleTotal:0, verbaleEntered:0 },
  { id:'es4', courseId:'c3', date:new Date('2026-06-20T14:00:00'), deadline:new Date('2026-06-13T23:59:00'), room:'Salle C302', maxStudents:30, enrolled:8, verbaleState:'ready', verbaleTotal:8, verbaleEntered:8 },
  { id:'es5', courseId:'c3', date:new Date('2026-05-05T14:00:00'), deadline:new Date('2026-04-28T23:59:00'), room:'Salle C302', maxStudents:30, enrolled:8, verbaleState:'ready', verbaleTotal:8, verbaleEntered:8 },
]

const FILES: DemoFile[] = [
  { id:'f1', courseId:'c1', kind:'slides', name:'Cours01_Introduction.pdf', size:'2.4 MB', uploadedAt:new Date('2026-02-15'), url:'#' },
  { id:'f2', courseId:'c1', kind:'slides', name:'Cours02_Complexité_O.pdf', size:'3.1 MB', uploadedAt:new Date('2026-02-22'), url:'#' },
  { id:'f3', courseId:'c1', kind:'slides', name:'Cours03_Arbres_Graphes.pdf', size:'4.8 MB', uploadedAt:new Date('2026-03-01'), url:'#' },
  { id:'f4', courseId:'c1', kind:'td', name:'TD01_Intro_Complexité.pdf', size:'856 KB', uploadedAt:new Date('2026-02-20'), url:'#' },
  { id:'f5', courseId:'c1', kind:'td', name:'TD02_Tri_Recherche.pdf', size:'1.2 MB', uploadedAt:new Date('2026-02-27'), url:'#' },
  { id:'f6', courseId:'c1', kind:'dataset', name:'dataset_graphes.csv', size:'45 KB', uploadedAt:new Date('2026-03-05'), url:'#' },
  { id:'f7', courseId:'c1', kind:'link', name:'Enregistrement Cours01 – Teams', size:'', uploadedAt:new Date('2026-02-15'), url:'https://teams.microsoft.com/l/rec/demo' },
  { id:'f8', courseId:'c1', kind:'link', name:'Enregistrement Cours02 – Teams', size:'', uploadedAt:new Date('2026-02-22'), url:'https://teams.microsoft.com/l/rec/demo2' },
  { id:'f9', courseId:'c3', kind:'slides', name:'Cours01_Modele_Relationnel.pdf', size:'3.2 MB', uploadedAt:new Date('2026-02-10'), url:'#' },
  { id:'f10', courseId:'c3', kind:'slides', name:'Cours02_SQL_Avancé.pdf', size:'2.8 MB', uploadedAt:new Date('2026-02-17'), url:'#' },
  { id:'f11', courseId:'c3', kind:'td', name:'TP01_SQL_Bases.pdf', size:'1.1 MB', uploadedAt:new Date('2026-02-12'), url:'#' },
  { id:'f12', courseId:'c3', kind:'dataset', name:'database_movies.sql', size:'128 KB', uploadedAt:new Date('2026-02-14'), url:'#' },
  { id:'f13', courseId:'c2', kind:'slides', name:'Cours01_Design_Patterns.pdf', size:'4.1 MB', uploadedAt:new Date('2026-03-03'), url:'#' },
  { id:'f14', courseId:'c2', kind:'td', name:'TP01_Scrum_Kanban.pdf', size:'980 KB', uploadedAt:new Date('2026-03-05'), url:'#' },
]

const MODALITIES: Record<string, Modality[]> = {
  c1: [
    { id:'m1', label:'Examen écrit final', pct:70, detail:'3h, salle fermée, calculatrice interdite' },
    { id:'m2', label:'TD notés',           pct:30, detail:'Moyenne des 4 meilleures séances sur 5' },
  ],
  c2: [
    { id:'m1', label:'Examen écrit',    pct:50, detail:'2h, questions cours + exercices' },
    { id:'m2', label:'Projet de groupe', pct:30, detail:'Équipes de 3–4, soutenance orale' },
    { id:'m3', label:'TP notés',         pct:20, detail:'3 séances évaluées' },
  ],
  c3: [
    { id:'m1', label:'Examen écrit final', pct:60, detail:'3h, SQL + théorie' },
    { id:'m2', label:'Projet semestre',    pct:40, detail:'Base de données complète + rapport' },
  ],
}

const TOPICS: Record<string, Topic[]> = {
  c1: [
    { id:'t1', week:1,  title:'Introduction à l\'algorithmique — rappels de maths' },
    { id:'t2', week:2,  title:'Complexité temporelle : O(n), O(log n), O(n²)' },
    { id:'t3', week:3,  title:'Récursivité et mémoïsation' },
    { id:'t4', week:4,  title:'Structures linéaires : listes, piles, files' },
    { id:'t5', week:5,  title:'Arbres binaires et arbres de recherche' },
    { id:'t6', week:6,  title:'Graphes : représentations, BFS, DFS' },
    { id:'t7', week:7,  title:'Tris comparatifs : QuickSort, MergeSort, HeapSort' },
    { id:'t8', week:8,  title:'Programmation dynamique' },
  ],
  c3: [
    { id:'t1', week:1, title:'Modèle entité-relation et modèle relationnel' },
    { id:'t2', week:2, title:'Algèbre relationnelle' },
    { id:'t3', week:3, title:'SQL : SELECT, JOIN, agrégats' },
    { id:'t4', week:4, title:'SQL avancé : sous-requêtes, fenêtres' },
    { id:'t5', week:5, title:'Normalisation : 1NF, 2NF, 3NF, BCNF' },
    { id:'t6', week:6, title:'Transactions, concurrence et verrous' },
  ],
  c2: [
    { id:'t1', week:1, title:'Patterns de création : Factory, Singleton, Builder' },
    { id:'t2', week:2, title:'Patterns structurels : Adapter, Decorator, Proxy' },
    { id:'t3', week:3, title:'Patterns comportementaux : Observer, Strategy' },
    { id:'t4', week:4, title:'Méthodes agiles : Scrum & Kanban' },
    { id:'t5', week:5, title:'Tests unitaires et TDD' },
    { id:'t6', week:6, title:'CI/CD et DevOps' },
  ],
}

const BOOKS: Record<string, Book[]> = {
  c1: [
    { id:'b1', authors:'Cormen, Leiserson, Rivest, Stein', title:'Introduction to Algorithms', publisher:'MIT Press', year:2022 },
    { id:'b2', authors:'Sedgewick, Wayne', title:'Algorithms', publisher:'Addison-Wesley', year:2011 },
  ],
  c3: [
    { id:'b1', authors:'Ramakrishnan, Gehrke', title:'Database Management Systems', publisher:'McGraw-Hill', year:2019 },
    { id:'b2', authors:'Date, C.J.', title:'An Introduction to Database Systems', publisher:'Addison-Wesley', year:2020 },
  ],
  c2: [
    { id:'b1', authors:'Gamma, Helm, Johnson, Vlissides', title:'Design Patterns', publisher:'Addison-Wesley', year:1994 },
    { id:'b2', authors:'Martin, Robert C.', title:'Clean Code', publisher:'Prentice Hall', year:2008 },
  ],
}

const AVVISI: Record<string, Avviso[]> = {
  c1: [
    { id:'av1', subject:'TD5 déplacé — salle info B204', body:'Le TD du 20 mai est déplacé en salle B204 (bâtiment informatique). Venez avec vos ordinateurs portables.', urgent:true, sentAt:new Date('2026-05-15T10:30:00'), recipients:45 },
    { id:'av2', subject:'Rappel : contrôle continu semaine du 10 mars', body:'Le contrôle continu aura lieu lors du TD du 12 mars. Il portera sur les chapitres 1 à 4.', urgent:false, sentAt:new Date('2026-03-03T09:00:00'), recipients:45 },
    { id:'av3', subject:'Bienvenue en INFO301 !', body:'Bienvenue dans le cours d\'Algorithmique. Le syllabus et les premières ressources sont disponibles en ligne.', urgent:false, sentAt:new Date('2026-02-10T08:00:00'), recipients:45 },
  ],
  c3: [
    { id:'av1', subject:'Séance TP annulée — 18 mars', body:'La séance de TP du 18 mars est annulée pour cause de conférence. Une séance de rattrapage sera organisée.', urgent:true, sentAt:new Date('2026-03-15T16:00:00'), recipients:52 },
  ],
  c2: [],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DEGREE_BADGE: Record<DegreeType, string> = {
  bachelor: 'bg-blue-100 text-blue-700',
  master:   'bg-purple-100 text-purple-700',
}

function sessionStatusBadge(s: DemoSession) {
  if (isPast(s.date))
    return <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Terminé</span>
  if (isPast(s.deadline))
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Inscriptions fermées</span>
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Inscriptions ouvertes</span>
}

function verbaleBadge(state: VerbaleState) {
  const map = {
    incomplete: 'bg-amber-100 text-amber-700',
    ready:      'bg-emerald-100 text-emerald-700',
    published:  'bg-blue-100 text-blue-700',
  }
  const labels = { incomplete:'Verbale incomplet', ready:'Prêt à publier', published:'Publié' }
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[state]}`}>{labels[state]}</span>
}

const FILE_ICONS: Record<FileKind, string> = { slides:'📄', td:'📝', dataset:'📊', link:'🎥' }
const FILE_LABELS: Record<FileKind, string> = { slides:'Slides / Cours', td:'TD & TP', dataset:'Datasets', link:'Liens vidéo' }

// ─── Sub-components ───────────────────────────────────────────────────────────

/** TAB 1: EXAMS */
function ExamsTab({ courseId }: { courseId: string }) {
  const sessions = SESSIONS
    .filter(s => s.courseId === courseId)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  const [showNewForm, setShowNewForm] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Sessions d'examen ({sessions.length})
        </h3>
        <button
          onClick={() => setShowNewForm(v => !v)}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {showNewForm ? '✕ Annuler' : '+ Nouvel appello'}
        </button>
      </div>

      {showNewForm && (
        <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 p-6 text-center">
          <p className="text-sm font-medium text-indigo-700">Formulaire de création d'appello</p>
          <p className="mt-1 text-xs text-muted-foreground">(Mode démo — données non persistées)</p>
          <Link href={`/teacher/courses/${courseId}/exams/new`}
            className="mt-3 inline-block rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            Ouvrir le formulaire complet →
          </Link>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Aucune session d'examen programmée.
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => {
            const pct    = Math.round((s.enrolled / s.maxStudents) * 100)
            const vPct   = s.verbaleTotal > 0 ? Math.round((s.verbaleEntered / s.verbaleTotal) * 100) : 100
            return (
              <div key={s.id} className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">📅 {format(s.date, 'EEEE d MMMM yyyy · HH:mm', { locale: fr })}</p>
                    <p className="text-sm text-muted-foreground">📍 {s.room}</p>
                  </div>
                  {sessionStatusBadge(s)}
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>🗓️ Inscriptions jusqu'au {format(s.deadline, 'd MMM', { locale: fr })}
                    {!isPast(s.deadline) && <span className="ml-1 text-xs">({formatDistanceToNow(s.deadline, { locale: fr, addSuffix: true })})</span>}
                  </span>
                  <span>👥 {s.enrolled}/{s.maxStudents} inscrits ({pct}%)</span>
                </div>
                {isPast(s.date) && (
                  <div className="mt-3 rounded-lg bg-muted/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Verbale</span>
                      {verbaleBadge(s.verbaleState)}
                    </div>
                    {s.verbaleTotal > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{s.verbaleEntered}/{s.verbaleTotal} notes</span><span>{vPct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full ${vPct===100 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width:`${vPct}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Link href={`/teacher/courses/${courseId}/verbale/${s.id}`}
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    📝 Verbale
                  </Link>
                  <Link href={`/teacher/exams`}
                    className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent">
                    👥 Liste inscrits
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** TAB 2: MATÉRIEL */
function MaterialTab({ courseId, students }: { courseId: string; students: number }) {
  const [files, setFiles] = useState<DemoFile[]>(FILES.filter(f => f.courseId === courseId))
  const [isDragging, setIsDragging] = useState(false)
  const [uploadToast, setUploadToast] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function showToast(msg: string) {
    setUploadToast(msg)
    setTimeout(() => setUploadToast(null), 3000)
  }

  function simulateUpload(name: string, kind: FileKind) {
    const newFile: DemoFile = {
      id: `uf${Date.now()}`, courseId, kind, name,
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      uploadedAt: new Date(), url: '#',
    }
    setFiles(prev => [...prev, newFile])
    showToast(`"${name}" ajouté avec succès`)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) simulateUpload(file.name, 'slides')
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) simulateUpload(file.name, 'slides')
    e.target.value = ''
  }

  function removeFile(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id))
    showToast('Fichier supprimé')
  }

  const grouped = (['slides','td','dataset','link'] as FileKind[]).map(k => ({
    kind: k, items: files.filter(f => f.kind === k),
  })).filter(g => g.items.length > 0)

  return (
    <div className="space-y-5">
      {uploadToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          {uploadToast}
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={[
          'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30',
        ].join(' ')}
      >
        <p className="text-3xl">☁️</p>
        <p className="mt-2 text-sm font-medium">Glisser-déposer des fichiers ici</p>
        <p className="mt-0.5 text-xs text-muted-foreground">ou cliquer pour parcourir — PDF, XLSX, CSV, MP4, liens</p>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFileInput} />
      </div>

      {/* File groups */}
      {grouped.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">Aucune ressource déposée.</p>
      ) : (
        grouped.map(({ kind, items }) => (
          <div key={kind}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {FILE_ICONS[kind]} {FILE_LABELS[kind]} ({items.length})
            </p>
            <div className="overflow-hidden rounded-xl border">
              {items.map((f, i) => (
                <div key={f.id} className={`flex items-center gap-3 px-4 py-3 ${i < items.length-1 ? 'border-b' : ''}`}>
                  <span className="shrink-0 text-lg">{FILE_ICONS[f.kind]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.size && `${f.size} · `}
                      Ajouté le {format(f.uploadedAt, 'd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {kind === 'link'
                      ? <a href={f.url} target="_blank" rel="noopener noreferrer"
                          className="rounded bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200">
                          Ouvrir
                        </a>
                      : <button className="rounded bg-muted px-2.5 py-1 text-xs font-medium hover:bg-accent">
                          ↓ Télécharger
                        </button>
                    }
                    <button onClick={() => removeFile(f.id)}
                      className="rounded bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <p className="text-xs text-muted-foreground">
        Ces ressources sont visibles par les {students} étudiants inscrits au cours.
      </p>
    </div>
  )
}

/** TAB 3: SYLLABUS */
function SyllabusTab({ courseId }: { courseId: string }) {
  const [modalities, setModalities] = useState<Modality[]>(MODALITIES[courseId] ?? [])
  const [topics, setTopics]         = useState<Topic[]>(TOPICS[courseId] ?? [])
  const [books, setBooks]           = useState<Book[]>(BOOKS[courseId] ?? [])
  const [editMod, setEditMod]       = useState<string | null>(null)
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newBookEntry, setNewBookEntry]   = useState({ authors:'', title:'', publisher:'', year: new Date().getFullYear() })
  const [toast, setToast]           = useState<string | null>(null)
  const [showNewBook, setShowNewBook] = useState(false)

  function showT(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  function updatePct(id: string, val: number) {
    setModalities(prev => prev.map(m => m.id === id ? { ...m, pct: val } : m))
  }

  function addTopic() {
    if (!newTopicTitle.trim()) return
    const next = (topics[topics.length - 1]?.week ?? 0) + 1
    setTopics(prev => [...prev, { id:`t${Date.now()}`, week:next, title:newTopicTitle.trim() }])
    setNewTopicTitle('')
    showT('Séance ajoutée')
  }

  function removeTopic(id: string) { setTopics(prev => prev.filter(t => t.id !== id)) }

  function addBook() {
    if (!newBookEntry.title.trim()) return
    setBooks(prev => [...prev, { id:`b${Date.now()}`, ...newBookEntry }])
    setNewBookEntry({ authors:'', title:'', publisher:'', year: new Date().getFullYear() })
    setShowNewBook(false)
    showT('Ouvrage ajouté')
  }

  function removeBook(id: string) { setBooks(prev => prev.filter(b => b.id !== id)) }

  const totalPct = modalities.reduce((s, m) => s + m.pct, 0)

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>
      )}

      {/* Modalités */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Modalités d'examen</h3>
          <span className={`text-xs font-medium ${totalPct === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
            Total : {totalPct}% {totalPct !== 100 && '⚠️ doit être 100%'}
          </span>
        </div>
        <div className="space-y-2">
          {modalities.map(m => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3">
              {editMod === m.id ? (
                <>
                  <input type="number" min={0} max={100} value={m.pct}
                    onChange={e => updatePct(m.id, Number(e.target.value))}
                    className="w-16 rounded border bg-background px-2 py-1 text-center text-sm font-bold" />
                  <span className="text-sm font-bold text-muted-foreground">%</span>
                  <span className="flex-1 text-sm">{m.label}</span>
                  <button onClick={() => setEditMod(null)} className="text-xs text-emerald-600 hover:underline">✓ OK</button>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                    <span className="text-sm font-bold text-indigo-700">{m.pct}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.detail}</p>
                  </div>
                  <button onClick={() => setEditMod(m.id)} className="text-xs text-muted-foreground hover:text-foreground">✏️</button>
                </>
              )}
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          {modalities.map(m => (
            <div key={m.id} className="inline-block h-full bg-indigo-400" style={{ width:`${m.pct}%` }} />
          ))}
        </div>
      </section>

      {/* Programme */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Programme du cours</h3>
        </div>
        <div className="space-y-1.5">
          {topics.map(t => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg border p-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                {t.week}
              </span>
              <p className="flex-1 text-sm">{t.title}</p>
              <button onClick={() => removeTopic(t.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input type="text" placeholder="Titre de la séance…" value={newTopicTitle}
            onChange={e => setNewTopicTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTopic()}
            className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm" />
          <button onClick={addTopic}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            + Séance
          </button>
        </div>
      </section>

      {/* Bibliographie */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Bibliographie</h3>
          <button onClick={() => setShowNewBook(v => !v)}
            className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium hover:bg-accent">
            + Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {books.map(b => (
            <div key={b.id} className="flex items-start gap-3 rounded-lg border p-3">
              <span className="mt-0.5 text-lg">📘</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.authors} · {b.publisher}, {b.year}</p>
              </div>
              <button onClick={() => removeBook(b.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
        {showNewBook && (
          <div className="mt-3 space-y-2 rounded-lg border border-dashed p-3">
            <input type="text" placeholder="Auteur(s)" value={newBookEntry.authors}
              onChange={e => setNewBookEntry(p => ({ ...p, authors: e.target.value }))}
              className="w-full rounded border bg-background px-2 py-1 text-sm" />
            <input type="text" placeholder="Titre de l'ouvrage *" value={newBookEntry.title}
              onChange={e => setNewBookEntry(p => ({ ...p, title: e.target.value }))}
              className="w-full rounded border bg-background px-2 py-1 text-sm" />
            <div className="flex gap-2">
              <input type="text" placeholder="Éditeur" value={newBookEntry.publisher}
                onChange={e => setNewBookEntry(p => ({ ...p, publisher: e.target.value }))}
                className="flex-1 rounded border bg-background px-2 py-1 text-sm" />
              <input type="number" placeholder="Année" value={newBookEntry.year}
                onChange={e => setNewBookEntry(p => ({ ...p, year: Number(e.target.value) }))}
                className="w-20 rounded border bg-background px-2 py-1 text-sm" />
            </div>
            <div className="flex gap-2">
              <button onClick={addBook}
                className="flex-1 rounded-md bg-indigo-600 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                Ajouter
              </button>
              <button onClick={() => setShowNewBook(false)}
                className="flex-1 rounded-md border py-1.5 text-xs">Annuler</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

/** TAB 4: AVVISI */
function AvvisiTab({ courseId, courseName, students }: { courseId: string; courseName: string; students: number }) {
  const [avvisi, setAvvisi]   = useState<Avviso[]>(AVVISI[courseId] ?? [])
  const [subject, setSubject] = useState('')
  const [body, setBody]       = useState('')
  const [urgent, setUrgent]   = useState(false)
  const [toast, setToast]     = useState<string | null>(null)

  function send() {
    if (!subject.trim() || !body.trim()) return
    const n: Avviso = {
      id: `av${Date.now()}`, subject: subject.trim(), body: body.trim(),
      urgent, sentAt: new Date(), recipients: students,
    }
    setAvvisi(prev => [n, ...prev])
    setSubject(''); setBody(''); setUrgent(false)
    setToast(`📨 Annonce envoyée à ${students} étudiant${students>1?'s':''} !`)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-emerald-700 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>
      )}

      {/* Compose */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Envoyer une annonce
        </h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Objet</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="ex: Cours du 3 juin déplacé en salle B204"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Message</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={4}
              placeholder="Texte de l'annonce visible par les étudiants…"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <div onClick={() => setUrgent(v => !v)}
                className={`relative h-5 w-9 rounded-full transition-colors ${urgent ? 'bg-red-500' : 'bg-muted'}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${urgent ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className={urgent ? 'font-semibold text-red-600' : 'text-muted-foreground'}>
                {urgent ? '⚠️ Marquer comme urgent' : 'Normal'}
              </span>
            </label>
            <button
              onClick={send}
              disabled={!subject.trim() || !body.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              📨 Envoyer à {students} étudiant{students>1?'s':''}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Historique ({avvisi.length})
        </h3>
        {avvisi.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune annonce envoyée.</p>
        ) : (
          <div className="space-y-3">
            {avvisi.map(a => (
              <div key={a.id} className={`rounded-xl border p-4 ${a.urgent ? 'border-red-200 bg-red-50/50' : 'bg-card'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {a.urgent && <span className="shrink-0 text-sm">⚠️</span>}
                      <p className="font-medium text-sm truncate">{a.subject}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.body}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">{format(a.sentAt, 'd MMM yyyy', { locale: fr })}</p>
                    <p className="text-xs text-muted-foreground">{a.recipients} dest.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CourseDetail({ courseId }: { courseId: string }) {
  const course  = COURSES[courseId] ?? FALLBACK_COURSE
  const [tab, setTab] = useState<CourseTab>('exams')

  const pendingGrades = SESSIONS
    .filter(s => s.courseId === courseId && s.verbaleState !== 'published')
    .reduce((n, s) => n + (s.verbaleTotal - s.verbaleEntered), 0)

  const TABS: Array<{ id: CourseTab; label: string }> = [
    { id:'exams',    label:'Examens & Sessions' },
    { id:'material', label:'Matériel pédagogique' },
    { id:'syllabus', label:'Syllabus' },
    { id:'avvisi',   label:'Avvisi (Annonces)' },
  ]

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/teacher/courses" className="hover:text-foreground">Mes cours</Link>
        <span>›</span>
        <span className="font-medium text-foreground">{course.name}</span>
      </nav>

      {/* Course header */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{course.name}</h1>
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">{course.code}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DEGREE_BADGE[course.degreeType]}`}>
                {course.degreeType === 'master' ? 'Master' : 'Licence'}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {course.degreeName} · Année {course.year} · Semestre {course.semester}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{course.cfu}</p>
            <p className="text-xs text-muted-foreground">CFU</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          <span>👨‍🎓 {course.students} étudiants</span>
          {pendingGrades > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              ⚠️ {pendingGrades} note{pendingGrades>1?'s':''} à saisir
            </span>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/teacher/courses/${courseId}/elearning`}
          className="rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
          🖥 E-Learning
        </Link>
        <button onClick={() => setTab('avvisi')}
          className="rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
          📢 Envoyer une annonce
        </button>
      </div>

      {/* Tab bar */}
      <div className="border-b">
        <div className="-mb-px flex gap-0.5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={[
                'shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                tab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              ].join(' ')}>
              {t.label}
              {t.id === 'avvisi' && (AVVISI[courseId]?.length ?? 0) > 0 && (
                <span className="ml-1.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  {AVVISI[courseId]?.length ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'exams'    && <ExamsTab courseId={courseId} />}
      {tab === 'material' && <MaterialTab courseId={courseId} students={course.students} />}
      {tab === 'syllabus' && <SyllabusTab courseId={courseId} />}
      {tab === 'avvisi'   && <AvvisiTab courseId={courseId} courseName={course.name} students={course.students} />}
    </div>
  )
}

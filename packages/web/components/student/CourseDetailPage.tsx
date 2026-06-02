'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudentElearningCourse } from '@/lib/hooks/useElearning'

// ─── Types ────────────────────────────────────────────────────────────────────
type CourseTab = 'overview' | 'material' | 'videos' | 'calendar'

// ─── Données de démo ─────────────────────────────────────────────────────────
const DEMO_COURSE = {
  name:         'Programmation Orientée Objet',
  code:         'INF201',
  cfu:          6,
  teacher:      'Prof. Bianchi Laura',
  teacherEmail: 'bianchi.laura@unigest.fr',
  syllabus: `Ce cours introduit les concepts fondamentaux de la programmation orientée objet (POO) : classes, objets, héritage, polymorphisme et encapsulation. À l'issue du cours, l'étudiant sera capable de concevoir et implémenter des applications Java robustes en appliquant les design patterns courants.`,
  prerequisites: ['Programmation impérative (C/Python)', 'Bases de l\'algorithmique'],
  examMode: [
    { label: 'Projet Java',         pct: 50, note: 'En groupe de 2–3, rendu fin de semestre' },
    { label: 'Examen écrit',        pct: 30, note: '2h — QCM + questions ouvertes' },
    { label: 'Soutenance orale',    pct: 20, note: '15 min de présentation du projet' },
  ],
  announcements: [
    { date: '2025-05-20', author: 'Prof. Bianchi Laura', text: 'Le cours du vendredi 23 mai est annulé. Cours de rattrapage mardi 27 mai salle T2 à 14h00.' },
    { date: '2025-05-10', author: 'Prof. Bianchi Laura', text: 'La date limite pour rendre le projet a été repoussée au 15 juin. Merci de mettre à jour vos repos.' },
    { date: '2025-04-28', author: 'Prof. Bianchi Laura', text: 'Les corrigés du TD3 sont disponibles dans le dossier Annales.' },
  ],
  folders: [
    {
      id: 'slides', icon: '📄', label: 'Leçons / Slides',
      files: [
        { name: 'Semaine 1 — Introduction à la POO.pdf',       size: '2.1 Mo', date: '2025-02-03' },
        { name: 'Semaine 2 — Classes et Objets.pdf',            size: '3.4 Mo', date: '2025-02-10' },
        { name: 'Semaine 3 — Héritage et Polymorphisme.pdf',    size: '4.0 Mo', date: '2025-02-17' },
        { name: 'Semaine 4 — Interfaces et Classes Abstraites.pdf', size: '2.8 Mo', date: '2025-02-24' },
        { name: 'Semaine 5 — Design Patterns (Singleton, Factory).pdf', size: '5.1 Mo', date: '2025-03-03' },
        { name: 'Semaine 6 — Collections et Génériques.pdf',    size: '3.2 Mo', date: '2025-03-10' },
      ],
    },
    {
      id: 'td', icon: '📝', label: 'TD / Projets',
      files: [
        { name: 'TD1 — Modélisation UML.pdf',      size: '1.2 Mo', date: '2025-02-05' },
        { name: 'TD2 — Héritage Pratique.pdf',      size: '0.9 Mo', date: '2025-02-12' },
        { name: 'TD3 — Patterns et Refactoring.pdf', size: '1.5 Mo', date: '2025-03-01' },
        { name: 'Cahier des charges Projet Final.pdf', size: '0.6 Mo', date: '2025-03-15' },
        { name: 'Dataset Projet — BibliothèqueApp.zip', size: '8.4 Mo', date: '2025-03-15' },
      ],
    },
    {
      id: 'annales', icon: '📋', label: 'Annales',
      files: [
        { name: 'Examen 2024 — Session Juin.pdf',      size: '0.8 Mo', date: '2024-06-15' },
        { name: 'Examen 2024 — Session Septembre.pdf', size: '0.7 Mo', date: '2024-09-10' },
        { name: 'Examen 2023 — Session Juin (corrigé).pdf', size: '1.1 Mo', date: '2023-06-20' },
        { name: 'Examen 2023 — Session Septembre.pdf', size: '0.9 Mo', date: '2023-09-08' },
      ],
    },
  ],
  videos: [
    { date: '2025-05-14', title: 'Cours 9 — Design Patterns avancés', duration: '1h28', url: '#' },
    { date: '2025-05-07', title: 'Cours 8 — Gestion des exceptions',  duration: '1h15', url: '#' },
    { date: '2025-04-30', title: 'Cours 7 — Generics & Collections',  duration: '1h32', url: '#' },
    { date: '2025-04-23', title: 'Cours 6 — Interfaces vs Classes Abstraites', duration: '1h20', url: '#' },
  ],
  links: [
    { label: 'Repo GitHub du cours',   url: '#', icon: '💻' },
    { label: 'Serveur Discord classe', url: '#', icon: '💬' },
    { label: 'Documentation Java 21',  url: '#', icon: '📖' },
    { label: 'IntelliJ IDEA (gratuit étudiants)', url: '#', icon: '🛠' },
  ],
  schedule: [
    { date: '2025-05-28', time: '09:00–11:00', room: 'Labo 3', type: 'cours', title: 'Cours 10 — Multithreading' },
    { date: '2025-05-30', time: '14:00–15:30', room: 'Salle 12', type: 'td',   title: 'TD4 — Threads pratique' },
    { date: '2025-06-04', time: '09:00–11:00', room: 'Labo 3', type: 'cours', title: 'Cours 11 — Révisions' },
    { date: '2025-06-15', time: '23:59',        room: '—',       type: 'deadline', title: '📌 Rendu Projet Final' },
    { date: '2025-06-20', time: '10:00–12:00', room: 'Amphi B', type: 'exam',  title: '🎓 Examen écrit' },
  ],
}

// ─── Modal Contact Prof ───────────────────────────────────────────────────────
function ContactProfModal({
  teacher, email, courseCode, courseName,
  onClose,
}: {
  teacher: string; email: string; courseCode: string; courseName: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-background border shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">📧 Contacter {teacher}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">À</label>
            <p className="mt-1 rounded-lg bg-muted px-3 py-2 text-sm">{email}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Objet</label>
            <p className="mt-1 rounded-lg bg-muted px-3 py-2 text-sm">[{courseCode}] Question — {courseName}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Message</label>
            <textarea
              rows={5}
              defaultValue={`Bonjour Professeur,\n\nJe me permets de vous contacter au sujet du cours ${courseName}.\n\n[Votre question ici]\n\nCordialement,\nDemo Étudiant`}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors">Annuler</button>
          <a
            href={`mailto:${email}?subject=[${courseCode}] Question — ${courseName}`}
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Envoyer →
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Onglet A : Vue d'ensemble ────────────────────────────────────────────────
function OverviewTab({ course }: { course: typeof DEMO_COURSE }) {
  return (
    <div className="space-y-6">
      {/* Syllabus */}
      <section className="rounded-2xl border bg-card p-6 space-y-3">
        <h2 className="font-semibold">📋 Syllabus</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{course.syllabus}</p>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Prérequis</p>
          <ul className="space-y-1">
            {course.prerequisites.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Modalités d'examen */}
      <section className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold">🎓 Modalités d'examen</h2>
        <div className="space-y-3">
          {course.examMode.map((m) => (
            <div key={m.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{m.label}</span>
                <span className="font-bold text-primary">{m.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${m.pct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{m.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Annonces */}
      <section className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold">📢 Annonces du professeur</h2>
        <div className="space-y-3">
          {course.announcements.map((a, i) => (
            <div key={i} className="flex gap-3 rounded-xl bg-muted/50 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm">
                📌
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold">{a.author}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Onglet B : Matériel Didactique ──────────────────────────────────────────
function MaterialTab({ course }: { course: typeof DEMO_COURSE }) {
  const [openFolder, setOpenFolder] = useState<string>('slides')

  const totalFiles = course.folders.reduce((s, f) => s + f.files.length, 0)

  return (
    <div className="space-y-4">
      {/* Bouton tout télécharger */}
      <div className="flex items-center justify-between rounded-2xl border bg-primary/5 border-primary/20 px-5 py-3">
        <div>
          <p className="text-sm font-semibold">Tout le matériel du cours</p>
          <p className="text-xs text-muted-foreground">{totalFiles} fichiers</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
          <span>📦</span> Tout télécharger (.zip)
        </button>
      </div>

      {/* Dossiers */}
      {course.folders.map((folder) => {
        const isOpen = openFolder === folder.id
        return (
          <div key={folder.id} className="rounded-2xl border bg-card overflow-hidden">
            {/* Header dossier */}
            <button
              onClick={() => setOpenFolder(isOpen ? '' : folder.id)}
              className="flex w-full items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{folder.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold">{folder.label}</p>
                  <p className="text-xs text-muted-foreground">{folder.files.length} fichier{folder.files.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <span className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Contenu */}
            {isOpen && (
              <div className="border-t divide-y">
                {folder.files.map((file) => (
                  <div key={file.name} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">
                        {file.name.endsWith('.pdf') ? '📄' : file.name.endsWith('.zip') ? '📦' : '📎'}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{file.size} · {new Date(file.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <button className="ml-3 shrink-0 rounded-lg border px-3 py-1 text-xs hover:bg-accent transition-colors">
                      ↓ Télécharger
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Onglet C : Cours Enregistrés & Liens ────────────────────────────────────
function VideosTab({ course }: { course: typeof DEMO_COURSE }) {
  return (
    <div className="space-y-6">
      {/* Enregistrements */}
      <section className="space-y-3">
        <h2 className="font-semibold">🎥 Cours enregistrés</h2>
        <div className="space-y-2">
          {course.videos.map((v, i) => (
            <a
              key={i}
              href={v.url}
              className="flex items-center gap-4 rounded-2xl border bg-card px-5 py-3.5 hover:border-primary/40 hover:bg-muted/30 transition-all group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg group-hover:bg-primary/20 transition-colors">
                ▶
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">{v.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(v.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} · {v.duration}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground group-hover:text-primary">→</span>
            </a>
          ))}
        </div>
      </section>

      {/* Liens utiles */}
      <section className="space-y-3">
        <h2 className="font-semibold">🔗 Liens utiles</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {course.links.map((l, i) => (
            <a
              key={i}
              href={l.url}
              className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 hover:border-primary/40 hover:bg-muted/30 transition-all group"
            >
              <span className="text-xl">{l.icon}</span>
              <p className="text-sm font-medium group-hover:text-primary transition-colors">{l.label}</p>
              <span className="ml-auto text-muted-foreground text-xs">↗</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Onglet D : Calendrier & Échéances ───────────────────────────────────────
const EVENT_STYLE: Record<string, string> = {
  cours:    'border-blue-300  bg-blue-50  text-blue-800',
  td:       'border-green-300 bg-green-50 text-green-800',
  exam:     'border-red-300   bg-red-50   text-red-800',
  deadline: 'border-amber-300 bg-amber-50 text-amber-800',
}

function CalendarTab({ course }: { course: typeof DEMO_COURSE }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">📅 Prochains cours & Échéances</h2>
      <div className="space-y-3">
        {course.schedule.map((ev, i) => (
          <div key={i} className={`flex items-start gap-4 rounded-2xl border px-5 py-4 ${EVENT_STYLE[ev.type] ?? ''}`}>
            {/* Date */}
            <div className="shrink-0 text-center min-w-[48px]">
              <p className="text-[11px] font-semibold uppercase opacity-70">
                {new Date(ev.date).toLocaleDateString('fr-FR', { month: 'short' })}
              </p>
              <p className="text-2xl font-bold leading-tight">
                {new Date(ev.date).getDate()}
              </p>
            </div>
            {/* Infos */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{ev.title}</p>
              <p className="text-xs opacity-70 mt-0.5">
                {ev.time !== '23:59' ? `${ev.time}` : 'Deadline minuit'}
                {ev.room !== '—' && ` · ${ev.room}`}
              </p>
            </div>
            <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize opacity-80">
              {ev.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="flex gap-2">
        {[1,2,3].map(i => <Skeleton key={i} className="h-9 w-32 rounded-xl" />)}
      </div>
      <Skeleton className="h-[400px] rounded-2xl" />
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function CourseDetailPage({ ecId, defaultTab = 'overview' }: { ecId: string; defaultTab?: CourseTab }) {
  const [activeTab, setActiveTab]       = useState<CourseTab>(defaultTab)
  const [showContact, setShowContact]   = useState(false)
  const { data: rawCourse, isLoading }  = useStudentElearningCourse(ecId)

  if (isLoading) return <DetailSkeleton />

  // Utilise les données Supabase si dispo, sinon démo
  const course = rawCourse
    ? {
        ...DEMO_COURSE,
        name:         rawCourse.courses?.name   ?? DEMO_COURSE.name,
        code:         rawCourse.courses?.code   ?? DEMO_COURSE.code,
        cfu:          rawCourse.courses?.cfu    ?? DEMO_COURSE.cfu,
        teacher:      rawCourse.courses?.teachers?.profiles
          ? `${rawCourse.courses.teachers.profiles.first_name} ${rawCourse.courses.teachers.profiles.last_name}`
          : DEMO_COURSE.teacher,
        teacherEmail: rawCourse.courses?.teachers?.profiles?.email ?? DEMO_COURSE.teacherEmail,
      }
    : DEMO_COURSE

  const tabs: { key: CourseTab; label: string }[] = [
    { key: 'overview',  label: '📋 Vue d\'ensemble'  },
    { key: 'material',  label: '📁 Matériel'          },
    { key: 'videos',    label: '🎥 Cours & Liens'     },
    { key: 'calendar',  label: '📅 Calendrier'        },
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card px-6 py-5 space-y-4">
        {/* Titre + métadonnées */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{course.code}</span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{course.cfu} CFU</span>
            </div>
            <h1 className="text-xl font-bold">{course.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">👤 {course.teacher}</p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowContact(true)}
              className="flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              📧 Contacter le prof
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className="flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              📝 S'inscrire à l'examen
            </button>
            <button
              className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              👥 Espace Groupe
            </button>
          </div>
        </div>
      </div>

      {/* ── Onglets ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-xl bg-muted p-1 w-fit overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Contenu ────────────────────────────────────────────── */}
      {activeTab === 'overview'  && <OverviewTab  course={course} />}
      {activeTab === 'material'  && <MaterialTab  course={course} />}
      {activeTab === 'videos'    && <VideosTab    course={course} />}
      {activeTab === 'calendar'  && <CalendarTab  course={course} />}

      {/* ── Modal contact ──────────────────────────────────────── */}
      {showContact && (
        <ContactProfModal
          teacher={course.teacher}
          email={course.teacherEmail}
          courseCode={course.code}
          courseName={course.name}
          onClose={() => setShowContact(false)}
        />
      )}
    </div>
  )
}

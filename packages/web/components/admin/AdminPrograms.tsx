'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type ProgramLevel = 'L1-L2-L3' | 'M1-M2' | 'Doctorat'
type ProgramTab   = 'students' | 'teachers' | 'curriculum' | 'exams' | 'kpi'

interface Program {
  id:            string
  name:          string
  code:          string
  level:         ProgramLevel
  department:    string
  director:      string
  totalStudents: number
  retentionRate: number
  avgGradYears:  number
  trend:         number[]   // inscriptions par année
}

interface ProgramStudent {
  id:          string
  matricule:   string
  name:        string
  year:        string
  cfuAcquired: number
  cfuTotal:    number
  average:     number | undefined
  atRisk:      boolean
}

interface TeacherAssignment {
  name:         string
  subject:      string
  subjectCode:  string
  contract:     'Titulaire' | 'Contractuel' | 'Vacataire' | 'Invité'
  hoursPlanned: number
  hoursDone:    number
  role:         'responsable' | 'enseignant'
}

interface CourseUnit {
  code:             string
  name:             string
  cfu:              number
  year:             number
  semester:         number
  teacher:          string
  syllabusComplete: boolean
  examMode:         string
}

interface ExamResult {
  courseCode: string
  courseName: string
  session:    string
  passRate:   number
  avgGrade:   number
  totalTook:  number
  alert:      boolean
}

// ─── Demo Programs ────────────────────────────────────────────────────────────
const PROGRAMS: Program[] = [
  {
    id: 'p1', name: 'Licence Informatique', code: 'LIC-INFO', level: 'L1-L2-L3',
    department: 'Informatique', director: 'Prof. Jean Martin',
    totalStudents: 342, retentionRate: 78, avgGradYears: 3.4,
    trend: [290, 310, 325, 342],
  },
  {
    id: 'p2', name: 'Master Informatique', code: 'MST-INFO', level: 'M1-M2',
    department: 'Informatique', director: 'Prof. Jean Martin',
    totalStudents: 148, retentionRate: 85, avgGradYears: 2.2,
    trend: [122, 130, 141, 148],
  },
  {
    id: 'p3', name: 'Master Sciences des Données', code: 'MST-DATA', level: 'M1-M2',
    department: 'Sciences des Données', director: 'Dr. Amina Chaoui',
    totalStudents: 96, retentionRate: 88, avgGradYears: 2.1,
    trend: [62, 74, 88, 96],
  },
  {
    id: 'p4', name: 'Licence Mathématiques', code: 'LIC-MATH', level: 'L1-L2-L3',
    department: 'Mathématiques', director: 'Dr. Sophie Roux',
    totalStudents: 218, retentionRate: 71, avgGradYears: 3.8,
    trend: [230, 225, 220, 218],
  },
  {
    id: 'p5', name: 'Master Droit International', code: 'MST-DROIT', level: 'M1-M2',
    department: 'Droit', director: 'Dr. Paul Legrand',
    totalStudents: 74, retentionRate: 91, avgGradYears: 2.0,
    trend: [60, 65, 70, 74],
  },
  {
    id: 'p6', name: 'Licence Sciences des Données', code: 'LIC-DATA', level: 'L1-L2-L3',
    department: 'Sciences des Données', director: 'Dr. Amina Chaoui',
    totalStudents: 169, retentionRate: 74, avgGradYears: 3.2,
    trend: [130, 148, 158, 169],
  },
]

// ─── Demo detail data per program ────────────────────────────────────────────
const STUDENTS_BY_PROGRAM: Record<string, ProgramStudent[]> = {
  p1: [
    { id: 's1', matricule: 'MAT20240001', name: 'Camille Lefèvre',    year: 'L3', cfuAcquired: 152, cfuTotal: 180, average: 15.4, atRisk: false },
    { id: 's2', matricule: 'MAT20240046', name: 'Théo Richard',       year: 'L3', cfuAcquired: 120, cfuTotal: 180, average: 9.8,  atRisk: true  },
    { id: 's3', matricule: 'MAT20240099', name: 'Jade Fontaine',      year: 'L2', cfuAcquired: 60,  cfuTotal: 120, average: 12.1, atRisk: false },
    { id: 's4', matricule: 'MAT20240102', name: 'Noah Petit',         year: 'L2', cfuAcquired: 48,  cfuTotal: 120, average: 10.5, atRisk: true  },
    { id: 's5', matricule: 'MAT20240115', name: 'Emma Garcia',        year: 'L1', cfuAcquired: 0,   cfuTotal: 60,  average: undefined, atRisk: false },
    { id: 's6', matricule: 'MAT20240133', name: 'Lucas Chen',         year: 'L1', cfuAcquired: 0,   cfuTotal: 60,  average: undefined, atRisk: false },
    { id: 's7', matricule: 'MAT20230055', name: 'Inès Moreau',        year: 'L3', cfuAcquired: 168, cfuTotal: 180, average: 16.2, atRisk: false },
    { id: 's8', matricule: 'MAT20230088', name: 'Antoine Duval',      year: 'L2', cfuAcquired: 72,  cfuTotal: 120, average: 11.4, atRisk: true  },
  ],
  p2: [
    { id: 'm1', matricule: 'MAT20220011', name: 'Amélie Gros',        year: 'M2', cfuAcquired: 120, cfuTotal: 120, average: 16.8, atRisk: false },
    { id: 'm2', matricule: 'MAT20220034', name: 'Mohamed Ait Youssef', year: 'M2', cfuAcquired: 120, cfuTotal: 120, average: 15.2, atRisk: false },
    { id: 'm3', matricule: 'MAT20240001', name: 'Camille Lefèvre',    year: 'M1', cfuAcquired: 33,  cfuTotal: 60,  average: 15.4, atRisk: false },
    { id: 'm4', matricule: 'MAT20240088', name: 'Ryan Okonkwo',       year: 'M1', cfuAcquired: 18,  cfuTotal: 60,  average: 8.9,  atRisk: true  },
  ],
}

const TEACHERS_BY_PROGRAM: Record<string, TeacherAssignment[]> = {
  p1: [
    { name: 'Prof. Jean Martin',    subject: 'Algorithmes Avancés',   subjectCode: 'INFO301', contract: 'Titulaire',    hoursPlanned: 60, hoursDone: 60, role: 'responsable' },
    { name: 'Prof. Jean Martin',    subject: 'Intelligence Artificielle', subjectCode: 'INFO501', contract: 'Titulaire', hoursPlanned: 36, hoursDone: 30, role: 'enseignant' },
    { name: 'Dr. Amina Chaoui',     subject: 'Fondements Big Data',   subjectCode: 'DATA101', contract: 'Titulaire',    hoursPlanned: 36, hoursDone: 36, role: 'enseignant' },
    { name: 'Dr. Sophie Roux',      subject: 'Statistiques & ML',     subjectCode: 'MATH501', contract: 'Titulaire',    hoursPlanned: 30, hoursDone: 30, role: 'enseignant' },
    { name: 'Prof. Elena Visconti', subject: 'Cryptographie Avancée', subjectCode: 'INFO503', contract: 'Invité',       hoursPlanned: 36, hoursDone: 36, role: 'enseignant' },
    { name: 'Dr. Marc Dupont',      subject: 'Réseaux & Protocoles',  subjectCode: 'INFO201', contract: 'Vacataire',    hoursPlanned: 24, hoursDone: 12, role: 'enseignant' },
  ],
  p2: [
    { name: 'Prof. Jean Martin',    subject: 'Systèmes Distribués',   subjectCode: 'INFO502', contract: 'Titulaire',    hoursPlanned: 48, hoursDone: 48, role: 'responsable' },
    { name: 'Prof. Elena Visconti', subject: 'Cloud Computing',       subjectCode: 'INFO504', contract: 'Invité',       hoursPlanned: 24, hoursDone: 24, role: 'enseignant' },
    { name: 'Dr. Amina Chaoui',     subject: 'Machine Learning',      subjectCode: 'DATA104', contract: 'Titulaire',    hoursPlanned: 42, hoursDone: 38, role: 'enseignant' },
  ],
}

const CURRICULUM_BY_PROGRAM: Record<string, CourseUnit[]> = {
  p1: [
    { code: 'INFO101', name: 'Introduction à la Prog.',     cfu: 9,  year: 1, semester: 1, teacher: 'M. Leclerc',       syllabusComplete: true,  examMode: 'Écrit 2h' },
    { code: 'INFO102', name: 'Mathématiques Discrètes',     cfu: 6,  year: 1, semester: 1, teacher: 'Dr. Roux',          syllabusComplete: true,  examMode: 'Écrit 2h' },
    { code: 'INFO103', name: 'Architecture des Ordis',      cfu: 6,  year: 1, semester: 2, teacher: 'M. Bernard',        syllabusComplete: false, examMode: 'QCM + Pratique' },
    { code: 'INFO104', name: 'Systèmes d\'Exploitation',    cfu: 9,  year: 2, semester: 1, teacher: 'Prof. Martin',      syllabusComplete: true,  examMode: 'Écrit 3h' },
    { code: 'INFO201', name: 'Réseaux & Protocoles',        cfu: 6,  year: 2, semester: 1, teacher: 'Dr. Dupont',        syllabusComplete: false, examMode: 'TP noté' },
    { code: 'INFO202', name: 'Bases de Données',            cfu: 9,  year: 2, semester: 2, teacher: 'Mme. Fontaine',     syllabusComplete: true,  examMode: 'Projet + Écrit' },
    { code: 'INFO301', name: 'Algorithmes Avancés',         cfu: 9,  year: 3, semester: 1, teacher: 'Prof. Martin',      syllabusComplete: true,  examMode: 'Écrit 3h' },
    { code: 'INFO302', name: 'Génie Logiciel',              cfu: 6,  year: 3, semester: 1, teacher: 'M. Aubert',         syllabusComplete: false, examMode: 'Projet' },
    { code: 'INFO303', name: 'Mémoire de Licence',          cfu: 9,  year: 3, semester: 2, teacher: 'Directeur d\'études', syllabusComplete: true, examMode: 'Soutenance' },
  ],
  p2: [
    { code: 'INFO501', name: 'Intelligence Artificielle',   cfu: 9,  year: 1, semester: 1, teacher: 'Prof. Martin',      syllabusComplete: true,  examMode: 'Écrit 3h' },
    { code: 'INFO502', name: 'Systèmes Distribués',         cfu: 6,  year: 1, semester: 1, teacher: 'Prof. Martin',      syllabusComplete: true,  examMode: 'Projet' },
    { code: 'INFO503', name: 'Cryptographie Avancée',       cfu: 6,  year: 1, semester: 2, teacher: 'Prof. Visconti',    syllabusComplete: true,  examMode: 'Écrit 2h' },
    { code: 'INFO504', name: 'Cloud Computing',             cfu: 6,  year: 1, semester: 2, teacher: 'Prof. Visconti',    syllabusComplete: false, examMode: 'Lab pratique' },
    { code: 'INFO601', name: 'Thèse de Master',             cfu: 30, year: 2, semester: 2, teacher: 'Directeur de thèse', syllabusComplete: true,  examMode: 'Soutenance jury' },
  ],
}

const EXAMS_BY_PROGRAM: Record<string, ExamResult[]> = {
  p1: [
    { courseCode: 'INFO101', courseName: 'Introduction à la Prog.',  session: 'Janv. 2026', passRate: 82, avgGrade: 13.2, totalTook: 112, alert: false },
    { courseCode: 'INFO102', courseName: 'Mathématiques Discrètes',  session: 'Janv. 2026', passRate: 61, avgGrade: 10.8, totalTook: 108, alert: false },
    { courseCode: 'INFO201', courseName: 'Réseaux & Protocoles',     session: 'Janv. 2026', passRate: 44, avgGrade: 8.9,  totalTook: 95,  alert: true  },
    { courseCode: 'INFO301', courseName: 'Algorithmes Avancés',      session: 'Janv. 2026', passRate: 78, avgGrade: 12.7, totalTook: 88,  alert: false },
    { courseCode: 'INFO202', courseName: 'Bases de Données',         session: 'Janv. 2026', passRate: 88, avgGrade: 14.1, totalTook: 102, alert: false },
    { courseCode: 'INFO103', courseName: 'Architecture des Ordis',   session: 'Juin 2025',  passRate: 71, avgGrade: 11.9, totalTook: 118, alert: false },
  ],
  p2: [
    { courseCode: 'INFO501', courseName: 'Intelligence Artificielle', session: 'Janv. 2026', passRate: 87, avgGrade: 14.8, totalTook: 68, alert: false },
    { courseCode: 'INFO502', courseName: 'Systèmes Distribués',       session: 'Janv. 2026', passRate: 79, avgGrade: 13.4, totalTook: 65, alert: false },
    { courseCode: 'INFO503', courseName: 'Cryptographie Avancée',     session: 'Janv. 2026', passRate: 72, avgGrade: 12.1, totalTook: 61, alert: false },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function levelBadge(l: ProgramLevel) {
  const map: Record<ProgramLevel, string> = {
    'L1-L2-L3': 'bg-blue-100 text-blue-700',
    'M1-M2':    'bg-violet-100 text-violet-700',
    'Doctorat': 'bg-rose-100 text-rose-700',
  }
  return map[l]
}

function contractBadge(c: TeacherAssignment['contract']) {
  const map: Record<TeacherAssignment['contract'], string> = {
    Titulaire:   'bg-emerald-100 text-emerald-700',
    Contractuel: 'bg-blue-100 text-blue-700',
    Vacataire:   'bg-amber-100 text-amber-700',
    Invité:      'bg-violet-100 text-violet-700',
  }
  return map[c]
}

function passRateColor(r: number) {
  if (r >= 80) return 'text-emerald-600'
  if (r >= 60) return 'text-amber-600'
  return 'text-rose-600 font-bold'
}

function Minibar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
      </div>
      <span className="text-[10px] font-semibold w-6 text-right">{value}</span>
    </div>
  )
}

// ─── Tab: Students ────────────────────────────────────────────────────────────
function TabStudents({ program }: { program: Program }) {
  const students = STUDENTS_BY_PROGRAM[program.id] ?? []
  const [showAtRisk, setShowAtRisk] = useState(false)
  const [search, setSearch]         = useState('')

  const atRiskCount = students.filter(s => s.atRisk).length
  const visible     = students.filter(s => {
    if (showAtRisk && !s.atRisk) return false
    if (search) {
      const q = search.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.matricule.toLowerCase().includes(q)
    }
    return true
  })

  const byYear = ['L1','L2','L3','M1','M2'].map(y => ({
    year: y,
    count: students.filter(s => s.year === y).length,
  })).filter(y => y.count > 0)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-card p-4"><p className="text-2xl font-bold text-indigo-600">{program.totalStudents}</p><p className="text-xs text-muted-foreground">Inscrits total</p></div>
        <div className="rounded-xl border bg-card p-4"><p className="text-2xl font-bold text-emerald-600">{program.retentionRate}%</p><p className="text-xs text-muted-foreground">Taux de rétention</p></div>
        <div className="rounded-xl border bg-card p-4 cursor-pointer" onClick={() => setShowAtRisk(v => !v)}>
          <p className={`text-2xl font-bold ${atRiskCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{atRiskCount}</p>
          <p className="text-xs text-muted-foreground">Étudiants en décrochage</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex gap-1 flex-wrap">
            {byYear.map(y => (
              <span key={y.year} className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                {y.year}: {y.count}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Par année</p>
        </div>
      </div>

      {showAtRisk && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-center justify-between">
          <p className="text-sm text-rose-700 font-semibold">🚨 Filtre actif : {atRiskCount} étudiant{atRiskCount > 1 ? 's' : ''} en décrochage académique</p>
          <button onClick={() => setShowAtRisk(false)} className="text-xs text-rose-600 hover:underline">Tout voir</button>
        </div>
      )}

      <div className="flex gap-3 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher matricule ou nom…"
          className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800" />
        <button
          onClick={() => setShowAtRisk(v => !v)}
          className={`rounded-lg px-3 py-2 text-xs font-semibold border transition-colors ${showAtRisk ? 'bg-rose-600 text-white border-rose-600' : 'border-rose-300 text-rose-600 hover:bg-rose-50'}`}
        >
          🚨 Décrochage uniquement
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Étudiant</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground">Année</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">CFU</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground">Moyenne</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {visible.map(s => {
              const pct = Math.round((s.cfuAcquired / s.cfuTotal) * 100)
              return (
                <tr key={s.id} className={`hover:bg-muted/30 ${s.atRisk ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}`}>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-xs">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{s.matricule}</p>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">{s.year}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Minibar value={pct} color={pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-400'} />
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.cfuAcquired}/{s.cfuTotal}</p>
                  </td>
                  <td className={`px-4 py-2.5 text-center font-semibold text-sm ${
                    s.average === undefined ? 'text-slate-400' :
                    s.average >= 14 ? 'text-emerald-700' :
                    s.average >= 10 ? 'text-slate-700' : 'text-rose-600'
                  }`}>
                    {s.average !== undefined ? `${s.average.toFixed(1)}/20` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {s.atRisk
                      ? <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">⚠ Décrochage</span>
                      : <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">✓ Actif</span>
                    }
                  </td>
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">Aucun étudiant trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Données sur {students.length} étudiants chargés — {program.totalStudents} inscrits au total dans la filière.
      </p>
    </div>
  )
}

// ─── Tab: Teachers ────────────────────────────────────────────────────────────
function TabTeachers({ program }: { program: Program }) {
  const teachers = TEACHERS_BY_PROGRAM[program.id] ?? []
  const underload = teachers.filter(t => t.hoursDone < t.hoursPlanned * 0.8)

  return (
    <div className="space-y-4">
      {/* Director card */}
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-lg shrink-0">
          {program.director.split(' ').map(n => n.charAt(0)).slice(0,2).join('')}
        </div>
        <div>
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Responsable de filière</p>
          <p className="font-bold text-lg">{program.director}</p>
          <p className="text-xs text-muted-foreground">{program.department}</p>
        </div>
        <span className="ml-auto rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">DIRECTEUR</span>
      </div>

      {underload.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          ⚠ <strong>{underload.length} enseignant{underload.length > 1 ? 's' : ''}</strong> en retard sur leur charge horaire dans cette filière.
        </div>
      )}

      <div className="rounded-xl border overflow-hidden">
        <div className="border-b bg-slate-50 dark:bg-slate-800 px-4 py-2.5 grid grid-cols-5 gap-2">
          {['Enseignant','Matière','Contrat','Charge horaire','Statut'].map(h => (
            <span key={h} className="text-xs font-semibold text-muted-foreground">{h}</span>
          ))}
        </div>
        <div className="divide-y">
          {teachers.map((t, i) => {
            const pct  = Math.min(Math.round((t.hoursDone / t.hoursPlanned) * 100), 110)
            const late = t.hoursDone < t.hoursPlanned * 0.8
            return (
              <div key={i} className="grid grid-cols-5 gap-2 px-4 py-3 items-center hover:bg-muted/30">
                <div>
                  <p className="text-xs font-semibold">{t.name}</p>
                  {t.role === 'responsable' && (
                    <span className="text-[10px] font-bold text-rose-600">Responsable</span>
                  )}
                </div>
                <div>
                  <p className="text-xs">{t.subject}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{t.subjectCode}</p>
                </div>
                <div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${contractBadge(t.contract)}`}>{t.contract}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-400' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{t.hoursDone}/{t.hoursPlanned}h</span>
                  </div>
                </div>
                <div>
                  {late
                    ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">⚠ Retard</span>
                    : <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">✓ OK</span>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Curriculum ──────────────────────────────────────────────────────────
function TabCurriculum({ program }: { program: Program }) {
  const courses = CURRICULUM_BY_PROGRAM[program.id] ?? []
  const years   = [...new Set(courses.map(c => c.year))].sort()
  const incomplete = courses.filter(c => !c.syllabusComplete)

  return (
    <div className="space-y-4">
      {incomplete.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          ⚠ <strong>{incomplete.length} syllabus incomplet{incomplete.length > 1 ? 's' : ''}</strong> — les enseignants concernés doivent compléter leur programme avant le début des cours.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-2xl font-bold text-indigo-600">{courses.length}</p>
          <p className="text-xs text-muted-foreground">Matières au programme</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-2xl font-bold text-emerald-600">{courses.reduce((a,c) => a+c.cfu, 0)}</p>
          <p className="text-xs text-muted-foreground">CFU totaux</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className={`text-2xl font-bold ${incomplete.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {courses.filter(c => c.syllabusComplete).length}/{courses.length}
          </p>
          <p className="text-xs text-muted-foreground">Syllabus validés</p>
        </div>
      </div>

      {years.map(yr => (
        <div key={yr} className="rounded-xl border overflow-hidden">
          <div className="border-b bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2.5">
            <h3 className="font-semibold text-sm text-indigo-700">
              {program.level === 'M1-M2' ? `Master ${yr === 1 ? '1ère' : '2ème'} année` : `Licence ${yr}${yr === 1 ? 'ère' : 'ème'} année`}
            </h3>
          </div>
          {[1,2].map(sem => {
            const semCourses = courses.filter(c => c.year === yr && c.semester === sem)
            if (semCourses.length === 0) return null
            return (
              <div key={sem}>
                <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-b">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Semestre {sem}</p>
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    {semCourses.map(c => (
                      <tr key={c.code} className={`hover:bg-muted/30 ${!c.syllabusComplete ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-xs">{c.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{c.code}</p>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">{c.cfu} CFU</span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{c.teacher}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500 italic">{c.examMode}</td>
                        <td className="px-4 py-2.5 text-center">
                          {c.syllabusComplete
                            ? <span className="text-emerald-600 text-xs font-semibold">✓ Syllabus OK</span>
                            : <span className="text-amber-600 text-xs font-semibold">⚠ Incomplet</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Tab: Exams ───────────────────────────────────────────────────────────────
function TabExams({ program }: { program: Program }) {
  const exams  = EXAMS_BY_PROGRAM[program.id] ?? []
  const alerts = exams.filter(e => e.alert)
  const avgPass = Math.round(exams.reduce((a, e) => a + e.passRate, 0) / (exams.length || 1))

  return (
    <div className="space-y-4">
      {alerts.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-bold text-rose-700 mb-2">🔴 {alerts.length} examen{alerts.length > 1 ? 's' : ''} avec taux d'échec anormalement élevé</p>
          {alerts.map(e => (
            <div key={e.courseCode} className="flex items-center justify-between text-xs mt-1">
              <span className="text-rose-600">{e.courseCode} — {e.courseName}</span>
              <span className="font-bold text-rose-700">{e.passRate}% de réussite ({100 - e.passRate}% d'échec)</span>
            </div>
          ))}
          <p className="text-xs text-rose-600 mt-2 italic">→ Recommandation : réunion pédagogique avec l'enseignant responsable</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-2xl font-bold text-indigo-600">{exams.length}</p>
          <p className="text-xs text-muted-foreground">Examens évalués</p>
        </div>
        <div className={`rounded-xl border bg-card p-4`}>
          <p className={`text-2xl font-bold ${avgPass >= 75 ? 'text-emerald-600' : avgPass >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{avgPass}%</p>
          <p className="text-xs text-muted-foreground">Taux de réussite moyen</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className={`text-2xl font-bold ${alerts.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{alerts.length}</p>
          <p className="text-xs text-muted-foreground">Alertes pédagogiques</p>
        </div>
      </div>

      {/* Sessions */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold text-sm mb-3">📅 Calendrier des sessions d'examen</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Session hiver',    dates: '12 jan → 30 jan 2026',   status: 'Terminée',  cls: 'bg-slate-100 text-slate-600' },
            { name: 'Session été',      dates: '1 juin → 20 juin 2026',  status: 'À venir',   cls: 'bg-blue-100 text-blue-700' },
            { name: 'Session rattrapage', dates: '1 juil → 15 juil 2026', status: 'À venir',  cls: 'bg-amber-100 text-amber-700' },
          ].map(s => (
            <div key={s.name} className={`rounded-xl border p-3 ${s.cls}`}>
              <p className="font-semibold text-xs">{s.name}</p>
              <p className="text-[10px] mt-0.5">{s.dates}</p>
              <span className="mt-1 inline-block rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-bold">{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="border-b bg-slate-50 dark:bg-slate-800 px-4 py-2.5">
          <h3 className="font-semibold text-sm">Résultats par matière</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Matière</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground">Session</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground">Inscrits</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Taux réussite</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground">Moy.</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {exams.map(e => (
              <tr key={e.courseCode} className={`hover:bg-muted/30 ${e.alert ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}`}>
                <td className="px-4 py-2.5">
                  <p className="font-medium text-xs">{e.courseName}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{e.courseCode}</p>
                </td>
                <td className="px-4 py-2.5 text-center text-xs text-muted-foreground">{e.session}</td>
                <td className="px-4 py-2.5 text-center font-semibold">{e.totalTook}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className={`h-full rounded-full ${e.passRate >= 75 ? 'bg-emerald-500' : e.passRate >= 60 ? 'bg-amber-400' : 'bg-rose-500'}`}
                        style={{ width: `${e.passRate}%` }} />
                    </div>
                    <span className={`text-xs font-semibold ${passRateColor(e.passRate)}`}>{e.passRate}%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center font-semibold text-sm">{e.avgGrade.toFixed(1)}</td>
                <td className="px-4 py-2.5 text-center">
                  {e.alert && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">🔴 ALERTE</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab: KPI ─────────────────────────────────────────────────────────────────
function TabKPI({ program }: { program: Program }) {
  const years = ['2022-23', '2023-24', '2024-25', '2025-26']
  const maxTrend = Math.max(...program.trend)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Inscrits 2025-26',       value: program.totalStudents, color: 'text-indigo-600', suffix: '' },
          { label: 'Taux de rétention',       value: program.retentionRate, color: 'text-emerald-600', suffix: '%' },
          { label: 'Durée moy. obtention',    value: program.avgGradYears,  color: program.avgGradYears > 3.5 ? 'text-amber-600' : 'text-emerald-600', suffix: ' ans' },
          { label: 'Évolution (vs N-1)',       value: `+${program.trend[3]! - program.trend[2]!}`, color: 'text-emerald-600', suffix: '' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}{k.suffix}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Enrollment trend chart */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold text-sm mb-4">📈 Évolution des inscriptions</h3>
        <div className="flex items-end gap-4 h-28">
          {program.trend.map((count, i) => {
            const pct = Math.max(((count - (maxTrend * 0.6)) / (maxTrend * 0.4)) * 100, 5)
            const isLatest = i === program.trend.length - 1
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-indigo-600">{count}</span>
                <div
                  className={`w-full rounded-t-lg transition-all ${isLatest ? 'bg-rose-500' : 'bg-indigo-400'}`}
                  style={{ height: `${pct}%`, minHeight: '12%' }}
                />
                <span className="text-[10px] text-muted-foreground">{years[i]}</span>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {program.trend[3]! > program.trend[0]!
            ? `✅ Croissance de +${program.trend[3]! - program.trend[0]!} étudiants sur 4 ans (+${Math.round(((program.trend[3]! - program.trend[0]!) / program.trend[0]!) * 100)}%)`
            : `⚠ Légère baisse de ${program.trend[0]! - program.trend[3]!} étudiants sur 4 ans`
          }
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Graduation delay */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-sm mb-3">🎓 Délai moyen d'obtention du diplôme</h3>
          <div className="space-y-2">
            {[
              { label: 'En temps normal',    years: program.level === 'M1-M2' ? 2.0 : 3.0 },
              { label: 'Moyenne de la filière', years: program.avgGradYears },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{r.label}</span>
                  <span className={`font-semibold ${r.years > (program.level === 'M1-M2' ? 2.5 : 3.5) ? 'text-amber-600' : 'text-emerald-600'}`}>{r.years} ans</span>
                </div>
                <Minibar value={r.years} max={6} color={r.years > (program.level === 'M1-M2' ? 2.5 : 3.5) ? 'bg-amber-400' : 'bg-emerald-500'} />
              </div>
            ))}
          </div>
          {program.avgGradYears > (program.level === 'M1-M2' ? 2.5 : 3.5) && (
            <p className="text-xs text-amber-600 mt-2 italic">⚠ La durée moyenne dépasse la durée officielle — suivi renforcé recommandé.</p>
          )}
        </div>

        {/* Thesis stats */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold text-sm mb-3">📄 Mémoires & Thèses</h3>
          <div className="space-y-3">
            {[
              { label: 'En cours de rédaction', value: 12, color: 'text-blue-600' },
              { label: 'Soutenus cette année',  value: 8,  color: 'text-emerald-600' },
              { label: 'En attente de jury',    value: 3,  color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-xs">{s.label}</span>
                <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conseil d'administration export */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-700">Rapport pour Conseil d'Administration</p>
          <p className="text-xs text-indigo-600">Synthèse complète des KPI de la filière — format PDF/XLSX</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
            📥 Exporter PDF
          </button>
          <button className="rounded-lg border border-indigo-400 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
            📊 Exporter XLSX
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Program Detail View ──────────────────────────────────────────────────────
function ProgramDetail({ program, onBack }: { program: Program; onBack: () => void }) {
  const [tab, setTab] = useState<ProgramTab>('students')

  const tabs: { key: ProgramTab; label: string; icon: string }[] = [
    { key: 'students',   label: 'Étudiants',      icon: '👥' },
    { key: 'teachers',   label: 'Corps enseignant', icon: '👨‍🏫' },
    { key: 'curriculum', label: 'Maquette pédagogique', icon: '📚' },
    { key: 'exams',      label: 'Examens & Sessions', icon: '📆' },
    { key: 'kpi',        label: 'KPI & Performance', icon: '📈' },
  ]

  const students = STUDENTS_BY_PROGRAM[program.id] ?? []
  const atRisk   = students.filter(s => s.atRisk).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={onBack} className="mt-1 text-sm text-muted-foreground hover:text-foreground shrink-0">← Filières</button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{program.name}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${levelBadge(program.level)}`}>{program.level}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-mono text-slate-600">{program.code}</span>
          </div>
          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
            <span>🏛 {program.department}</span>
            <span>👤 {program.director}</span>
            <span>👥 {program.totalStudents} étudiants</span>
            {atRisk > 0 && <span className="text-rose-600 font-semibold">🚨 {atRisk} en décrochage</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? 'border-rose-600 text-rose-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'students'   && <TabStudents   program={program} />}
      {tab === 'teachers'   && <TabTeachers   program={program} />}
      {tab === 'curriculum' && <TabCurriculum program={program} />}
      {tab === 'exams'      && <TabExams      program={program} />}
      {tab === 'kpi'        && <TabKPI        program={program} />}
    </div>
  )
}

// ─── Programs List ────────────────────────────────────────────────────────────
export function AdminPrograms() {
  const [selected, setSelected] = useState<Program | undefined>(undefined)
  const [filter, setFilter]     = useState<ProgramLevel | 'all'>('all')
  const [search, setSearch]     = useState('')

  if (selected) {
    return <ProgramDetail program={selected} onBack={() => setSelected(undefined)} />
  }

  const visible = PROGRAMS.filter(p => {
    if (filter !== 'all' && p.level !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.department.toLowerCase().includes(q)
    }
    return true
  })

  const totalStudents = PROGRAMS.reduce((a, p) => a + p.totalStudents, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Filières</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tableau de bord pédagogique — étudiants, enseignants, maquettes, résultats</p>
        </div>
        <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
          + Créer une filière
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Filières actives',   value: PROGRAMS.length,    color: 'text-indigo-600' },
          { label: 'Étudiants inscrits', value: totalStudents,       color: 'text-emerald-600' },
          { label: 'Départements',       value: new Set(PROGRAMS.map(p => p.department)).size, color: 'text-violet-600' },
          { label: 'Rétention moyenne',  value: Math.round(PROGRAMS.reduce((a,p) => a + p.retentionRate, 0) / PROGRAMS.length) + '%', color: 'text-amber-600' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {(['all', 'L1-L2-L3', 'M1-M2', 'Doctorat'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              filter === f ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {f === 'all' ? 'Toutes les filières' : f}
          </button>
        ))}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une filière…"
          className="ml-auto rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800"
        />
      </div>

      {/* Programs grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map(p => {
          const trend      = p.trend[3]! - p.trend[2]!
          const students   = STUDENTS_BY_PROGRAM[p.id] ?? []
          const atRiskCount = students.filter(s => s.atRisk).length
          const exams      = EXAMS_BY_PROGRAM[p.id] ?? []
          const alertCount = exams.filter(e => e.alert).length

          return (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md cursor-pointer transition-shadow group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-base group-hover:text-rose-600 transition-colors">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.department}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${levelBadge(p.level)}`}>{p.level}</span>
              </div>

              {/* Mini trend bars */}
              <div className="flex items-end gap-1 h-10 mb-3">
                {p.trend.map((v, i) => {
                  const h = ((v - p.trend[0]! * 0.7) / (p.trend[0]! * 0.5)) * 100
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${i === p.trend.length - 1 ? 'bg-rose-400' : 'bg-slate-200 dark:bg-slate-700'}`}
                      style={{ height: `${Math.max(h, 20)}%` }}
                    />
                  )
                })}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 text-center border-t pt-3 mt-1">
                <div>
                  <p className="text-sm font-bold text-indigo-600">{p.totalStudents}</p>
                  <p className="text-[10px] text-muted-foreground">Inscrits</p>
                </div>
                <div>
                  <p className={`text-sm font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trend >= 0 ? '+' : ''}{trend}
                  </p>
                  <p className="text-[10px] text-muted-foreground">vs N-1</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-600">{p.retentionRate}%</p>
                  <p className="text-[10px] text-muted-foreground">Rétention</p>
                </div>
              </div>

              {/* Alert badges */}
              {(atRiskCount > 0 || alertCount > 0) && (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {atRiskCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      🚨 {atRiskCount} décrochage{atRiskCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {alertCount > 0 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      ⚠ {alertCount} alerte exam
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">Dir: {p.director.replace('Prof. ', '').replace('Dr. ', '')}</p>
                <span className="text-xs text-rose-600 font-semibold group-hover:underline">Ouvrir →</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

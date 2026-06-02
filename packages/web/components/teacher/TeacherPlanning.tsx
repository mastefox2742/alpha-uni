'use client'

import { useState } from 'react'
import { format, addDays, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

// ─── Types ────────────────────────────────────────────────────────────────────
type EventType   = 'teaching' | 'ricevimento' | 'meeting' | 'exam_surveillance'
type ApptMode    = 'online' | 'presential' | 'free' | 'cancelled'
type RecurDay    = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi'

interface WeekEvent {
  id:       string
  dayIndex: number   // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
  start:    string
  end:      string
  title:    string
  subtitle: string
  type:     EventType
  courseId?: string | undefined
}

interface Appointment {
  id:          string
  studentName: string
  day:         string
  time:        string
  mode:        ApptMode
  note:        string
  meetLink?:   string | undefined
}

interface RecurSlot {
  id:      string
  day:     RecurDay
  start:   string
  end:     string
  mode:    'mixte' | 'online' | 'presential'
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const NOW_DATE  = new Date('2026-05-26T10:00:00')
const WEEK_MON  = startOfWeek(NOW_DATE, { weekStartsOn: 1 })  // Monday May 25

const WEEK_EVENTS: WeekEvent[] = [
  {
    id: 'e1', dayIndex: 1,
    start: '09:00', end: '11:00',
    title: 'Algorithmique INFO301', subtitle: 'Salle B104 · Bât. Sciences',
    type: 'teaching', courseId: 'c1',
  },
  {
    id: 'e2', dayIndex: 1,
    start: '14:00', end: '16:00',
    title: 'Bases de données INFO201', subtitle: 'Salle A201 · Bât. Principal',
    type: 'teaching', courseId: 'c3',
  },
  {
    id: 'e3', dayIndex: 2,
    start: '14:00', end: '16:00',
    title: 'Ricevimento étudiants', subtitle: 'Bureau 314 · Bât. Admin',
    type: 'ricevimento',
  },
  {
    id: 'e4', dayIndex: 3,
    start: '10:00', end: '12:00',
    title: 'Réunion département', subtitle: 'Salle conf. D1',
    type: 'meeting',
  },
  {
    id: 'e5', dayIndex: 3,
    start: '14:30', end: '15:30',
    title: 'Soutenance de thèse — Sophie Bernard', subtitle: 'Amphi B',
    type: 'exam_surveillance',
  },
]

const UPCOMING_EVENTS: WeekEvent[] = [
  {
    id: 'u1', dayIndex: 0,
    start: '09:00', end: '13:00',
    title: 'Surveillance examen Algorithmique', subtitle: 'Amphi A · 12 inscrits',
    type: 'exam_surveillance',
  },
]

const RICEVIMENTO_SLOTS: RecurSlot[] = [
  { id: 'rs1', day: 'Mercredi', start: '14:00', end: '16:00', mode: 'mixte' },
]

const APPOINTMENTS: Appointment[] = [
  {
    id: 'a1', studentName: 'Marie Dupont',
    day: 'Mercredi 27 mai', time: '14:00',
    mode: 'online', note: 'Questions sur le TD3 — tri rapide',
    meetLink: 'meet.google.com/abc-xdf-ghj',
  },
  {
    id: 'a2', studentName: 'Érasme Koffi',
    day: 'Mercredi 27 mai', time: '14:30',
    mode: 'presential', note: 'Orientation stage L3',
  },
  {
    id: 'a3', studentName: '',
    day: 'Mercredi 27 mai', time: '15:00',
    mode: 'free', note: '',
  },
  {
    id: 'a4', studentName: '',
    day: 'Mercredi 27 mai', time: '15:30',
    mode: 'free', note: '',
  },
]

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] as const

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isNowInSlot(start: string, end: string, now: Date): boolean {
  const [sh = 0, sm = 0] = start.split(':').map(Number)
  const [eh = 0, em = 0] = end.split(':').map(Number)
  const nowM   = now.getHours() * 60 + now.getMinutes()
  const startM = sh * 60 + sm
  const endM   = eh * 60 + em
  return nowM >= startM && nowM < endM
}

const EVENT_COLORS: Record<EventType, string> = {
  teaching:           'border-l-4 border-l-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
  ricevimento:        'border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
  meeting:            'border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/30',
  exam_surveillance:  'border-l-4 border-l-red-400 bg-red-50 dark:bg-red-950/30',
}
const EVENT_LABELS: Record<EventType, string> = {
  teaching:           'Cours',
  ricevimento:        'Ricevimento',
  meeting:            'Réunion',
  exam_surveillance:  'Examen / Soutenance',
}

// ─── Components ──────────────────────────────────────────────────────────────
function EventBlock({ ev, now, isToday }: { ev: WeekEvent; now: Date; isToday: boolean }) {
  const active = isToday && isNowInSlot(ev.start, ev.end, now)
  return (
    <div className={`rounded-lg p-2.5 ${EVENT_COLORS[ev.type]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{ev.title}</p>
          <p className="text-xs text-muted-foreground">{ev.start}–{ev.end} · {ev.subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {active && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              En cours
            </span>
          )}
          <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {EVENT_LABELS[ev.type]}
          </span>
        </div>
      </div>
    </div>
  )
}

function ApptRow({ appt, onBook }: { appt: Appointment; onBook: (id: string) => void }) {
  if (appt.mode === 'free') {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{appt.time} — Créneau disponible</p>
        </div>
        <button
          onClick={() => onBook(appt.id)}
          className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
        >
          Bloquer
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{appt.time} — {appt.studentName}</p>
          {appt.mode === 'online'
            ? <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">En ligne</span>
            : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">Présentiel</span>}
          {appt.mode === 'cancelled' && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">Annulé</span>
          )}
        </div>
        {appt.note && <p className="mt-0.5 text-xs text-muted-foreground">{appt.note}</p>}
        {appt.meetLink && (
          <p className="mt-0.5 text-xs font-medium text-blue-600">{appt.meetLink}</p>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function TeacherPlanning() {
  const [appts, setAppts] = useState<Appointment[]>(APPOINTMENTS)
  const [showAddSlot, setShowAddSlot]       = useState(false)
  const [newSlotDay, setNewSlotDay]         = useState<string>('Lundi')
  const [newSlotStart, setNewSlotStart]     = useState('09:00')
  const [newSlotEnd, setNewSlotEnd]         = useState('11:00')
  const [ricevSlots, setRicevSlots]         = useState<RecurSlot[]>(RICEVIMENTO_SLOTS)
  const [toast, setToast]                   = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleBook(id: string) {
    setAppts(prev => prev.map(a => a.id === id ? { ...a, mode: 'presential' as const, studentName: '(réservé)' } : a))
    showToast('Créneau bloqué')
  }

  function handleAddSlot() {
    const slot: RecurSlot = {
      id: `rs${Date.now()}`,
      day: newSlotDay as RecurDay,
      start: newSlotStart,
      end: newSlotEnd,
      mode: 'mixte',
    }
    setRicevSlots(prev => [...prev, slot])
    setShowAddSlot(false)
    showToast('Disponibilité ajoutée')
  }

  function handleRemoveSlot(id: string) {
    setRicevSlots(prev => prev.filter(s => s.id !== id))
    showToast('Disponibilité supprimée')
  }

  const todayIdx = NOW_DATE.getDay() - 1  // 0=Mon, NOW=Tuesday=1

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Week header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Emploi du temps & RDV</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Semaine du {format(WEEK_MON, 'd MMMM', { locale: fr })} au {format(addDays(WEEK_MON, 4), 'd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          {([ ['bg-indigo-200','Cours'], ['bg-emerald-200','Ricevimento'], ['bg-amber-200','Réunion'], ['bg-red-200','Examen/Soutenance'] ] as const).map(([bg, label]) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded-sm ${bg}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Left: Weekly agenda ── */}
        <div className="space-y-3 lg:col-span-2">
          {DAYS.map((dayName, idx) => {
            const dayDate   = addDays(WEEK_MON, idx)
            const dayEvents = WEEK_EVENTS.filter(e => e.dayIndex === idx)
            const isToday   = idx === todayIdx

            return (
              <div
                key={dayName}
                className={`rounded-xl border bg-card p-4 shadow-sm ${isToday ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${isToday ? 'text-indigo-700' : 'text-foreground'}`}>
                      {dayName} {format(dayDate, 'd MMM', { locale: fr })}
                    </p>
                    {isToday && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        Aujourd'hui
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {dayEvents.length} événement{dayEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {dayEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Aucun événement programmé</p>
                ) : (
                  <div className="space-y-2">
                    {dayEvents.map(ev => (
                      <EventBlock key={ev.id} ev={ev} now={NOW_DATE} isToday={isToday} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Upcoming outside this week */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              À venir — 15 juin 2026
            </p>
            {UPCOMING_EVENTS.map(ev => (
              <EventBlock key={ev.id} ev={ev} now={NOW_DATE} isToday={false} />
            ))}
          </div>
        </div>

        {/* ── Right: Ricevimento ── */}
        <div className="space-y-4">

          {/* Recurring availability */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Mes disponibilités
              </h2>
              <button
                onClick={() => setShowAddSlot(v => !v)}
                className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
              >
                + Ajouter
              </button>
            </div>

            {ricevSlots.map(slot => (
              <div key={slot.id} className="mb-2 flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{slot.day}</p>
                  <p className="text-xs text-muted-foreground">
                    {slot.start}–{slot.end} · Créneaux 30 min ·{' '}
                    {slot.mode === 'mixte' ? 'Présentiel + Ligne' : slot.mode}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveSlot(slot.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}

            {ricevSlots.length === 0 && (
              <p className="text-xs text-muted-foreground italic">Aucune disponibilité définie</p>
            )}

            {/* Add slot form */}
            {showAddSlot && (
              <div className="mt-3 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                <p className="text-xs font-semibold text-emerald-700">Nouvelle disponibilité</p>
                <select
                  value={newSlotDay}
                  onChange={e => setNewSlotDay(e.target.value)}
                  className="w-full rounded border bg-background px-2 py-1 text-sm"
                >
                  {(['Lundi','Mardi','Mercredi','Jeudi','Vendredi'] as const).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input type="time" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)}
                    className="flex-1 rounded border bg-background px-2 py-1 text-sm" />
                  <span className="self-center text-muted-foreground">→</span>
                  <input type="time" value={newSlotEnd} onChange={e => setNewSlotEnd(e.target.value)}
                    className="flex-1 rounded border bg-background px-2 py-1 text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddSlot}
                    className="flex-1 rounded-md bg-emerald-600 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                    Confirmer
                  </button>
                  <button onClick={() => setShowAddSlot(false)}
                    className="flex-1 rounded-md border py-1.5 text-xs">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* This week's appointments */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              RDV cette semaine
            </h2>
            <div className="space-y-2">
              {appts.map(a => (
                <ApptRow key={a.id} appt={a} onBook={handleBook} />
              ))}
            </div>
          </div>

          {/* Upcoming exam sessions reminder */}
          <div className="rounded-xl border bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Rappel — Prochains examens
            </p>
            <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-400">
              <li>📅 15 juin · Algorithmique INFO301 · Amphi A</li>
              <li>📅 20 juin · Bases de données INFO201 · Salle C302</li>
              <li>📅 2 juil. · Génie logiciel INFO401 · Amphi B</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

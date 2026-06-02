'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type EventType = 'semester' | 'exam_session' | 'holiday' | 'resit' | 'deadline' | 'event'

interface CalEvent {
  id:       string
  title:    string
  start:    string   // YYYY-MM-DD
  end:      string
  type:     EventType
  editable: boolean
  description?: string | undefined
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const EVENTS: CalEvent[] = [
  // Semester 1 2025-2026
  { id: 'e01', title: 'Semestre 1 2025-2026',              start: '2025-09-15', end: '2026-01-10', type: 'semester',     editable: false, description: 'Cours du S1 — 15 semaines' },
  { id: 'e02', title: 'Session d\'examens S1',              start: '2026-01-12', end: '2026-01-30', type: 'exam_session', editable: true,  description: '3 semaines d\'examens finals' },
  { id: 'e03', title: 'Délibérations S1',                   start: '2026-02-04', end: '2026-02-06', type: 'deadline',     editable: true },
  // Semester 2 2025-2026
  { id: 'e04', title: 'Semestre 2 2025-2026',              start: '2026-02-09', end: '2026-05-29', type: 'semester',     editable: false, description: 'Cours du S2 — 15 semaines' },
  { id: 'e05', title: 'Session d\'examens S2',              start: '2026-06-01', end: '2026-06-20', type: 'exam_session', editable: true,  description: '3 semaines d\'examens finals' },
  { id: 'e06', title: 'Session de rattrapage (S1+S2)',      start: '2026-07-01', end: '2026-07-15', type: 'resit',        editable: true,  description: 'Session unique de rattrapage' },
  // Holidays
  { id: 'e07', title: 'Vacances de Toussaint',              start: '2025-10-27', end: '2025-11-03', type: 'holiday',     editable: false },
  { id: 'e08', title: 'Vacances de Noël',                   start: '2025-12-22', end: '2026-01-04', type: 'holiday',     editable: false },
  { id: 'e09', title: 'Vacances de Février',                start: '2026-02-02', end: '2026-02-08', type: 'holiday',     editable: false },
  { id: 'e10', title: 'Vacances de Printemps',              start: '2026-04-13', end: '2026-04-27', type: 'holiday',     editable: false },
  // Deadlines & Events
  { id: 'e11', title: 'Clôture préinscriptions 2026-2027', start: '2026-06-07', end: '2026-06-07', type: 'deadline',     editable: true,  description: 'Dernier jour de dépôt des dossiers de préinscription' },
  { id: 'e12', title: 'Cérémonie de remise des diplômes',  start: '2026-07-18', end: '2026-07-18', type: 'event',        editable: true },
  { id: 'e13', title: 'Délibérations S2 & rattrapage',     start: '2026-07-20', end: '2026-07-22', type: 'deadline',     editable: true },
  { id: 'e14', title: 'Rentrée 2026-2027',                  start: '2026-09-14', end: '2026-09-14', type: 'event',        editable: false },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function eventTypeInfo(t: EventType) {
  const map: Record<EventType, { label: string; dot: string; bg: string; text: string }> = {
    semester:     { label: 'Semestre',         dot: 'bg-indigo-500',   bg: 'bg-indigo-100',  text: 'text-indigo-700' },
    exam_session: { label: 'Session examens',  dot: 'bg-rose-500',     bg: 'bg-rose-100',    text: 'text-rose-700' },
    holiday:      { label: 'Vacances',         dot: 'bg-emerald-400',  bg: 'bg-emerald-100', text: 'text-emerald-700' },
    resit:        { label: 'Rattrapage',       dot: 'bg-amber-500',    bg: 'bg-amber-100',   text: 'text-amber-700' },
    deadline:     { label: 'Échéance admin.',  dot: 'bg-violet-500',   bg: 'bg-violet-100',  text: 'text-violet-700' },
    event:        { label: 'Événement',        dot: 'bg-blue-400',     bg: 'bg-blue-100',    text: 'text-blue-700' },
  }
  return map[t]
}

function daysUntil(dateStr: string) {
  const d    = new Date(dateStr)
  const now  = new Date('2026-05-26')
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86_400_000)
  if (diff < 0)  return null
  if (diff === 0) return 'Aujourd\'hui'
  if (diff === 1) return 'Demain'
  return `Dans ${diff} jours`
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ event, onClose }: { event: CalEvent; onClose: () => void }) {
  const [form, setForm]   = useState({ title: event.title, start: event.start, end: event.end, description: event.description ?? '' })
  const [saved, setSaved] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg">{event.editable ? 'Modifier événement' : 'Détails événement'}</h2>
          <button onClick={onClose} className="text-2xl text-muted-foreground">×</button>
        </div>
        <div className="p-6 space-y-4">
          {!saved ? (
            <>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Titre</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  disabled={!event.editable}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-60 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Début</label>
                  <input type="date" value={form.start}
                    onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                    disabled={!event.editable}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-800 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Fin</label>
                  <input type="date" value={form.end}
                    onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                    disabled={!event.editable}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-800 disabled:opacity-60"
                  />
                </div>
              </div>
              {form.description && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Description</label>
                  <textarea value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    disabled={!event.editable}
                    rows={2}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-800 disabled:opacity-60"
                  />
                </div>
              )}
              {!event.editable && (
                <p className="text-xs text-amber-600">🔒 Cet événement est verrouillé par le calendrier institutionnel.</p>
              )}
              {event.editable && (
                <button onClick={() => setSaved(true)} className="w-full rounded-lg bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                  Enregistrer les modifications
                </button>
              )}
            </>
          ) : (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <p className="text-emerald-700 font-semibold">✓ Calendrier mis à jour</p>
              <button onClick={onClose} className="mt-3 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminCalendar() {
  const [selected, setSelected] = useState<CalEvent | undefined>(undefined)
  const [filter, setFilter]     = useState<EventType | 'all'>('all')

  const now     = new Date('2026-05-26')
  const visible = (filter === 'all' ? EVENTS : EVENTS.filter(e => e.type === filter))
    .sort((a, b) => a.start.localeCompare(b.start))

  const upcoming = EVENTS
    .filter(e => new Date(e.start) >= now)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 5)

  function formatRange(start: string, end: string) {
    const s = new Date(start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    const e = new Date(end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    return start === end ? s : `${s} → ${e}`
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendrier Universitaire</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestion des semestres, sessions d'examens et congés — Année 2025-2026</p>
        </div>
        <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
          + Ajouter événement
        </button>
      </div>

      {/* Upcoming events strip */}
      <div className="rounded-xl border bg-card shadow-sm p-4">
        <h3 className="text-sm font-semibold mb-3">📅 Prochains événements</h3>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {upcoming.map(e => {
            const ti = eventTypeInfo(e.type)
            const d  = daysUntil(e.start)
            return (
              <div
                key={e.id}
                onClick={() => setSelected(e)}
                className={`shrink-0 rounded-xl border p-3 cursor-pointer hover:shadow-md transition-shadow min-w-[160px] ${ti.bg}`}
              >
                <span className={`text-[10px] font-bold uppercase ${ti.text}`}>{ti.label}</span>
                <p className={`text-xs font-semibold mt-1 ${ti.text}`}>{e.title}</p>
                <p className={`text-[10px] mt-1 ${ti.text} opacity-80`}>{formatRange(e.start, e.end)}</p>
                {d && <p className={`text-[10px] font-bold mt-1 ${ti.text}`}>{d}</p>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(['all','semester','exam_session','holiday','resit','deadline','event'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              filter === f ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {f !== 'all' && (
              <span className={`h-2 w-2 rounded-full ${eventTypeInfo(f).dot}`} />
            )}
            {f === 'all' ? 'Tous' : eventTypeInfo(f).label}
          </button>
        ))}
      </div>

      {/* Events timeline */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="divide-y">
          {visible.map(e => {
            const ti = eventTypeInfo(e.type)
            const d  = daysUntil(e.start)
            const isPast = new Date(e.end) < now
            return (
              <div
                key={e.id}
                onClick={() => setSelected(e)}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-muted/40 cursor-pointer ${isPast ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                  <span className={`h-3 w-3 rounded-full ${ti.dot}`} />
                  <div className="w-0.5 flex-1 bg-slate-200 min-h-[24px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{e.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ti.bg} ${ti.text}`}>{ti.label}</span>
                    {!e.editable && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">🔒 Verrouillé</span>}
                    {isPast && <span className="text-[10px] text-muted-foreground">Passé</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatRange(e.start, e.end)}</p>
                  {e.description && <p className="text-xs text-slate-500 mt-0.5 italic">{e.description}</p>}
                </div>
                <div className="shrink-0 text-right">
                  {d && !isPast && <p className="text-xs font-semibold text-rose-600">{d}</p>}
                  <span className="text-muted-foreground text-xs">→</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && <EditModal event={selected} onClose={() => setSelected(undefined)} />}
    </div>
  )
}

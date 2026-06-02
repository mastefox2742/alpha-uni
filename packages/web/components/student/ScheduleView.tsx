'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type TimeSlot = {
  id:        string
  day:       number          // 0 = Lundi … 4 = Vendredi
  startHour: number          // ex. 8 = 08:00
  duration:  number          // en heures (0.5, 1, 1.5, 2…)
  subject:   string
  room:      string
  type:      'cours' | 'td' | 'tp' | 'exam'
}

const TYPE_STYLE: Record<TimeSlot['type'], string> = {
  cours: 'bg-blue-100  border-blue-300  text-blue-800',
  td:    'bg-green-100 border-green-300 text-green-800',
  tp:    'bg-amber-100 border-amber-300 text-amber-800',
  exam:  'bg-red-100   border-red-300   text-red-800',
}

const TYPE_LABEL: Record<TimeSlot['type'], string> = {
  cours: 'Cours', td: 'TD', tp: 'TP', exam: 'Examen',
}

const DAYS  = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)   // 8h → 20h

// ─── Données de démo ─────────────────────────────────────────────────────────
const DEMO_SLOTS: TimeSlot[] = [
  { id: '1', day: 0, startHour: 8,    duration: 2,   subject: 'Analyse Mathématique',      room: 'Amphi A',  type: 'cours' },
  { id: '2', day: 0, startHour: 10.5, duration: 1.5, subject: 'Analyse Mathématique',      room: 'Salle 12', type: 'td'    },
  { id: '3', day: 1, startHour: 9,    duration: 2,   subject: 'Programmation Orientée Obj', room: 'Labo 3',   type: 'tp'    },
  { id: '4', day: 1, startHour: 14,   duration: 2,   subject: 'Bases de données',           room: 'Amphi B',  type: 'cours' },
  { id: '5', day: 2, startHour: 8,    duration: 1.5, subject: 'Systèmes d\'exploitation',   room: 'Amphi C',  type: 'cours' },
  { id: '6', day: 2, startHour: 11,   duration: 2,   subject: 'Réseaux Informatiques',      room: 'Salle 7',  type: 'td'    },
  { id: '7', day: 3, startHour: 10,   duration: 2,   subject: 'Programmation Orientée Obj', room: 'Labo 3',   type: 'tp'    },
  { id: '8', day: 3, startHour: 14,   duration: 1.5, subject: 'Bases de données',           room: 'Salle 5',  type: 'td'    },
  { id: '9', day: 4, startHour: 9,    duration: 3,   subject: 'Projet Intégrateur',          room: 'Salle 20', type: 'cours' },
]

const CELL_HEIGHT = 56   // px par heure

// ─── Composant ────────────────────────────────────────────────────────────────
export function ScheduleView() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📆 Emploi du temps</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Semaine en cours — Semestre 2, A.A. 2024/2025
          </p>
        </div>
        {/* Légende */}
        <div className="flex items-center gap-3 text-xs">
          {(Object.keys(TYPE_STYLE) as TimeSlot['type'][]).map((t) => (
            <span key={t} className={`rounded-full border px-2.5 py-0.5 font-medium ${TYPE_STYLE[t]}`}>
              {TYPE_LABEL[t]}
            </span>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <div className="flex min-w-[700px]">

          {/* Colonne heures */}
          <div className="w-14 shrink-0 border-r">
            <div className="h-10 border-b" /> {/* header vide */}
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ height: CELL_HEIGHT }}
                className="flex items-start justify-end border-b px-2 pt-1.5 text-[11px] text-muted-foreground"
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Colonnes jours */}
          {DAYS.map((day, dayIdx) => {
            const slots = DEMO_SLOTS.filter((s) => s.day === dayIdx)
            return (
              <div key={day} className="relative flex-1 border-r last:border-r-0">
                {/* Header du jour */}
                <div className="flex h-10 items-center justify-center border-b text-sm font-semibold">
                  {day}
                </div>

                {/* Cellules de fond (grille heure par heure) */}
                <div className="relative" style={{ height: CELL_HEIGHT * HOURS.length }}>
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      style={{ top: (h - 8) * CELL_HEIGHT, height: CELL_HEIGHT }}
                      className="absolute inset-x-0 border-b border-dashed border-border/40"
                    />
                  ))}

                  {/* Créneaux */}
                  {slots.map((slot) => {
                    const top    = (slot.startHour - 8) * CELL_HEIGHT
                    const height = slot.duration * CELL_HEIGHT - 4
                    const isH    = hovered === slot.id
                    return (
                      <div
                        key={slot.id}
                        style={{ top: top + 2, height, left: 4, right: 4 }}
                        className={`absolute rounded-lg border px-2 py-1.5 text-[11px] cursor-pointer transition-shadow
                          ${TYPE_STYLE[slot.type]}
                          ${isH ? 'shadow-md z-10 scale-[1.01]' : 'shadow-sm'}`}
                        onMouseEnter={() => setHovered(slot.id)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <p className="font-semibold leading-tight line-clamp-2">{slot.subject}</p>
                        <p className="mt-0.5 text-[10px] opacity-80">
                          {slot.room} · {TYPE_LABEL[slot.type]}
                        </p>
                        <p className="text-[10px] opacity-70">
                          {String(Math.floor(slot.startHour)).padStart(2,'0')}:
                          {slot.startHour % 1 === 0.5 ? '30' : '00'}
                          {' – '}
                          {String(Math.floor(slot.startHour + slot.duration)).padStart(2,'0')}:
                          {(slot.startHour + slot.duration) % 1 === 0.5 ? '30' : '00'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

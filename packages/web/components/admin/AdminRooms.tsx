'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type RoomType = 'amphi' | 'salle' | 'lab' | 'soutenance'

interface Booking {
  id:     string
  title:  string
  start:  string   // HH:MM
  end:    string
  day:    number   // 0=Mon...4=Fri
  owner:  string
  color:  string
}

interface Room {
  id:       string
  name:     string
  type:     RoomType
  capacity: number
  floor:    string
  equipment:string[]
  bookings: Booking[]
  available:boolean
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const ROOMS: Room[] = [
  {
    id: 'R01', name: 'Amphi A', type: 'amphi', capacity: 250, floor: 'RDC',
    equipment: ['Vidéoprojecteur', 'Micro HF', 'Climatisation', 'Visio'],
    available: true,
    bookings: [
      { id: 'b1', title: 'INFO501 — IA (CM)', start: '08:00', end: '10:00', day: 0, owner: 'Prof. Martin', color: 'bg-indigo-200 text-indigo-800' },
      { id: 'b2', title: 'MATH301 (CM)',       start: '10:00', end: '12:00', day: 1, owner: 'Dr. Roux',    color: 'bg-emerald-200 text-emerald-800' },
      { id: 'b3', title: 'DATA101 (CM)',        start: '14:00', end: '16:00', day: 2, owner: 'Dr. Chaoui', color: 'bg-violet-200 text-violet-800' },
      { id: 'b4', title: 'EXAM INFO301',        start: '08:00', end: '11:00', day: 3, owner: 'Admin',      color: 'bg-rose-200 text-rose-800' },
    ],
  },
  {
    id: 'R02', name: 'Amphi B', type: 'amphi', capacity: 180, floor: '1er',
    equipment: ['Vidéoprojecteur', 'Micro HF', 'Climatisation'],
    available: false,
    bookings: [
      { id: 'b5', title: 'DROIT401 (CM)',      start: '09:00', end: '11:00', day: 0, owner: 'Dr. Legrand', color: 'bg-amber-200 text-amber-800' },
      { id: 'b6', title: 'EXAM MATH302',       start: '08:00', end: '11:00', day: 4, owner: 'Admin',       color: 'bg-rose-200 text-rose-800' },
    ],
  },
  {
    id: 'R03', name: 'Salle 301', type: 'salle', capacity: 35, floor: '3ème',
    equipment: ['Tableau blanc', 'Vidéoprojecteur'],
    available: true,
    bookings: [
      { id: 'b7', title: 'INFO501 TD-A',       start: '13:00', end: '15:00', day: 0, owner: 'Prof. Martin', color: 'bg-indigo-200 text-indigo-800' },
      { id: 'b8', title: 'MATH302 TD-A',       start: '15:00', end: '17:00', day: 1, owner: 'Dr. Roux',    color: 'bg-emerald-200 text-emerald-800' },
    ],
  },
  {
    id: 'R04', name: 'Labo Informatique 1', type: 'lab', capacity: 24, floor: '2ème',
    equipment: ['24 postes PC', 'Tableau blanc', 'Vidéoprojecteur'],
    available: true,
    bookings: [
      { id: 'b9',  title: 'INFO301 TP-B',      start: '08:00', end: '10:00', day: 2, owner: 'Prof. Martin', color: 'bg-indigo-200 text-indigo-800' },
      { id: 'b10', title: 'DATA103 TP-A',       start: '10:00', end: '12:00', day: 2, owner: 'Dr. Chaoui', color: 'bg-violet-200 text-violet-800' },
    ],
  },
  {
    id: 'R05', name: 'Salle de soutenance', type: 'soutenance', capacity: 20, floor: '4ème',
    equipment: ['Écran TV 75"', 'Visioconférence', 'Climatisation'],
    available: true,
    bookings: [
      { id: 'b11', title: 'Soutenance Gros A.',  start: '14:00', end: '17:00', day: 4, owner: 'Admin', color: 'bg-rose-200 text-rose-800' },
    ],
  },
  {
    id: 'R06', name: 'Salle 205', type: 'salle', capacity: 40, floor: '2ème',
    equipment: ['Tableau blanc', 'Vidéoprojecteur'],
    available: true,
    bookings: [],
  },
]

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

function roomTypeInfo(t: RoomType) {
  const map: Record<RoomType, { label: string; cls: string }> = {
    amphi:      { label: 'Amphithéâtre',  cls: 'bg-indigo-100 text-indigo-700' },
    salle:      { label: 'Salle de cours', cls: 'bg-emerald-100 text-emerald-700' },
    lab:        { label: 'Laboratoire',   cls: 'bg-amber-100 text-amber-700' },
    soutenance: { label: 'Soutenance',    cls: 'bg-violet-100 text-violet-700' },
  }
  return map[t]
}

// ─── New Booking Modal ────────────────────────────────────────────────────────
function BookingModal({ room, onClose }: { room: Room; onClose: () => void }) {
  const [form, setForm]   = useState({ title: '', day: '0', start: '08:00', end: '10:00', owner: '' })
  const [collision, setCollision] = useState(false)
  const [saved, setSaved] = useState(false)

  function detectCollision() {
    const day = parseInt(form.day)
    const s = form.start, e = form.end
    return room.bookings.some(b =>
      b.day === day && !(e <= b.start || s >= b.end)
    )
  }

  function handleSubmit() {
    const c = detectCollision()
    setCollision(c)
    if (!c) setSaved(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg">Réserver {room.name}</h2>
          <button onClick={onClose} className="text-2xl text-muted-foreground">×</button>
        </div>
        <div className="p-6 space-y-4">
          {!saved ? (
            <>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Intitulé</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: INFO502 TD-A, EXAM MATH301…"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Jour</label>
                    <select
                      value={form.day}
                      onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                      className="w-full rounded-lg border px-2 py-2 text-sm dark:bg-slate-800"
                    >
                      {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Début</label>
                    <select
                      value={form.start}
                      onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                      className="w-full rounded-lg border px-2 py-2 text-sm dark:bg-slate-800"
                    >
                      {HOURS.slice(0, -1).map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Fin</label>
                    <select
                      value={form.end}
                      onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                      className="w-full rounded-lg border px-2 py-2 text-sm dark:bg-slate-800"
                    >
                      {HOURS.slice(1).map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Responsable</label>
                  <input
                    value={form.owner}
                    onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                    placeholder="Nom du responsable"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800"
                  />
                </div>
              </div>
              {collision && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">
                  🚫 <strong>Collision détectée</strong> — cette salle est déjà réservée sur ce créneau. Choisissez un autre horaire.
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={!form.title.trim() || !form.owner.trim()}
                className="w-full rounded-lg bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
              >
                Vérifier & Réserver
              </button>
            </>
          ) : (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <p className="text-emerald-700 font-semibold">✓ Réservation confirmée — aucune collision détectée</p>
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

// ─── Room Detail ──────────────────────────────────────────────────────────────
function RoomDetail({ room, onBook, onBack }: { room: Room; onBook: () => void; onBack: () => void }) {
  const ri  = roomTypeInfo(room.type)
  const occ = DAYS.map((d, i) => room.bookings.filter(b => b.day === i).length)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Retour</button>
        <h2 className="text-xl font-bold">{room.name}</h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ri.cls}`}>{ri.label}</span>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${room.available ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {room.available ? 'Disponible' : 'Indisponible'}
        </span>
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>📍 {room.floor}</span>
        <span>👥 {room.capacity} places</span>
        <span>🔧 {room.equipment.join(', ')}</span>
      </div>

      {/* Weekly mini-grid */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Planning de la semaine</h3>
          <button
            onClick={onBook}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            + Réserver un créneau
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-800">
                <th className="w-16 px-3 py-2 text-left text-muted-foreground">Heure</th>
                {DAYS.map(d => <th key={d} className="px-3 py-2 text-center text-muted-foreground">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {HOURS.slice(0, -1).map(hour => (
                <tr key={hour} className="border-b last:border-0">
                  <td className="px-3 py-1.5 text-muted-foreground font-mono">{hour}</td>
                  {DAYS.map((_, di) => {
                    const booking = room.bookings.find(b => b.day === di && b.start <= hour && b.end > hour)
                    return (
                      <td key={di} className="px-1 py-1 text-center">
                        {booking ? (
                          <div className={`rounded px-1.5 py-0.5 ${booking.color} leading-tight`}>
                            <p className="font-semibold truncate max-w-[90px]">{booking.title}</p>
                            <p className="opacity-70">{booking.owner.split(' ').slice(-1)[0]}</p>
                          </div>
                        ) : (
                          <div className="h-5 rounded bg-slate-50 dark:bg-slate-800/50" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Occupancy by day */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Taux d'occupation par jour</h3>
        <div className="grid grid-cols-5 gap-2">
          {DAYS.map((d, i) => {
            const count = occ[i] ?? 0
            const pct   = Math.min((count / 4) * 100, 100)
            return (
              <div key={d} className="text-center">
                <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-slate-100 dark:bg-slate-800 mb-1">
                  {count}
                </div>
                <p className="text-[10px] text-muted-foreground">{d}</p>
                <div className="mt-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 75 ? 'bg-rose-500' : pct >= 50 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminRooms() {
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined)
  const [bookingRoom,  setBookingRoom]  = useState<Room | undefined>(undefined)
  const [filter, setFilter] = useState<RoomType | 'all'>('all')

  const visible = filter === 'all' ? ROOMS : ROOMS.filter(r => r.type === filter)

  if (selectedRoom) {
    return (
      <div>
        <RoomDetail
          room={selectedRoom}
          onBook={() => setBookingRoom(selectedRoom)}
          onBack={() => setSelectedRoom(undefined)}
        />
        {bookingRoom && <BookingModal room={bookingRoom} onClose={() => setBookingRoom(undefined)} />}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Salles & Amphis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestion des espaces et planification anti-collision</p>
        </div>
        <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
          + Ajouter une salle
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total salles',         value: ROOMS.length, color: 'text-indigo-600' },
          { label: 'Disponibles',          value: ROOMS.filter(r => r.available).length, color: 'text-emerald-600' },
          { label: 'Réservations actives', value: ROOMS.reduce((a, r) => a + r.bookings.length, 0), color: 'text-amber-600' },
          { label: 'Capacité totale',      value: ROOMS.reduce((a, r) => a + r.capacity, 0) + ' places', color: 'text-slate-600' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all','amphi','salle','lab','soutenance'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              filter === f ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {f === 'all' ? 'Toutes' : roomTypeInfo(f).label}
          </button>
        ))}
      </div>

      {/* Rooms grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(room => {
          const ri = roomTypeInfo(room.type)
          const occupied = room.bookings.length
          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold">{room.name}</p>
                  <p className="text-xs text-muted-foreground">{room.floor} · {room.capacity} places</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ri.cls}`}>{ri.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${room.available ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {room.available ? '● Libre' : '● Occupée'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {room.equipment.slice(0, 3).map(e => (
                  <span key={e} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">{e}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{occupied} réservation{occupied !== 1 ? 's' : ''} cette semaine</span>
                <span className="text-rose-600 font-medium">Voir →</span>
              </div>
            </div>
          )
        })}
      </div>

      {bookingRoom && <BookingModal room={bookingRoom} onClose={() => setBookingRoom(undefined)} />}
    </div>
  )
}

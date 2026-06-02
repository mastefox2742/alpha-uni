'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type SettingsTab = 'profile' | 'notifications' | 'office_hours' | 'security' | 'payslips' | 'leaves'

// ─── Main Component ───────────────────────────────────────────────────────────
export function TeacherSettings() {
  const [tab, setTab] = useState<SettingsTab>('profile')

  const TABS: Array<{ id: SettingsTab; label: string; icon: string }> = [
    { id: 'profile',       label: 'Profil & informations',  icon: '👤' },
    { id: 'notifications', label: 'Notifications',          icon: '🔔' },
    { id: 'office_hours',  label: 'Disponibilités',         icon: '📅' },
    { id: 'security',      label: 'Sécurité & accès',       icon: '🔒' },
    { id: 'payslips',      label: 'Documents RH',           icon: '📄' },
    { id: 'leaves',        label: 'Congés & absences',      icon: '🌿' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Paramètres RH & compte</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez votre profil, vos disponibilités et vos préférences de notifications.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar nav */}
        <nav className="space-y-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                tab === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div>
          {tab === 'profile'       && <ProfileTab />}
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'office_hours'  && <OfficeHoursTab />}
          {tab === 'security'      && <SecurityTab />}
          {tab === 'payslips'      && <PayslipsTab />}
          {tab === 'leaves'        && <LeavesTab />}
        </div>
      </div>
    </div>
  )
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
  const [form, setForm] = useState({
    firstName:  'Alain',
    lastName:   'Martin',
    title:      'Prof.',
    email:      'a.martin@univ-paris.fr',
    phone:      '+33 1 40 00 12 34',
    office:     'Bâtiment A, Bureau 314',
    department: 'Informatique',
    rank:       'Professeur des Universités',
    speciality: 'Intelligence Artificielle & Sécurité des Systèmes',
    bio:        'Professeur en informatique spécialisé dans l\'apprentissage automatique, la cybersécurité et les systèmes distribués. Directeur de recherche du groupe FedSec depuis 2020.',
    website:    'https://alain-martin.univ-paris.fr',
    orcid:      '0000-0002-1234-5678',
  })
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
      <h2 className="font-semibold">Informations personnelles & professionnelles</h2>

      {saved && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
          ✅ Profil mis à jour avec succès
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Titre</label>
          <select
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>Prof.</option>
            <option>Dr.</option>
            <option>MCF</option>
            <option>—</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Prénom</label>
          <input
            type="text"
            value={form.firstName}
            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Nom</label>
          <input
            type="text"
            value={form.lastName}
            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Email institutionnel</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Téléphone bureau</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Bureau</label>
          <input
            type="text"
            value={form.office}
            onChange={e => setForm(f => ({ ...f, office: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Département</label>
          <input
            type="text"
            value={form.department}
            onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Corps / Grade</label>
          <input
            type="text"
            value={form.rank}
            onChange={e => setForm(f => ({ ...f, rank: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Spécialité</label>
          <input
            type="text"
            value={form.speciality}
            onChange={e => setForm(f => ({ ...f, speciality: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Site web personnel</label>
          <input
            type="url"
            value={form.website}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">ORCID</label>
          <input
            type="text"
            value={form.orcid}
            onChange={e => setForm(f => ({ ...f, orcid: e.target.value }))}
            placeholder="0000-0000-0000-0000"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Biographie (visible sur le site)</label>
        <textarea
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          rows={3}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Sauvegarder
      </button>
    </form>
  )
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newEnrollment:      true,
    gradeDeadline:      true,
    thesisRequest:      true,
    appointmentBooked:  true,
    budgetAlert:        false,
    systemNews:         false,
    emailDigest:        true,
    digestFrequency:    'daily',
  })
  const [saved, setSaved] = useState(false)

  function toggle(key: keyof typeof prefs) {
    if (typeof prefs[key] === 'boolean') {
      setPrefs(p => ({ ...p, [key]: !p[key] }))
    }
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const TOGGLES: Array<{ key: keyof typeof prefs; label: string; desc: string }> = [
    { key: 'newEnrollment',     label: 'Nouvelles prénotations',          desc: 'Quand un étudiant se prénotifie à une session' },
    { key: 'gradeDeadline',     label: 'Rappels de saisie des notes',     desc: '48h avant la clôture du verbale' },
    { key: 'thesisRequest',     label: 'Demandes d\'encadrement',         desc: 'Quand un étudiant soumet une demande de thèse' },
    { key: 'appointmentBooked', label: 'Réservations de RDV',             desc: 'Quand un étudiant réserve un créneau de ricevimento' },
    { key: 'budgetAlert',       label: 'Alertes budget (> 80%)',          desc: 'Quand un projet dépasse 80% de son budget' },
    { key: 'systemNews',        label: 'Actualités de la plateforme',     desc: 'Mises à jour et nouvelles fonctionnalités' },
  ]

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
      <h2 className="font-semibold">Préférences de notifications</h2>

      {saved && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
          ✅ Préférences sauvegardées
        </div>
      )}

      <div className="space-y-3">
        {TOGGLES.map(t => (
          <div key={t.key} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
            <div>
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
            <button
              onClick={() => toggle(t.key)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none ${
                prefs[t.key] ? 'bg-indigo-600' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  prefs[t.key] ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
                style={{ transform: `translateX(${prefs[t.key] ? '1.375rem' : '0.125rem'}) translateY(0.125rem)` }}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-muted/20 px-4 py-3">
        <p className="text-sm font-medium mb-2">Récapitulatif email</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={prefs.emailDigest}
              onChange={() => toggle('emailDigest')}
              className="h-4 w-4 accent-indigo-600"
            />
            Activer le digest email
          </label>
          {prefs.emailDigest && (
            <select
              value={prefs.digestFrequency}
              onChange={e => setPrefs(p => ({ ...p, digestFrequency: e.target.value }))}
              className="rounded-lg border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
            </select>
          )}
        </div>
      </div>

      <button
        onClick={save}
        className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Sauvegarder
      </button>
    </div>
  )
}

// ─── Office Hours Tab ─────────────────────────────────────────────────────────
function OfficeHoursTab() {
  const [slots, setSlots] = useState([
    { day: 'Lundi',    start: '14:00', end: '16:00', mode: 'presential' },
    { day: 'Jeudi',    start: '10:00', end: '12:00', mode: 'online' },
  ])
  const [saved, setSaved] = useState(false)

  function addSlot() {
    setSlots(prev => [...prev, { day: 'Mardi', start: '09:00', end: '10:00', mode: 'presential' }])
  }

  function removeSlot(i: number) {
    setSlots(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateSlot(i: number, field: string, val: string) {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
      <h2 className="font-semibold">Créneaux de ricevimento (consultation)</h2>
      <p className="text-sm text-muted-foreground">
        Ces créneaux seront visibles par les étudiants pour prendre rendez-vous.
      </p>

      {saved && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
          ✅ Disponibilités mises à jour
        </div>
      )}

      <div className="space-y-3">
        {slots.map((slot, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/20 p-3">
            <select
              value={slot.day}
              onChange={e => updateSlot(i, 'day', e.target.value)}
              className="rounded-lg border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
            <input
              type="time"
              value={slot.start}
              onChange={e => updateSlot(i, 'start', e.target.value)}
              className="rounded-lg border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-muted-foreground">→</span>
            <input
              type="time"
              value={slot.end}
              onChange={e => updateSlot(i, 'end', e.target.value)}
              className="rounded-lg border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={slot.mode}
              onChange={e => updateSlot(i, 'mode', e.target.value)}
              className="rounded-lg border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="presential">En présentiel</option>
              <option value="online">En ligne (Meet)</option>
              <option value="both">Les deux</option>
            </select>
            <button
              onClick={() => removeSlot(i)}
              className="rounded-lg border px-2 py-1.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={addSlot}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          + Ajouter un créneau
        </button>
        <button
          onClick={save}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  )
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaved, setPwSaved] = useState(false)
  const [twofaEnabled, setTwofaEnabled] = useState(true)

  function handlePwSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPwSaved(true)
    setTimeout(() => { setPwSaved(false); setPwForm({ current: '', next: '', confirm: '' }) }, 2500)
  }

  return (
    <div className="space-y-4">
      {/* Password change */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h2 className="font-semibold">Changer le mot de passe</h2>
        {pwSaved && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
            ✅ Mot de passe mis à jour
          </div>
        )}
        <form onSubmit={handlePwSubmit} className="space-y-3">
          {(['current', 'next', 'confirm'] as const).map(field => (
            <div key={field}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground capitalize">
                {field === 'current' ? 'Mot de passe actuel' : field === 'next' ? 'Nouveau mot de passe' : 'Confirmer'}
              </label>
              <input
                type="password"
                value={pwForm[field]}
                onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder="••••••••"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            Mettre à jour
          </button>
        </form>
      </div>

      {/* 2FA */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Authentification à deux facteurs</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {twofaEnabled ? 'Activée — votre compte est protégé.' : 'Désactivée — activez pour plus de sécurité.'}
            </p>
          </div>
          <button
            onClick={() => setTwofaEnabled(v => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none ${twofaEnabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: `translateX(${twofaEnabled ? '1.375rem' : '0.125rem'}) translateY(0.125rem)` }}
            />
          </button>
        </div>
        {twofaEnabled && (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
            🔐 OTP activé via email institutionnel. Utilisé pour la signature électronique des verbales.
          </p>
        )}
      </div>

      {/* Session info */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="font-semibold mb-3">Sessions actives</h2>
        <div className="space-y-2 text-sm">
          {[
            { device: 'Chrome · macOS',    ip: '176.134.x.x', date: 'Maintenant',       current: true  },
            { device: 'Firefox · Windows', ip: '176.134.x.x', date: 'Il y a 2 heures',  current: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
              <div>
                <span className="font-medium">{s.device}</span>
                {s.current && (
                  <span className="ml-2 rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                    Session actuelle
                  </span>
                )}
                <p className="text-xs text-muted-foreground">{s.ip} · {s.date}</p>
              </div>
              {!s.current && (
                <button className="text-xs text-red-500 hover:underline">Déconnecter</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Payslips Tab ─────────────────────────────────────────────────────────────
type DocCategory = 'payslip' | 'cu' | 'attestation' | 'contract'

interface HrDocument {
  id:       string
  category: DocCategory
  label:    string
  period:   string
  date:     string
  size:     string
  new:      boolean
}

const HR_DOCUMENTS: HrDocument[] = [
  { id: 'd1',  category: 'payslip',     label: 'Bulletin de salaire — Mai 2026',           period: 'Mai 2026',     date: '31/05/2026', size: '142 Ko', new: true  },
  { id: 'd2',  category: 'payslip',     label: 'Bulletin de salaire — Avril 2026',          period: 'Avr. 2026',    date: '30/04/2026', size: '138 Ko', new: false },
  { id: 'd3',  category: 'payslip',     label: 'Bulletin de salaire — Mars 2026',           period: 'Mars 2026',    date: '31/03/2026', size: '141 Ko', new: false },
  { id: 'd4',  category: 'payslip',     label: 'Bulletin de salaire — Février 2026',        period: 'Fév. 2026',    date: '28/02/2026', size: '139 Ko', new: false },
  { id: 'd5',  category: 'payslip',     label: 'Bulletin de salaire — Janvier 2026',        period: 'Jan. 2026',    date: '31/01/2026', size: '140 Ko', new: false },
  { id: 'd6',  category: 'payslip',     label: 'Bulletin de salaire — Décembre 2025',       period: 'Déc. 2025',    date: '31/12/2025', size: '144 Ko', new: false },
  { id: 'd7',  category: 'cu',          label: 'Certificazione Unica (CU) 2025',            period: 'Année 2025',   date: '15/03/2026', size: '215 Ko', new: true  },
  { id: 'd8',  category: 'cu',          label: 'Certificazione Unica (CU) 2024',            period: 'Année 2024',   date: '10/03/2025', size: '208 Ko', new: false },
  { id: 'd9',  category: 'attestation', label: 'Attestation de salaire — Janvier 2026',     period: 'Jan. 2026',    date: '05/02/2026', size: '98 Ko',  new: false },
  { id: 'd10', category: 'attestation', label: 'Attestation employeur (pour banque)',        period: '—',            date: '12/11/2025', size: '105 Ko', new: false },
  { id: 'd11', category: 'contract',    label: 'Contrat de travail — Avenant 2024',         period: '—',            date: '01/09/2024', size: '320 Ko', new: false },
]

function docCategoryInfo(c: DocCategory): { label: string; cls: string; icon: string } {
  const map: Record<DocCategory, { label: string; cls: string; icon: string }> = {
    payslip:     { label: 'Fiche de paie',     cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',   icon: '💶' },
    cu:          { label: 'Attestation fiscale',cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',  icon: '🧾' },
    attestation: { label: 'Attestation',        cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',         icon: '📋' },
    contract:    { label: 'Contrat',            cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',     icon: '📝' },
  }
  return map[c]
}

function PayslipsTab() {
  const [filter, setFilter]     = useState<DocCategory | 'all'>('all')
  const [dlToast, setDlToast]   = useState<string | null>(null)
  const [opened,  setOpened]    = useState<Set<string>>(new Set())

  function simulateDownload(doc: HrDocument) {
    setOpened(prev => { const n = new Set(prev); n.add(doc.id); return n })
    setDlToast(`Téléchargement de « ${doc.label} »…`)
    setTimeout(() => {
      setDlToast('✅ Document téléchargé (simulation)')
      setTimeout(() => setDlToast(null), 2500)
    }, 1000)
  }

  const filtered = filter === 'all' ? HR_DOCUMENTS : HR_DOCUMENTS.filter(d => d.category === filter)
  const newCount = HR_DOCUMENTS.filter(d => d.new && !opened.has(d.id)).length

  const FILTERS: Array<{ value: DocCategory | 'all'; label: string }> = [
    { value: 'all',         label: 'Tous' },
    { value: 'payslip',     label: 'Fiches de paie' },
    { value: 'cu',          label: 'Attestations fiscales' },
    { value: 'attestation', label: 'Attestations' },
    { value: 'contract',    label: 'Contrats' },
  ]

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Documents RH & fiches de paie</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Accédez à vos bulletins de salaire, attestations fiscales (CU) et documents contractuels.
            </p>
          </div>
          {newCount > 0 && (
            <span className="shrink-0 rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">
              {newCount} nouveau{newCount > 1 ? 'x' : ''}
            </span>
          )}
        </div>
        {dlToast && (
          <p className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
            {dlToast}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? 'bg-indigo-600 text-white'
                : 'border hover:bg-muted text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Document list */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 text-left">Document</th>
              <th className="px-4 py-3 text-left">Période</th>
              <th className="px-4 py-3 text-left">Mis en ligne</th>
              <th className="px-4 py-3 text-left">Taille</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(doc => {
              const { label, cls, icon } = docCategoryInfo(doc.category)
              const isNew = doc.new && !opened.has(doc.id)
              return (
                <tr key={doc.id} className={`hover:bg-muted/30 transition-colors ${isNew ? 'bg-indigo-50/40 dark:bg-indigo-950/10' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{doc.label}</span>
                          {isNew && (
                            <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              NOUVEAU
                            </span>
                          )}
                        </div>
                        <span className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>
                          {label}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.period}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.date}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{doc.size}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => simulateDownload(doc)}
                      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      PDF
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Info note */}
      <p className="text-xs text-muted-foreground">
        📌 Les documents sont conservés 5 ans. Pour toute erreur sur un bulletin, contactez le service RH à <span className="font-medium">rh@univ-paris.fr</span>.
      </p>
    </div>
  )
}

// ─── Leaves Tab ───────────────────────────────────────────────────────────────
type LeaveType   = 'sick' | 'sabbatical' | 'parental' | 'personal' | 'research' | 'training'
type LeaveStatus = 'draft' | 'submitted' | 'approved' | 'refused'

interface LeaveRequest {
  id:         string
  type:       LeaveType
  startDate:  string
  endDate:    string
  days:       number
  reason:     string
  status:     LeaveStatus
  submittedAt:string
  approvedBy: string | undefined
}

const LEAVE_HISTORY: LeaveRequest[] = [
  {
    id: 'l1',
    type: 'sabbatical',
    startDate: '01/09/2023',
    endDate: '31/01/2024',
    days: 109,
    reason: 'Congé de recherche sabbatique — délégation CNRS, laboratoire MIT CSAIL (Cambridge, MA).',
    status: 'approved',
    submittedAt: '15/04/2023',
    approvedBy: 'Prof. Leclerc (Directeur de département)',
  },
  {
    id: 'l2',
    type: 'sick',
    startDate: '10/02/2026',
    endDate: '14/02/2026',
    days: 5,
    reason: 'Arrêt maladie (certificat médical joint).',
    status: 'approved',
    submittedAt: '10/02/2026',
    approvedBy: 'Service RH',
  },
  {
    id: 'l3',
    type: 'training',
    startDate: '15/07/2026',
    endDate: '19/07/2026',
    days: 5,
    reason: 'Formation pédagogique MOOC — Centre de formation continue universitaire.',
    status: 'submitted',
    submittedAt: '20/05/2026',
    approvedBy: undefined,
  },
]

function leaveTypeInfo(t: LeaveType): { label: string; cls: string; icon: string } {
  const map: Record<LeaveType, { label: string; cls: string; icon: string }> = {
    sick:        { label: 'Arrêt maladie',       cls: 'bg-red-100 text-red-700',       icon: '🤒' },
    sabbatical:  { label: 'Congé sabbatique',     cls: 'bg-violet-100 text-violet-700', icon: '✈️' },
    parental:    { label: 'Congé parental',       cls: 'bg-pink-100 text-pink-700',     icon: '👶' },
    personal:    { label: 'Congé personnel',      cls: 'bg-blue-100 text-blue-700',     icon: '🏖️' },
    research:    { label: 'Délégation recherche', cls: 'bg-indigo-100 text-indigo-700', icon: '🔬' },
    training:    { label: 'Formation',            cls: 'bg-amber-100 text-amber-700',   icon: '📚' },
  }
  return map[t]
}

function leaveStatusInfo(s: LeaveStatus): { label: string; cls: string } {
  const map: Record<LeaveStatus, { label: string; cls: string }> = {
    draft:     { label: 'Brouillon', cls: 'bg-muted text-muted-foreground' },
    submitted: { label: 'Soumis',   cls: 'bg-blue-100 text-blue-700' },
    approved:  { label: 'Approuvé', cls: 'bg-emerald-100 text-emerald-700' },
    refused:   { label: 'Refusé',   cls: 'bg-red-100 text-red-700' },
  }
  return map[s]
}

function LeavesTab() {
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({
    type:       'sick' as LeaveType,
    startDate:  '',
    endDate:    '',
    reason:     '',
    attachment: false,
  })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setShowForm(false)
      setForm({ type: 'sick', startDate: '', endDate: '', reason: '', attachment: false })
    }, 2000)
  }

  // Derived day count
  const dayCount = (() => {
    if (!form.startDate || !form.endDate) return 0
    const a = new Date(form.startDate)
    const b = new Date(form.endDate)
    const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return Math.max(0, diff)
  })()

  return (
    <div className="space-y-5">
      {/* Solde banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Congés annuels',   taken: 12, total: 45, color: 'text-indigo-600'  },
          { label: 'RTT',              taken: 4,  total: 10, color: 'text-violet-600'  },
          { label: 'Jours CET',        taken: 0,  total: 8,  color: 'text-blue-600'    },
          { label: 'Formation (jours)',taken: 5,  total: 5,  color: 'text-emerald-600' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className={`text-xl font-bold ${k.color}`}>{k.total - k.taken}</p>
            <p className="text-xs text-muted-foreground">{k.label} restants</p>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${k.color.replace('text-', 'bg-')}`}
                style={{ width: `${Math.round(((k.total - k.taken) / k.total) * 100)}%` }}
              />
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{k.taken}/{k.total} utilisés</p>
          </div>
        ))}
      </div>

      {/* New request button / form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Nouvelle demande d'absence
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-semibold">Nouvelle demande d'absence</h3>

          {submitted ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-3xl">✅</p>
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                Demande envoyée au directeur de département
              </p>
              <p className="text-sm text-muted-foreground">
                Votre emploi du temps sera mis à jour à validation. Les étudiants seront notifiés automatiquement.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Type d'absence</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as LeaveType }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="sick">🤒 Arrêt maladie</option>
                    <option value="sabbatical">✈️ Congé sabbatique</option>
                    <option value="parental">👶 Congé parental</option>
                    <option value="personal">🏖️ Congé personnel</option>
                    <option value="research">🔬 Délégation / congé recherche</option>
                    <option value="training">📚 Formation</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Date de début</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Date de fin</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {dayCount > 0 && (
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
                  📅 Durée calculée : <strong>{dayCount} jour{dayCount > 1 ? 's' : ''} calendaires</strong>
                  {(form.type === 'sick' || form.type === 'sabbatical' || form.type === 'parental') && (
                    <span className="ml-2 text-xs opacity-75">· Un certificat justificatif sera demandé</span>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Motif / justification</label>
                <textarea
                  required
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  rows={3}
                  placeholder="Décrivez brièvement le motif de votre absence…"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Impact notice */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm dark:border-amber-800 dark:bg-amber-950/20">
                <p className="font-semibold text-amber-700 dark:text-amber-300 mb-1">⚠️ Impact sur l'emploi du temps</p>
                <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-0.5 list-inside list-disc">
                  <li>Une fois approuvée, votre calendrier sera automatiquement bloqué sur la période.</li>
                  <li>Les créneaux de ricevimento seront masqués et les nouveaux RDV bloqués.</li>
                  <li>Les étudiants inscrit à vos cours recevront une notification automatique.</li>
                  <li>Les cours prévus en votre absence apparaîtront comme « Annulé / Report à définir ».</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Soumettre au directeur de département
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {/* History */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Historique des demandes
        </h3>
        <div className="space-y-3">
          {LEAVE_HISTORY.map(req => {
            const { label: tLabel, icon } = leaveTypeInfo(req.type)
            const { label: sLabel, cls }  = leaveStatusInfo(req.status)
            return (
              <div key={req.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-base">{icon}</span>
                      <span className="font-medium">{tLabel}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{sLabel}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      📅 {req.startDate} → {req.endDate} · <strong>{req.days} jours</strong>
                    </p>
                    <p className="mt-0.5 text-xs italic text-muted-foreground">{req.reason}</p>
                    {req.approvedBy && (
                      <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                        ✅ Approuvé par {req.approvedBy}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">Soumis le {req.submittedAt}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

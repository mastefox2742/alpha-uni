'use client'

import { useState } from 'react'
import { AdminMFASetup } from './AdminMFASetup'

type SettingsTab = 'general' | 'users' | 'notifications' | 'security'

// ─── Demo Data ────────────────────────────────────────────────────────────────
const ADMIN_USERS = [
  { id: 'u1', name: 'Marie Dupont',    email: 'marie.dupont@univ.fr',    role: 'Super-Admin',  lastLogin: '2026-05-26 09:12', active: true },
  { id: 'u2', name: 'Pierre Moreau',   email: 'p.moreau@univ.fr',        role: 'Secrétariat',  lastLogin: '2026-05-25 15:47', active: true },
  { id: 'u3', name: 'Sophie Laurent',  email: 's.laurent@univ.fr',       role: 'Scolarité',    lastLogin: '2026-05-24 11:30', active: true },
  { id: 'u4', name: 'Ahmed Benali',    email: 'a.benali@univ.fr',        role: 'Comptabilité', lastLogin: '2026-05-22 09:05', active: false },
]

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminSettings() {
  const [tab, setTab]           = useState<SettingsTab>('general')
  const [saved, setSaved]       = useState(false)

  // General settings state
  const [uniName, setUniName]   = useState('Université de Paris')
  const [acYear,  setAcYear]    = useState('2025-2026')
  const [demoMode, setDemoMode] = useState(true)
  const [lang, setLang]         = useState('fr')

  // Notification state
  const [notifs, setNotifs] = useState({
    newApplication:  true,
    paymentOverdue:  true,
    contestedPv:     true,
    missionPending:  true,
    graduationAlert: true,
    systemReport:    false,
  })

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'general',       label: 'Général',              icon: '⚙️' },
    { key: 'users',         label: 'Utilisateurs admin',   icon: '👤' },
    { key: 'notifications', label: 'Notifications',        icon: '🔔' },
    { key: 'security',      label: 'Sécurité & Audit',     icon: '🔒' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Configuration système</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Paramètres globaux du back-office UniGest</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-rose-600 text-rose-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* General */}
      {tab === 'general' && (
        <div className="space-y-5 max-w-xl">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Paramètres de l'établissement</h3>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Nom de l'université</label>
              <input value={uniName} onChange={e => setUniName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Année universitaire en cours</label>
              <input value={acYear} onChange={e => setAcYear(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Langue d'interface</label>
              <select value={lang} onChange={e => setLang(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-800">
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="it">Italiano</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-semibold">Mode démonstration</p>
                <p className="text-xs text-muted-foreground">Données fictives — aucune modification en base</p>
              </div>
              <button
                onClick={() => setDemoMode(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${demoMode ? 'bg-rose-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${demoMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Paramètres académiques</h3>
            {[
              { label: 'CFU requis Licence',      defaultVal: '180' },
              { label: 'CFU requis Master',        defaultVal: '120' },
              { label: 'Quota heures enseignant',  defaultVal: '192' },
              { label: 'Délai validation dossier', defaultVal: '48h' },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">{f.label}</label>
                <input defaultValue={f.defaultVal}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 dark:bg-slate-800" />
              </div>
            ))}
          </div>

          <button onClick={handleSave} className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors ${saved ? 'bg-emerald-500' : 'bg-rose-600 hover:bg-rose-700'}`}>
            {saved ? '✓ Paramètres sauvegardés' : 'Sauvegarder les modifications'}
          </button>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{ADMIN_USERS.filter(u => u.active).length} comptes actifs</p>
            <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
              + Ajouter administrateur
            </button>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Dernière connexion</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {ADMIN_USERS.map(u => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xs font-bold">
                          {u.name.split(' ').map(n => n.charAt(0)).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-xs">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        u.role === 'Super-Admin' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {u.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-xs text-rose-600 hover:underline">Modifier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="space-y-4 max-w-xl">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Alertes actives</h3>
            {([
              ['newApplication',  'Nouveau dossier d\'inscription soumis',        'Inscriptions'],
              ['paymentOverdue',  'Étudiant en retard de paiement (>30j)',         'Comptabilité'],
              ['contestedPv',     'Verbale d\'examen contesté',                    'Examens'],
              ['missionPending',  'Ordre de mission en attente d\'approbation',    'Missions'],
              ['graduationAlert', 'Dossier Laurea éligible sans jury constitué',  'Diplômes'],
              ['systemReport',    'Rapport système hebdomadaire',                  'Système'],
            ] as const).map(([key, label, module]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{module}</p>
                </div>
                <button
                  onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${notifs[key] ? 'bg-rose-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${notifs[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={handleSave} className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors ${saved ? 'bg-emerald-500' : 'bg-rose-600 hover:bg-rose-700'}`}>
            {saved ? '✓ Sauvegardé' : 'Sauvegarder les préférences'}
          </button>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="space-y-4 max-w-xl">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Journal d'audit récent</h3>
            <div className="space-y-2">
              {[
                { time: '2026-05-26 09:12', user: 'M. Dupont', action: 'Connexion au back-office', level: 'info' },
                { time: '2026-05-26 09:08', user: 'M. Dupont', action: 'Correction verbale INFO301 (MAT20240099 — ABS → 14/20)', level: 'warning' },
                { time: '2026-05-25 16:34', user: 'P. Moreau',  action: 'Dossier Axel Beaumont approuvé — matricule attribué', level: 'success' },
                { time: '2026-05-25 14:21', user: 'S. Laurent', action: 'Compte MAT20240046 bloqué pour impayés', level: 'warning' },
                { time: '2026-05-25 11:10', user: 'M. Dupont', action: 'Mission M001 (Prof. Martin) approuvée', level: 'success' },
                { time: '2026-05-24 17:05', user: 'A. Benali',  action: 'Tentative connexion échouée (mot de passe incorrect)', level: 'error' },
              ].map((e, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-2.5">
                  <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${e.level === 'error' ? 'bg-rose-500' : e.level === 'warning' ? 'bg-amber-400' : e.level === 'success' ? 'bg-emerald-500' : 'bg-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">{e.action}</p>
                    <p className="text-[10px] text-muted-foreground">{e.user} · {e.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MFA Setup — branché sur Supabase Auth */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Mon authentification à deux facteurs</h3>
            <AdminMFASetup />
          </div>

          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="font-semibold">Sécurité système</h3>
            {[
              { label: 'Authentification 2FA obligatoire',   value: true },
              { label: 'Session expire après 4h d\'inactivité', value: true },
              { label: 'Log toutes les actions sensibles',   value: true },
              { label: 'Accès restreint par IP universitaire', value: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-sm">{s.label}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.value ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {s.value ? '✓ Activé' : '○ Désactivé'}
                </span>
              </div>
            ))}
          </div>

          <button className="w-full rounded-lg border border-rose-300 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">
            📥 Exporter le journal d'audit complet
          </button>
        </div>
      )}
    </div>
  )
}

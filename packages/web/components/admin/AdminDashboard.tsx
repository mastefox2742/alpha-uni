'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const NOW = new Date('2026-05-26T09:15:00')

const ALERTS = [
  { id: 'a1', level: 'urgent',  module: 'Inscriptions',  text: '4 dossiers d\'immatriculation en attente de validation depuis > 48h',       href: '/admin/students',          badge: '4' },
  { id: 'a2', level: 'urgent',  module: 'Comptabilité',  text: '2 étudiants bloqués pour impayés — inscription aux examens impossible',       href: '/admin/students/finance',  badge: '2' },
  { id: 'a3', level: 'urgent',  module: 'Audit PV',      text: '1 verbale d\'examen en litige — erreur de saisie signalée par l\'étudiant',   href: '/admin/teachers/exams',    badge: '1' },
  { id: 'a4', level: 'warning', module: 'Missions',      text: '2 ordres de mission profs en attente d\'approbation administrative',          href: '/admin/teachers/missions', badge: '2' },
  { id: 'a5', level: 'warning', module: 'Laurea',         text: '3 dossiers de soutenance éligibles — jury à constituer avant 15 juin',       href: '/admin/graduation',        badge: '3' },
  { id: 'a6', level: 'info',    module: 'Inscriptions',  text: 'Période de préinscription 2026-2027 ouvre dans 12 jours',                     href: '/admin/calendar',          badge: undefined },
]

const KPIS = [
  { label: 'Étudiants inscrits',    value: 1_247, delta: '+38 ce mois',   color: 'text-indigo-600',  href: '/admin/students' },
  { label: 'Enseignants actifs',    value: 48,    delta: '3 en congé',    color: 'text-violet-600',  href: '/admin/teachers' },
  { label: 'Salles disponibles',    value: 12,    delta: '4 réservées',   color: 'text-blue-600',    href: '/admin/rooms' },
  { label: 'Dossiers en attente',   value: 9,     delta: '4 urgents',     color: 'text-rose-600',    href: '/admin/students', urgent: true },
  { label: 'Taux de réussite S2',   value: '78%', delta: '+2% vs S1',     color: 'text-emerald-600', href: '/admin/reports' },
  { label: 'Budget missions (mai)', value: '6.3K€',delta: '4 en attente', color: 'text-amber-600',   href: '/admin/teachers/missions' },
]

const RECENT_ACTIVITY = [
  { id: 'r1', icon: '✅', text: 'Dossier Axel Beaumont validé — Matricule MAT20260312 attribué',          time: 'Il y a 23 min',  type: 'success' },
  { id: 'r2', icon: '🔏', text: 'Verbale INFO301 / session mai 2026 — signature OTP confirmée (Prof. Martin)', time: 'Il y a 1h',    type: 'success' },
  { id: 'r3', icon: '⚠️', text: 'Compte Théo Richard (MAT20240046) bloqué — retard de paiement 45 jours', time: 'Il y a 2h',    type: 'warning' },
  { id: 'r4', icon: '📜', text: 'Attestation de scolarité générée — Sara Nakamura (M2 Informatique)',      time: 'Il y a 3h',    type: 'info' },
  { id: 'r5', icon: '🎓', text: 'Dossier Laurea validé — Amélie Gros : 180 CFU ✓, solde ✓',              time: 'Hier 16:42',   type: 'success' },
  { id: 'r6', icon: '❌', text: 'Dossier Kevin Tremblay incomplet — pièce d\'identité manquante',          time: 'Hier 14:10',   type: 'error' },
]

const PENDING_TASKS = [
  { id: 't1', priority: 'high',   text: 'Valider 4 dossiers d\'immatriculation',                  module: 'Inscriptions',  href: '/admin/students',          due: 'Aujourd\'hui' },
  { id: 't2', priority: 'high',   text: 'Débloquer / corriger verbale INFO301 (litige)',           module: 'Audit PV',      href: '/admin/teachers/exams',    due: 'Aujourd\'hui' },
  { id: 't3', priority: 'medium', text: 'Approuver 2 ordres de mission (Prof. Martin, Prof. Roux)',module: 'Missions',      href: '/admin/teachers/missions', due: 'Cette semaine' },
  { id: 't4', priority: 'medium', text: 'Constituer jury pour 3 soutenances de Laurea',            module: 'Diplômes',      href: '/admin/graduation',        due: 'Avant 15 juin' },
  { id: 't5', priority: 'low',    text: 'Générer les fiches de paie de mai 2026',                  module: 'RH',            href: '/admin/teachers',          due: '31 mai 2026' },
  { id: 't6', priority: 'low',    text: 'Réserver salles pour les rattrapages de juin',            module: 'Salles',        href: '/admin/rooms',             due: 'Avant 10 juin' },
]

function priorityColor(p: string) {
  if (p === 'high')   return 'bg-rose-500'
  if (p === 'medium') return 'bg-amber-400'
  return 'bg-slate-300 dark:bg-slate-600'
}

export function AdminDashboard() {
  const [clock, setClock] = useState(NOW)
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const h = clock.getHours()
  const greeting = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'

  const urgentCount  = ALERTS.filter(a => a.level === 'urgent').length
  const pendingCount = PENDING_TASKS.length

  return (
    <div className="space-y-6">

      {/* Welcome header */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-600 to-rose-800 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-rose-200">Back-Office Administration</p>
            <h1 className="mt-1 text-2xl font-bold">{greeting}, Agent Administratif 👋</h1>
            <p className="mt-1 text-sm text-rose-200">Université de Paris — Gestion centralisée</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold font-mono">
              {clock.getHours().toString().padStart(2,'0')}:{clock.getMinutes().toString().padStart(2,'0')}
            </p>
            <p className="text-sm text-rose-200">
              {clock.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </p>
            {urgentCount > 0 && (
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
                🔴 {urgentCount} alerte{urgentCount > 1 ? 's' : ''} urgente{urgentCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {KPIS.map(k => (
          <Link
            key={k.label}
            href={k.href}
            className={`rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow ${k.urgent ? 'border-rose-200 dark:border-rose-800' : ''}`}
          >
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="mt-0.5 text-xs font-medium text-foreground">{k.label}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{k.delta}</p>
          </Link>
        ))}
      </div>

      {/* Alerts + Tasks */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Alerts */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold">🔔 Alertes actives</h2>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
              {ALERTS.length}
            </span>
          </div>
          <div className="divide-y">
            {ALERTS.map(a => (
              <Link
                key={a.id}
                href={a.href}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  a.level === 'urgent' ? 'bg-rose-500' : a.level === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">{a.module}</span>
                    {a.badge && (
                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                        {a.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground mt-0.5">{a.text}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending tasks */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="font-semibold">📋 Tâches à traiter</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              {pendingCount}
            </span>
          </div>
          <div className="divide-y">
            {PENDING_TASKS.map(t => (
              <Link
                key={t.id}
                href={t.href}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${priorityColor(t.priority)}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">{t.text}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{t.module}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] font-medium text-amber-600">{t.due}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">⚡ Activité récente</h2>
        </div>
        <div className="divide-y">
          {RECENT_ACTIVITY.map(a => (
            <div key={a.id} className="flex items-start gap-3 px-4 py-3">
              <span className="text-base shrink-0">{a.icon}</span>
              <p className="flex-1 text-xs text-foreground">{a.text}</p>
              <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

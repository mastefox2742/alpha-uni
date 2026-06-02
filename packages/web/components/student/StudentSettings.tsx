'use client'

import { useState } from 'react'

export function StudentSettings() {
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [examReminder, setExamReminder] = useState(true)
  const [feesAlert, setFeesAlert] = useState(true)
  const [thesisUpdates, setThesisUpdates] = useState(false)
  const [language, setLanguage] = useState<'fr' | 'it' | 'en'>('fr')

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold">⚙️ Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez vos préférences de notification et d'affichage.
        </p>
      </div>

      {/* ── Compte ─────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Mon compte</h2>
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <p className="text-sm font-medium">Photo de profil</p>
            <p className="text-xs text-muted-foreground">Visible dans la sidebar et vos interactions</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            DE
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">Adresse e-mail</p>
            <p className="text-xs text-muted-foreground">demo.etudiant@unigest.fr</p>
          </div>
          <button className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
            Modifier
          </button>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">Mot de passe</p>
            <p className="text-xs text-muted-foreground">Dernière modification il y a 30 jours</p>
          </div>
          <button className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
            Changer
          </button>
        </div>
      </section>

      {/* ── Notifications ──────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Notifications</h2>
        <p className="text-xs text-muted-foreground -mt-2">
          Choisissez les alertes que vous souhaitez recevoir par e-mail.
        </p>

        {[
          {
            id: 'email',
            label: 'Notifications générales',
            desc:  'Actualités et annonces de l\'université',
            value: emailNotifs,
            set:   setEmailNotifs,
          },
          {
            id: 'exam',
            label: 'Rappels d\'examens',
            desc:  '48h et 24h avant un appel auquel vous êtes inscrit',
            value: examReminder,
            set:   setExamReminder,
          },
          {
            id: 'fees',
            label: 'Alertes de frais',
            desc:  'Rappel avant échéance et confirmation de paiement',
            value: feesAlert,
            set:   setFeesAlert,
          },
          {
            id: 'thesis',
            label: 'Mises à jour de thèse',
            desc:  'Changements de statut sur votre dossier de thèse',
            value: thesisUpdates,
            set:   setThesisUpdates,
          },
        ].map(({ id, label, desc, value, set }) => (
          <div key={id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={value}
              onClick={() => set(!value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${value ? 'bg-primary' : 'bg-input'}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform
                  ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        ))}
      </section>

      {/* ── Langue ─────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Langue d'affichage</h2>
        <div className="flex gap-2">
          {(['fr', 'it', 'en'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors
                ${language === lang
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-accent'}`}
            >
              {lang === 'fr' ? '🇫🇷 Français' : lang === 'it' ? '🇮🇹 Italiano' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </section>

      {/* ── Zone danger ────────────────────────────────── */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
        <h2 className="text-base font-semibold text-destructive">Zone sensible</h2>
        <p className="text-xs text-muted-foreground">
          Ces actions sont irréversibles. Contactez l'administration si vous avez besoin d'aide.
        </p>
        <button className="rounded-lg border border-destructive/50 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
          Demander la suppression du compte
        </button>
      </section>
    </div>
  )
}

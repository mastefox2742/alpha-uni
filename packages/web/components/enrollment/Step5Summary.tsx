'use client'

import type { Step1Data } from './Step1Account'
import type { Step2Data } from './Step2Personal'
import type { Step3Data } from './Step3Program'
import type { UploadedDoc } from './Step4Documents'

interface Props {
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  docs:  UploadedDoc[]
  programName: string
  onSubmit: () => void
  onBack:   () => void
  isSubmitting: boolean
}

export function Step5Summary({ step1, step2, step3, docs, programName, onSubmit, onBack, isSubmitting }: Props) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Récapitulatif de votre dossier</h2>

      <Section title="Compte">
        <Row label="Email" value={step1.email} />
      </Section>

      <Section title="Identité">
        <Row label="Nom complet"      value={`${step2.firstName} ${step2.lastName}`} />
        <Row label="Date de naissance" value={new Intl.DateTimeFormat('fr-FR').format(new Date(step2.dateOfBirth))} />
        <Row label="Lieu"              value={step2.placeOfBirth} />
        <Row label="Nationalité"       value={step2.nationality} />
        <Row label="Téléphone"         value={step2.phone} />
        <Row label="Adresse"           value={step2.address} />
      </Section>

      <Section title="Filière">
        <Row label="Programme" value={programName} />
      </Section>

      <Section title="Documents">
        {docs.map(d => (
          <Row key={d.type} label={d.type.replace('_', ' ')} value={`✓ ${d.fileName}`} />
        ))}
      </Section>

      <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
        En cliquant sur « Soumettre », votre dossier sera transmis à la secrétariat pour validation.
        Vous serez notifié(e) par email dans un délai de 5 jours ouvrés.
      </p>

      <div className="flex gap-3">
        <button onClick={onBack} disabled={isSubmitting}
          className="flex-1 rounded-md border px-4 py-2 text-sm hover:bg-accent disabled:opacity-40">
          ← Modifier
        </button>
        <button onClick={onSubmit} disabled={isSubmitting}
          className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {isSubmitting ? '⏳ Envoi…' : '✅ Soumettre mon dossier'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground capitalize">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}

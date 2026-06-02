'use client'

import { useState, useRef } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ────────────────────────────────────────────────────────────────────
type ThesisType  = 'research' | 'compilative' | 'internship'
type DemoStage   = 'locked' | 'form' | 'submitted'

interface ThesisForm {
  type:          ThesisType
  title:         string
  relateur:      string
  coRelateur:    string
  abstract:      string
}

// ─── Constantes démo ──────────────────────────────────────────────────────────
const CFU_CURRENT  = 39    // depuis les données libretto démo
const CFU_REQUIRED = 150   // seuil pour soumettre la thèse

const THESIS_TYPES: { value: ThesisType; label: string; desc: string }[] = [
  { value: 'research',    label: 'Thèse de Recherche',    desc: 'Contribution originale à un domaine de recherche' },
  { value: 'compilative', label: 'Thèse Compilative',     desc: 'Synthèse et analyse critique de la littérature existante' },
  { value: 'internship',  label: 'Stage de fin d\'études', desc: 'Rapport et analyse d\'un stage en entreprise' },
]

const PROFESSORS = [
  'Prof. Rossi Marco',
  'Prof. Bianchi Laura',
  'Prof. Ferrari Anna',
  'Prof. Conti Paolo',
  'Prof. Marini Giulia',
  'Prof. Moretti Chiara',
  'Prof. Esposito Roberto',
]

// ─── Données de la thèse démo soumise ────────────────────────────────────────
const DEMO_THESIS = {
  type:       'research' as ThesisType,
  title:      'Optimisation des algorithmes de routage pour les réseaux IoT à ressources contraintes',
  relateur:   'Prof. Conti Paolo',
  coRelateur: '',
  abstract:   'Cette thèse explore les méthodes d\'optimisation des protocoles de routage dans les réseaux IoT (Internet of Things) à faibles ressources computationnelles. En combinant des approches issues de la théorie des graphes et de l\'apprentissage automatique, nous proposons un nouveau protocole adaptatif réduisant la consommation énergétique de 34% par rapport aux solutions existantes.',
  submittedAt: new Date('2026-05-15'),
  approvedAt:  new Date('2026-05-20'),
  relatorNote: 'Sujet très pertinent et bien défini. Je suis disponible pour la première réunion de suivi le 2 juin. Préparez une revue de littérature préliminaire.',
}

// ─── Stepper steps ────────────────────────────────────────────────────────────
type StepStatus = 'done' | 'current' | 'locked'
interface Step {
  id:     number
  label:  string
  sub:    string
  status: StepStatus
  date?:  string
}

const DEMO_STEPS: Step[] = [
  {
    id: 1,
    label: 'Demande envoyée',
    sub: 'En attente de validation par le secrétariat',
    status: 'done',
    date: '15 mai 2026',
  },
  {
    id: 2,
    label: 'Approbation du Relateur',
    sub: 'Le directeur de thèse a validé le sujet',
    status: 'done',
    date: '20 mai 2026',
  },
  {
    id: 3,
    label: 'Dépôt du manuscrit final',
    sub: 'Déposez votre PDF avant la date limite',
    status: 'current',
  },
  {
    id: 4,
    label: 'Convocation à la soutenance',
    sub: 'Date, salle et jury communiqués par le secrétariat',
    status: 'locked',
  },
]

// ─── Composant Skeleton ───────────────────────────────────────────────────────
function ThesisSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-3 w-36" />
      </div>
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Écran verrouillé (CFU insuffisants) ──────────────────────────────────────
function LockedScreen({ onPreview }: { onPreview: () => void }) {
  const pct = Math.round((CFU_CURRENT / CFU_REQUIRED) * 100)
  const remaining = CFU_REQUIRED - CFU_CURRENT

  return (
    <div className="space-y-5">
      {/* Carte principale */}
      <div className="rounded-2xl border-2 border-dashed bg-card p-8 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">
          🔒
        </div>
        <div>
          <h2 className="text-xl font-bold">Accès non disponible</h2>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Vous n'avez pas encore validé suffisamment de crédits pour soumettre votre sujet de thèse de Laurea.
          </p>
        </div>

        {/* Barre de progression CFU */}
        <div className="mx-auto max-w-sm space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Crédits validés</span>
            <span className="font-bold tabular-nums">
              {CFU_CURRENT} <span className="text-muted-foreground font-normal">/ {CFU_REQUIRED} CFU requis</span>
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground text-right">
            {pct}% complété — encore <strong>{remaining} CFU</strong> à valider
          </p>
        </div>

        <div className="rounded-xl bg-muted/40 border p-4 text-left max-w-sm mx-auto">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Conditions d'accès</p>
          <ul className="space-y-1.5 text-[12px]">
            <li className="flex items-center gap-2">
              <span className={CFU_CURRENT >= CFU_REQUIRED ? 'text-emerald-600' : 'text-muted-foreground'}>
                {CFU_CURRENT >= CFU_REQUIRED ? '✅' : '⬜'}
              </span>
              <span>Minimum <strong>{CFU_REQUIRED} CFU</strong> validés sur {CFU_REQUIRED + 30}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground">⬜</span>
              <span>Aucune taxe universitaire en retard</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground">⬜</span>
              <span>Inscription en dernière année du cursus</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Lien aperçu démo */}
      <div className="text-center">
        <button
          onClick={onPreview}
          className="text-[11px] text-muted-foreground hover:text-primary underline-offset-2 hover:underline transition-colors"
        >
          👁 Aperçu démo — voir le formulaire de soumission →
        </button>
      </div>
    </div>
  )
}

// ─── Formulaire de soumission ─────────────────────────────────────────────────
function SubmissionForm({ onSubmit, onBack }: {
  onSubmit: (form: ThesisForm) => void
  onBack:   () => void
}) {
  const [form, setForm] = useState<ThesisForm>({
    type:       'research',
    title:      '',
    relateur:   '',
    coRelateur: '',
    abstract:   '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ThesisForm, string>>>({})

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.title.trim())    e.title    = 'Le titre est obligatoire'
    if (!form.relateur)        e.relateur = 'Sélectionnez un directeur de thèse'
    if (!form.abstract.trim()) e.abstract = 'L\'abstract est obligatoire'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (validate()) onSubmit(form)
  }

  const selectedType = THESIS_TYPES.find((t) => t.value === form.type)

  return (
    <div className="space-y-5">
      {/* Indicateur étapes */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">1</span>
        <span className="font-medium text-foreground">Formulaire</span>
        <span className="text-border">→</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">2</span>
        <span>Validation secrétariat</span>
        <span className="text-border">→</span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">3</span>
        <span>Soutenance</span>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b bg-primary/5 px-6 py-4">
          <h2 className="font-bold text-base">📝 Demande de thèse de Laurea</h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Remplissez soigneusement ce formulaire — il sera examiné par le secrétariat et votre directeur.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Type de thèse */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Type de thèse <span className="text-destructive">*</span>
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {THESIS_TYPES.map((t) => (
                <label
                  key={t.value}
                  className={`flex flex-col gap-1 rounded-xl border p-3 cursor-pointer transition-all ${
                    form.type === t.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="thesis-type"
                    value={t.value}
                    checked={form.type === t.value}
                    onChange={() => setForm((f) => ({ ...f, type: t.value }))}
                    className="sr-only"
                  />
                  <span className="text-xs font-semibold">{t.label}</span>
                  <span className="text-[10px] text-muted-foreground leading-snug">{t.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Titre provisoire <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Titre complet et définitif de votre thèse…"
              className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                errors.title ? 'border-destructive' : ''
              }`}
            />
            {errors.title && <p className="mt-1 text-[11px] text-destructive">{errors.title}</p>}
            <p className="mt-1 text-[11px] text-muted-foreground">
              Ce titre peut être modifié jusqu'à l'approbation finale.
            </p>
          </div>

          {/* Relateur + Co-relateur */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Relateur (Directeur de thèse) <span className="text-destructive">*</span>
              </label>
              <select
                value={form.relateur}
                onChange={(e) => setForm((f) => ({ ...f, relateur: e.target.value }))}
                className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                  errors.relateur ? 'border-destructive' : ''
                }`}
              >
                <option value="">— Sélectionner un professeur —</option>
                {PROFESSORS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.relateur && <p className="mt-1 text-[11px] text-destructive">{errors.relateur}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Co-relateur <span className="text-[11px] font-normal text-muted-foreground">(optionnel)</span>
              </label>
              <input
                type="text"
                value={form.coRelateur}
                onChange={(e) => setForm((f) => ({ ...f, coRelateur: e.target.value }))}
                placeholder="Nom du co-directeur ou externe…"
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Description / Abstract <span className="text-destructive">*</span>
            </label>
            <textarea
              value={form.abstract}
              onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))}
              rows={6}
              placeholder="Décrivez votre sujet de thèse : problématique, méthodologie envisagée, objectifs et technologies utilisées. (300–800 mots recommandés)"
              className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
                errors.abstract ? 'border-destructive' : ''
              }`}
            />
            {errors.abstract && <p className="mt-1 text-[11px] text-destructive">{errors.abstract}</p>}
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-muted-foreground">
                Ce résumé sera envoyé à votre directeur pour approbation.
              </p>
              <p className="text-[11px] text-muted-foreground tabular-nums">{form.abstract.length} caractères</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 border-t bg-muted/20 px-6 py-4">
          <button
            onClick={onBack}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setForm({ type: 'research', title: '', relateur: '', coRelateur: '', abstract: '' })}
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
            >
              📤 Soumettre la demande
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stepper de suivi ─────────────────────────────────────────────────────────
function ProgressStepper() {
  const [uploadState, setUploadState] = useState<'idle' | 'dragging' | 'uploaded'>('idle')
  const [fileName, setFileName]       = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) { setFileName(file.name); setUploadState('uploaded') }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) { setFileName(file.name); setUploadState('uploaded') }
  }

  const stepIcons: Record<StepStatus, string> = {
    done:    '✅',
    current: '🔵',
    locked:  '⬜',
  }

  return (
    <div className="space-y-5">
      {/* Résumé de la thèse */}
      <div className="rounded-2xl border bg-card shadow-sm p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-violet-100 text-violet-800 px-2.5 py-0.5 text-[11px] font-semibold">
                {THESIS_TYPES.find((t) => t.value === DEMO_THESIS.type)?.label}
              </span>
            </div>
            <h2 className="font-bold text-base leading-tight">{DEMO_THESIS.title}</h2>
            <p className="text-[12px] text-muted-foreground mt-1">
              Relateur : <span className="text-foreground font-medium">{DEMO_THESIS.relateur}</span>
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[11px] font-bold">
            ✅ Approuvée
          </span>
        </div>
        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-3 italic">
          « {DEMO_THESIS.abstract} »
        </p>
      </div>

      {/* Stepper */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b bg-muted/20 px-6 py-4">
          <h3 className="font-semibold text-sm">⏳ Suivi d'avancement du dossier</h3>
        </div>

        <div className="p-6">
          <div className="space-y-0">
            {DEMO_STEPS.map((step, idx) => {
              const isLast = idx === DEMO_STEPS.length - 1
              return (
                <div key={step.id} className="flex gap-4">
                  {/* Ligne verticale + icône */}
                  <div className="flex flex-col items-center">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold border-2 ${
                      step.status === 'done'    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' :
                      step.status === 'current' ? 'border-primary bg-primary/10 text-primary' :
                      'border-border bg-muted text-muted-foreground'
                    }`}>
                      {step.status === 'done' ? '✓' : step.id}
                    </div>
                    {!isLast && (
                      <div className={`mt-1 mb-1 w-0.5 flex-1 min-h-[32px] ${
                        step.status === 'done' ? 'bg-emerald-400' : 'bg-border'
                      }`} />
                    )}
                  </div>

                  {/* Contenu */}
                  <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <p className={`font-semibold text-sm ${step.status === 'locked' ? 'text-muted-foreground' : ''}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <span className="text-[11px] text-muted-foreground">— {step.date}</span>
                      )}
                      {step.status === 'current' && (
                        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                          En cours
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground">{step.sub}</p>

                    {/* Contenu spécifique par étape */}
                    {step.id === 2 && step.status === 'done' && (
                      <div className="mt-3 rounded-xl bg-muted/40 border p-3">
                        <p className="text-[12px] font-semibold mb-1">Note du relateur</p>
                        <p className="text-[12px] text-muted-foreground italic leading-relaxed">
                          💬 « {DEMO_THESIS.relatorNote} »
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-2">— {DEMO_THESIS.relateur}</p>
                      </div>
                    )}

                    {step.id === 3 && step.status === 'current' && (
                      <div className="mt-3 space-y-3">
                        {/* Deadline */}
                        <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 px-4 py-2.5">
                          <span className="text-amber-600">📅</span>
                          <div>
                            <p className="text-[12px] font-semibold text-amber-800 dark:text-amber-400">
                              Dépôt avant le <strong>15 octobre 2026 à 23:59</strong>
                            </p>
                            <p className="text-[11px] text-amber-700 dark:text-amber-500">Format PDF uniquement · Max 50 Mo</p>
                          </div>
                        </div>

                        {/* Zone drag & drop */}
                        {uploadState !== 'uploaded' ? (
                          <div
                            onDragOver={(e) => { e.preventDefault(); setUploadState('dragging') }}
                            onDragLeave={() => setUploadState('idle')}
                            onDrop={handleDrop}
                            onClick={() => fileRef.current?.click()}
                            className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all ${
                              uploadState === 'dragging'
                                ? 'border-primary bg-primary/5 scale-[1.01]'
                                : 'border-border hover:border-primary/60 hover:bg-muted/30'
                            }`}
                          >
                            <span className="text-3xl">{uploadState === 'dragging' ? '📂' : '📄'}</span>
                            <div className="text-center">
                              <p className="text-sm font-semibold">
                                {uploadState === 'dragging' ? 'Relâchez pour déposer' : 'Glissez votre thèse ici'}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">ou cliquez pour sélectionner un fichier PDF</p>
                            </div>
                            <span className="rounded-xl border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                              Parcourir les fichiers
                            </span>
                            <input
                              ref={fileRef}
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">📄</span>
                              <div>
                                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">{fileName}</p>
                                <p className="text-[11px] text-emerald-700">Fichier prêt à être soumis</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setUploadState('idle'); setFileName(null) }}
                                className="rounded-lg border border-red-200 px-3 py-1 text-[11px] text-red-600 hover:bg-red-50 transition-colors"
                              >
                                ✕ Supprimer
                              </button>
                              <button
                                className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors"
                              >
                                ↑ Soumettre
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {step.id === 4 && step.status === 'locked' && (
                      <div className="mt-2 rounded-xl bg-muted/30 border border-dashed px-4 py-3">
                        <p className="text-[11px] text-muted-foreground italic">
                          Disponible après validation du manuscrit final. La commission de thèse communiquera la date, l'heure, la salle et la composition du jury.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function ThesisPage() {
  const [stage, setStage] = useState<DemoStage>('locked')
  const [toast, setToast] = useState<string | null>(null)

  function handleSubmitForm(form: ThesisForm) {
    setStage('submitted')
    setToast('🎉 Demande envoyée ! Votre dossier est en cours de traitement.')
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="space-y-6 pb-8">

      {/* ── En-tête ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">🎓 Thèse de Laurea</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Soumettez votre sujet, suivez l'avancement et déposez votre manuscrit final.
          </p>
        </div>
        {/* Navigation démo */}
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1 shrink-0">
          {([
            { key: 'locked' as DemoStage, label: '🔒 Verrouillé', title: 'Étape 0 — CFU insuffisants' },
            { key: 'form'   as DemoStage, label: '📝 Formulaire', title: 'Étape 1 — Soumission' },
            { key: 'submitted' as DemoStage, label: '⏳ Suivi',     title: 'Étape 2 — Progression' },
          ]).map(({ key, label, title }) => (
            <button
              key={key}
              onClick={() => setStage(key)}
              title={title}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                stage === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu selon l'état ─────────────────────────────────────────── */}
      {stage === 'locked'    && <LockedScreen  onPreview={() => setStage('form')} />}
      {stage === 'form'      && <SubmissionForm onSubmit={handleSubmitForm} onBack={() => setStage('locked')} />}
      {stage === 'submitted' && <ProgressStepper />}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-emerald-900 text-white px-5 py-3 shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  )
}

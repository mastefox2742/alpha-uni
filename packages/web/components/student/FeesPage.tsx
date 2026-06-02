'use client'

import { useState, useMemo } from 'react'
import { format, isPast, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Types ────────────────────────────────────────────────────────────────────
type FeeStatus = 'overdue' | 'pending' | 'paid' | 'waived'
type AcademicYear = '2025/2026' | '2024/2025' | 'Toutes'

interface DemoFee {
  id:           string
  label:        string
  detail:       string
  amount:       number
  lateFee:      number
  dueDate:      Date
  status:       FeeStatus
  paidAt:       Date | null
  academicYear: string
  bulletinCode: string | null
}

// ─── Données démo ─────────────────────────────────────────────────────────────
const INITIAL_FEES: DemoFee[] = [
  // En retard
  {
    id: 'f1', label: '1ère tranche 2025/2026',
    detail: 'Contribution universitaire — 1er versement',
    amount: 350, lateFee: 35,
    dueDate: new Date('2026-02-28'), status: 'overdue', paidAt: null,
    academicYear: '2025/2026', bulletinCode: 'PGPA-2026-F1A',
  },
  // En attente urgents
  {
    id: 'f2', label: '2ème tranche 2025/2026',
    detail: 'Contribution universitaire — 2ème versement',
    amount: 450, lateFee: 0,
    dueDate: new Date('2026-05-31'), status: 'pending', paidAt: null,
    academicYear: '2025/2026', bulletinCode: 'PGPA-2026-F2A',
  },
  {
    id: 'f3', label: 'Taxe régionale 2025/2026',
    detail: 'Tassa Regionale per il Diritto allo Studio',
    amount: 140, lateFee: 0,
    dueDate: new Date('2026-07-15'), status: 'pending', paidAt: null,
    academicYear: '2025/2026', bulletinCode: 'PGPA-2026-F3A',
  },
  // Payé 2025/2026
  {
    id: 'f4', label: "Droits d'inscription 2025/2026",
    detail: "Immatricolazione e tasse di segreteria",
    amount: 220, lateFee: 0,
    dueDate: new Date('2025-09-20'), status: 'paid', paidAt: new Date('2025-09-18'),
    academicYear: '2025/2026', bulletinCode: 'PGPA-2025-F0A',
  },
  {
    id: 'f5', label: 'Empreinte de timbre numérique',
    detail: 'Bollo digitale su documentazione universitaria',
    amount: 16, lateFee: 0,
    dueDate: new Date('2025-09-20'), status: 'paid', paidAt: new Date('2025-09-18'),
    academicYear: '2025/2026', bulletinCode: 'PGPA-2025-F0B',
  },
  // Payé 2024/2025
  {
    id: 'f6', label: "Droits d'inscription 2024/2025",
    detail: "Immatricolazione e tasse di segreteria",
    amount: 220, lateFee: 0,
    dueDate: new Date('2024-09-20'), status: 'paid', paidAt: new Date('2024-09-15'),
    academicYear: '2024/2025', bulletinCode: 'PGPA-2024-F0A',
  },
  {
    id: 'f7', label: '1ère tranche 2024/2025',
    detail: 'Contribution universitaire — 1er versement',
    amount: 350, lateFee: 0,
    dueDate: new Date('2025-02-28'), status: 'paid', paidAt: new Date('2025-02-15'),
    academicYear: '2024/2025', bulletinCode: 'PGPA-2024-F1A',
  },
  {
    id: 'f8', label: '2ème tranche 2024/2025',
    detail: 'Contribution universitaire — 2ème versement',
    amount: 450, lateFee: 0,
    dueDate: new Date('2025-05-31'), status: 'paid', paidAt: new Date('2025-05-20'),
    academicYear: '2024/2025', bulletinCode: null,
  },
  {
    id: 'f9', label: 'Taxe régionale 2024/2025',
    detail: 'Tassa Regionale per il Diritto allo Studio',
    amount: 140, lateFee: 0,
    dueDate: new Date('2025-07-15'), status: 'paid', paidAt: new Date('2025-07-10'),
    academicYear: '2024/2025', bulletinCode: 'PGPA-2024-F3A',
  },
  {
    id: 'f10', label: 'Empreinte de timbre numérique',
    detail: 'Bollo digitale su documentazione universitaria',
    amount: 16, lateFee: 0,
    dueDate: new Date('2024-09-20'), status: 'paid', paidAt: new Date('2024-09-15'),
    academicYear: '2024/2025', bulletinCode: 'PGPA-2024-F0B',
  },
]

// ─── PDF reçu de paiement ─────────────────────────────────────────────────────
function buildReceiptHtml(fee: DemoFee) {
  const paidDateStr = fee.paidAt ? format(fee.paidAt, "d MMMM yyyy 'à' HH:mm", { locale: fr }) : '—'
  const total = fee.amount + fee.lateFee
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Reçu de paiement — ${fee.bulletinCode ?? fee.id}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#111827; background:#fff; padding:40px; }
    .header { display:flex; justify-content:space-between; border-bottom:2px solid #111827; padding-bottom:16px; margin-bottom:28px; }
    .logo { font-size:20px; font-weight:800; }
    .sub { font-size:12px; color:#6b7280; }
    .receipt-title { font-size:18px; font-weight:700; margin-bottom:8px; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:20px 0; }
    .field label { font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:#6b7280; display:block; margin-bottom:3px; }
    .field span { font-size:14px; font-weight:500; }
    .total-box { border:2px solid #16a34a; border-radius:12px; padding:16px 24px; text-align:center; margin:24px 0; }
    .total-box p:first-child { font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:.06em; }
    .total-box p:last-child { font-size:36px; font-weight:800; color:#16a34a; }
    .badge { display:inline-block; background:#dcfce7; border:1px solid #86efac; border-radius:20px; padding:4px 14px; font-size:13px; font-weight:600; color:#16a34a; }
    .footer { margin-top:40px; border-top:1px solid #e5e7eb; padding-top:12px; font-size:10px; color:#9ca3af; display:flex; justify-content:space-between; }
    @media print { body { padding:20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div><div class="logo">🎓 UniGest</div><div class="sub">Service financier — Reçu de paiement</div></div>
    <div style="text-align:right"><p style="font-size:11px;color:#6b7280">Imprimé le ${format(new Date(), "d MMMM yyyy", { locale: fr })}</p></div>
  </div>
  <p class="receipt-title">Reçu de paiement officiel</p>
  <p style="font-size:13px;color:#6b7280;margin-bottom:20px">${fee.detail}</p>
  <div class="total-box">
    <p>Montant réglé</p>
    <p>${total.toFixed(2)} €</p>
  </div>
  <div class="grid">
    <div class="field"><label>Libellé</label><span>${fee.label}</span></div>
    <div class="field"><label>Statut</label><span><span class="badge">✅ Payé</span></span></div>
    <div class="field"><label>Date de paiement</label><span>${paidDateStr}</span></div>
    <div class="field"><label>Année académique</label><span>${fee.academicYear}</span></div>
    ${fee.bulletinCode ? `<div class="field"><label>Code PagoPA</label><span style="font-family:monospace">${fee.bulletinCode}</span></div>` : ''}
    ${fee.lateFee > 0 ? `<div class="field"><label>Pénalité de retard</label><span style="color:#dc2626">+${fee.lateFee.toFixed(2)} €</span></div>` : ''}
  </div>
  <p style="font-size:12px;background:#f0fdf4;padding:12px 16px;border-radius:8px;border:1px solid #86efac;color:#15803d;">
    ✅ Ce document constitue un reçu officiel de paiement. Conservez-le pour vos déclarations fiscales et demandes de bourses.
  </p>
  <div class="footer">
    <span>UniGest — Système de Gestion Universitaire</span>
    <span>Document fiscal — généré le ${format(new Date(), "d/MM/yyyy", { locale: fr })}</span>
  </div>
</body>
</html>`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function deadlinePill(fee: DemoFee) {
  if (fee.status === 'paid' || fee.status === 'waived') return null
  if (fee.status === 'overdue') {
    const days = Math.abs(differenceInDays(new Date(), fee.dueDate))
    return { label: `Échue depuis ${days} jour${days > 1 ? 's' : ''}`, cls: 'bg-red-100 text-red-800 border-red-200' }
  }
  const days = differenceInDays(fee.dueDate, new Date())
  if (days <= 5)  return { label: `⚡ Dans ${days} jour${days > 1 ? 's' : ''}`, cls: 'bg-amber-100 text-amber-800 border-amber-200' }
  if (days <= 14) return { label: `Dans ${days} jours`, cls: 'bg-yellow-50 text-yellow-800 border-yellow-200' }
  return { label: `Échéance ${format(fee.dueDate, 'd MMM', { locale: fr })}`, cls: 'bg-muted text-muted-foreground border-border' }
}

function statusConfig(status: FeeStatus) {
  const m = {
    overdue: { label: 'En retard',   cls: 'bg-red-100 text-red-800'           },
    pending: { label: 'En attente',  cls: 'bg-yellow-100 text-yellow-800'      },
    paid:    { label: 'Payé',        cls: 'bg-emerald-100 text-emerald-800'    },
    waived:  { label: 'Exonéré',     cls: 'bg-sky-100 text-sky-800'            },
  }
  return m[status]
}

// ─── Modal PagoPA / paiement ──────────────────────────────────────────────────
function PaymentModal({ fee, onClose, onPaid }: {
  fee: DemoFee
  onClose: () => void
  onPaid:  (id: string) => void
}) {
  const [step, setStep] = useState<'info' | 'done'>('info')
  const total = fee.amount + fee.lateFee

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border shadow-xl overflow-hidden">

        {step === 'info' ? (
          <>
            {/* Header PagoPA */}
            <div className="bg-[#0066cc] px-6 py-4 flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-bold text-white text-base">Paiement via PagoPA</p>
                <p className="text-blue-200 text-[11px]">Plateforme nationale de paiement public</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Détails */}
              <div className="space-y-2">
                <p className="font-semibold text-base">{fee.label}</p>
                <p className="text-[12px] text-muted-foreground">{fee.detail}</p>
              </div>

              {/* Montants */}
              <div className="rounded-xl bg-muted/40 border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-medium">{fee.amount.toFixed(2)} €</span>
                </div>
                {fee.lateFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Pénalité de retard</span>
                    <span className="font-medium text-red-600">+{fee.lateFee.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t pt-2 mt-1">
                  <span>Total à régler</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              {/* Code PagoPA */}
              {fee.bulletinCode && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-blue-600 mb-1">Code avis PagoPA</p>
                  <p className="font-mono text-sm font-bold text-blue-900 tracking-wider">{fee.bulletinCode}</p>
                  <p className="text-[11px] text-blue-600 mt-1">À saisir sur la plateforme PagoPA ou en agence</p>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Le paiement s'effectue sur la plateforme nationale PagoPA (pagoPA.gov.it),
                dans n'importe quelle banque ou tabac conventionne, ou directement par carte sur le portail universitaire.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    onPaid(fee.id)
                    setStep('done')
                  }}
                  className="flex-1 rounded-xl bg-[#0066cc] py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  ✓ Simuler le paiement (démo)
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h3 className="font-bold text-xl">Paiement confirmé !</h3>
            <p className="text-sm text-muted-foreground">
              Votre paiement de <strong>{total.toFixed(2)} €</strong> pour <em>{fee.label}</em> a été enregistré.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Un reçu de paiement est maintenant disponible dans le tableau ci-dessous.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Carte KPI ────────────────────────────────────────────────────────────────
function SummaryCard({
  icon, label, amount, sub, variant, action,
}: {
  icon:     string
  label:    string
  amount:   number
  sub?:     string
  variant:  'danger' | 'warning' | 'success' | 'neutral'
  action?:  { label: string; onClick: () => void } | undefined
}) {
  const styles = {
    danger:  { card: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30',     amount: 'text-red-700 dark:text-red-400',     dot: 'bg-red-500' },
    warning: { card: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30', amount: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    success: { card: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30', amount: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    neutral: { card: 'bg-card', amount: 'text-foreground', dot: 'bg-muted-foreground' },
  }
  const s = styles[variant]

  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow ${s.card}`}>
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
      </div>
      <div className="flex items-end gap-1">
        <p className={`text-3xl font-black tabular-nums ${s.amount}`}>{amount.toFixed(2)}</p>
        <p className="text-base font-bold text-muted-foreground pb-0.5">€</p>
      </div>
      {sub && <p className="text-[11px] text-muted-foreground leading-snug">{sub}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className={`mt-1 self-start rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
            variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
            variant === 'warning' ? 'bg-amber-600 text-white hover:bg-amber-700' :
            'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function FeesPage() {
  const [fees,     setFees]     = useState<DemoFee[]>(INITIAL_FEES)
  const [yearFilter, setYearFilter] = useState<AcademicYear>('2025/2026')
  const [payModal, setPayModal] = useState<DemoFee | null>(null)
  const [toast,    setToast]    = useState<string | null>(null)

  // ── Statistiques ─────────────────────────────────────────────────────────
  const currentFees = fees.filter((f) => f.academicYear === '2025/2026')
  const overdueTotal  = currentFees.filter((f) => f.status === 'overdue').reduce((s, f) => s + f.amount + f.lateFee, 0)
  const pendingTotal  = currentFees.filter((f) => f.status === 'pending').reduce((s, f) => s + f.amount, 0)
  const paidTotal     = currentFees.filter((f) => f.status === 'paid').reduce((s, f) => s + f.amount + f.lateFee, 0)

  const nextPending = currentFees
    .filter((f) => f.status === 'pending')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0]

  const firstOverdue = currentFees.find((f) => f.status === 'overdue')

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const list = yearFilter === 'Toutes' ? fees : fees.filter((f) => f.academicYear === yearFilter)
    return [...list].sort((a, b) => {
      const order: Record<FeeStatus, number> = { overdue: 0, pending: 1, waived: 2, paid: 3 }
      return (order[a.status] ?? 4) - (order[b.status] ?? 4) || a.dueDate.getTime() - b.dueDate.getTime()
    })
  }, [fees, yearFilter])

  // ── Actions ───────────────────────────────────────────────────────────────
  function handlePaid(id: string) {
    setFees((prev) => prev.map((f) =>
      f.id === id ? { ...f, status: 'paid', paidAt: new Date() } : f
    ))
    showToast('Paiement enregistré ✅ — Le reçu est disponible dans le tableau.')
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  function downloadReceipt(fee: DemoFee) {
    const html = buildReceiptHtml(fee)
    const win = window.open('', '_blank', 'width=800,height=650')
    if (!win) { alert('Autorisez les popups pour télécharger le reçu.'); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }

  return (
    <div className="space-y-6 pb-8">

      {/* ── En-tête ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">💳 Frais de scolarité</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultez vos échéances, réglez vos taxes et téléchargez vos reçus officiels.
          </p>
        </div>
        {/* Filtre année */}
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1 shrink-0">
          {(['2025/2026', '2024/2025', 'Toutes'] as const).map((y) => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                yearFilter === y ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* ── Alerte retard ────────────────────────────────────────────────── */}
      {overdueTotal > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/20 px-5 py-4">
          <span className="mt-0.5 text-red-600 text-lg animate-pulse">🔴</span>
          <div className="flex-1">
            <p className="font-bold text-red-800 dark:text-red-400">
              Paiement en retard — {overdueTotal.toFixed(2)} € (pénalités incluses)
            </p>
            <p className="text-[12px] text-red-600 mt-0.5">
              Des pénalités de retard s'accumulent chaque mois. Régularisez votre situation dès que possible.
            </p>
          </div>
          {firstOverdue && (
            <button
              onClick={() => setPayModal(firstOverdue)}
              className="shrink-0 self-center rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors"
            >
              Payer maintenant
            </button>
          )}
        </div>
      )}

      {/* ── 3 KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon="🔴" label="En retard"
          amount={overdueTotal}
          sub={overdueTotal > 0 ? 'Pénalités incluses — régularisez immédiatement' : 'Aucun impayé en retard'}
          variant={overdueTotal > 0 ? 'danger' : 'neutral'}
          action={firstOverdue && overdueTotal > 0 ? { label: '⚡ Payer immédiatement', onClick: () => setPayModal(firstOverdue) } : undefined}
        />
        <SummaryCard
          icon="🟡" label="En attente"
          amount={pendingTotal}
          sub={nextPending
            ? `Prochaine échéance : ${format(nextPending.dueDate, 'd MMM yyyy', { locale: fr })}`
            : 'Aucune échéance à venir'}
          variant={pendingTotal > 0 ? 'warning' : 'neutral'}
        />
        <SummaryCard
          icon="🟢" label="Payé cette année"
          amount={paidTotal}
          sub="Année académique 2025/2026"
          variant={paidTotal > 0 ? 'success' : 'neutral'}
        />
      </div>

      {/* ── Tableau des factures ─────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
          <h2 className="font-semibold text-sm">🧾 Historique des paiements</h2>
          <span className="text-[11px] text-muted-foreground">{filtered.length} ligne{filtered.length > 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="py-3 px-4 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Libellé</th>
                <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-[90px]">Montant</th>
                <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-[80px]">Pénalité</th>
                <th className="py-3 px-4 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-[100px]">Statut</th>
                <th className="py-3 px-4 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-[120px]">Échéance</th>
                <th className="py-3 px-4 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-[160px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((fee) => {
                const sc  = statusConfig(fee.status)
                const pill = deadlinePill(fee)
                const total = fee.amount + fee.lateFee

                return (
                  <tr key={fee.id} className={`group hover:bg-muted/20 transition-colors ${fee.status === 'overdue' ? 'bg-red-50/40 dark:bg-red-950/10' : ''}`}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm leading-tight">{fee.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{fee.detail}</p>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">{fee.amount.toFixed(2)} €</td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {fee.lateFee > 0
                        ? <span className="text-red-600 font-medium">+{fee.lateFee.toFixed(2)} €</span>
                        : <span className="text-muted-foreground">—</span>
                      }
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {fee.status === 'paid' ? (
                        <span className="text-[11px] text-muted-foreground">
                          {fee.paidAt ? format(fee.paidAt, 'd MMM yyyy', { locale: fr }) : '—'}
                        </span>
                      ) : pill ? (
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pill.cls}`}>
                          {pill.label}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          {format(fee.dueDate, 'd MMM yyyy', { locale: fr })}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {fee.status === 'paid' || fee.status === 'waived' ? (
                        <button
                          onClick={() => downloadReceipt(fee)}
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors"
                        >
                          📄 Reçu PDF
                        </button>
                      ) : (
                        <button
                          onClick={() => setPayModal(fee)}
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                            fee.status === 'overdue'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          {fee.status === 'overdue' ? '⚡ Régler' : '💳 Payer'}
                          <span className="font-normal ml-0.5">{total.toFixed(0)}€</span>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Footer totaux */}
            <tfoot>
              <tr className="border-t-2 bg-muted/20">
                <td className="py-3 px-4 text-[11px] font-semibold text-muted-foreground">
                  Total — {filtered.filter((f) => f.status === 'paid').length} paiement{filtered.filter(f => f.status === 'paid').length > 1 ? 's' : ''} effectué{filtered.filter(f => f.status === 'paid').length > 1 ? 's' : ''}
                </td>
                <td className="py-3 px-4 text-right text-sm font-bold tabular-nums">
                  {filtered.reduce((s, f) => s + f.amount, 0).toFixed(2)} €
                </td>
                <td className="py-3 px-4 text-right text-sm text-red-600 font-medium tabular-nums">
                  {filtered.reduce((s, f) => s + f.lateFee, 0) > 0
                    ? `+${filtered.reduce((s, f) => s + f.lateFee, 0).toFixed(2)} €`
                    : '—'
                  }
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Note de bas de page ──────────────────────────────────────────── */}
      <p className="text-center text-[11px] text-muted-foreground">
        Les reçus de paiement sont acceptés pour les déclarations fiscales (déduction d'impôts) et les demandes de bourses CROUS/DSU.<br />
        En cas de litige, contactez le service financier : <span className="font-medium">finances@unigest.fr</span>
      </p>

      {/* ── Modal paiement ───────────────────────────────────────────────── */}
      {payModal && (
        <PaymentModal
          fee={payModal}
          onClose={() => setPayModal(null)}
          onPaid={(id) => { handlePaid(id); setPayModal(null) }}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-emerald-900 text-white px-5 py-3 shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  )
}

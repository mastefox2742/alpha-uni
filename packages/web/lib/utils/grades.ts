import type { LibrettoEntry } from '@/lib/hooks/useLibretto'

// ─── Valeur numérique d'une note ─────────────────────────────────────────────
export function gradeValue(grade: string): number {
  if (grade === '30L') return 30
  const n = Number(grade)
  return isNaN(n) ? 0 : n
}

// ─── Entrées avec note valide ─────────────────────────────────────────────────
export function passedEntries(entries: LibrettoEntry[]): LibrettoEntry[] {
  return entries.filter(
    (e) =>
      e.gradeStatus === 'published' ||
      e.gradeStatus === 'accepted'  ||
      // En mode démo les statuts peuvent être vides
      (e.grade && e.grade !== '' && e.grade !== 'Â'),
  )
}

// ─── Moyenne Arithmétique ────────────────────────────────────────────────────
export function arithmeticMean(entries: LibrettoEntry[]): number {
  const valid = passedEntries(entries)
  if (valid.length === 0) return 0
  return valid.reduce((s, e) => s + gradeValue(e.grade), 0) / valid.length
}

// ─── Moyenne Pondérée (par CFU) ───────────────────────────────────────────────
export function weightedMean(entries: LibrettoEntry[]): number {
  const valid    = passedEntries(entries)
  const totalCfu = valid.reduce((s, e) => s + e.cfu, 0)
  if (totalCfu === 0) return 0
  const wSum = valid.reduce((s, e) => s + gradeValue(e.grade) * e.cfu, 0)
  return wSum / totalCfu
}

// ─── CFU validés ─────────────────────────────────────────────────────────────
export function cfuAcquired(entries: LibrettoEntry[]): number {
  return passedEntries(entries).reduce((s, e) => s + e.cfu, 0)
}

// ─── Note de départ Laurea (formule italienne) ────────────────────────────────
// Voto di Partenza = Media Ponderata × (11 / 3)  → sur 110
export function laureaNoteEstimate(wMean: number): number {
  return wMean * (11 / 3)
}

// ─── Couleur badge note ───────────────────────────────────────────────────────
export type GradeVariant = 'success' | 'warning' | 'destructive' | 'lode' | 'outline'

export function gradeVariant(grade: string): GradeVariant {
  if (grade === '30L') return 'lode'
  const n = Number(grade)
  if (n >= 27) return 'success'
  if (n >= 18) return 'warning'
  return 'destructive'
}

// ─── Génération HTML pour export PDF (print dialog) ──────────────────────────
export function buildPdfHtml(params: {
  studentName:   string
  matricola:     string
  degreeProgram: string
  degreeType:    string
  entries:       LibrettoEntry[]
  cfuTotal:      number
}): string {
  const { studentName, matricola, degreeProgram, degreeType, entries, cfuTotal } = params

  const passed   = passedEntries(entries)
  const wMean    = weightedMean(passed)
  const aMean    = arithmeticMean(passed)
  const cfuAcq   = cfuAcquired(passed)
  const laurea   = laureaNoteEstimate(wMean)
  const today    = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())

  const rows = passed
    .sort((a, b) => (a.courseYear - b.courseYear) || a.courseName.localeCompare(b.courseName))
    .map((e) => `
      <tr>
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:11px;color:#6b7280">${e.courseCode}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;font-weight:500">${e.courseName}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:12px">${e.cfu}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;font-weight:700;color:${e.grade==='30L'?'#7c3aed':Number(e.grade)>=27?'#16a34a':'#ca8a04'}">${e.grade}${e.grade==='30L'?' ✦':''}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280">${e.examDate ? new Intl.DateTimeFormat('fr-FR').format(new Date(e.examDate)) : '—'}</td>
      </tr>
    `).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Libretto — ${studentName}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#111827; background:#fff; padding:40px; }
    h1 { font-size:22px; font-weight:700; }
    .sub { color:#6b7280; font-size:13px; margin-top:2px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #111827; padding-bottom:16px; margin-bottom:24px; }
    .logo { font-size:20px; font-weight:800; letter-spacing:-0.5px; }
    .kpi { display:flex; gap:32px; margin-bottom:28px; padding:16px 20px; background:#f9fafb; border-radius:8px; border:1px solid #e5e7eb; }
    .kpi-item p:first-child { font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:#6b7280; margin-bottom:3px; }
    .kpi-item p:last-child { font-size:20px; font-weight:700; }
    .kpi-item .primary { color:#4f46e5; }
    table { width:100%; border-collapse:collapse; margin-top:8px; }
    thead th { background:#f3f4f6; padding:8px 10px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:#374151; }
    tfoot td { padding:8px 10px; font-size:11px; color:#6b7280; border-top:2px solid #e5e7eb; }
    .footer { margin-top:40px; border-top:1px solid #e5e7eb; padding-top:12px; font-size:10px; color:#9ca3af; display:flex; justify-content:space-between; }
    @media print { body { padding:20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">🎓 UniGest</div>
      <div class="sub">Libretto Universitario — Document officiel</div>
    </div>
    <div style="text-align:right">
      <p style="font-size:11px;color:#6b7280">Généré le ${today}</p>
    </div>
  </div>

  <div style="margin-bottom:20px">
    <h1>${studentName}</h1>
    <p class="sub">Matricule : ${matricola} &nbsp;·&nbsp; ${degreeProgram} (${degreeType})</p>
  </div>

  <div class="kpi">
    <div class="kpi-item">
      <p>Moyenne arithmétique</p>
      <p>${aMean > 0 ? aMean.toFixed(2) : '—'} / 30</p>
    </div>
    <div class="kpi-item">
      <p>Moyenne pondérée</p>
      <p class="primary">${wMean > 0 ? wMean.toFixed(2) : '—'} / 30</p>
    </div>
    <div class="kpi-item">
      <p>CFU validés</p>
      <p>${cfuAcq} / ${cfuTotal}</p>
    </div>
    <div class="kpi-item">
      <p>Note de départ Laurea</p>
      <p class="primary">${laurea > 0 ? laurea.toFixed(1) : '—'} / 110</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Code</th><th>Matière</th><th style="text-align:center">CFU</th>
        <th style="text-align:center">Note</th><th>Date</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr><td colspan="2">Total — ${passed.length} matière(s) validée(s)</td>
          <td style="text-align:center;font-weight:700">${cfuAcq}</td>
          <td colspan="2"></td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <span>UniGest — Système de Gestion Universitaire</span>
    <span>Document non contractuel — généré automatiquement</span>
  </div>
</body>
</html>`
}

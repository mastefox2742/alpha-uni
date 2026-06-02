import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM ?? 'noreply@unigest.fr'

// ─── Sanitization HTML ────────────────────────────────────────────────────────
// Protège contre le XSS dans les emails en échappant les caractères dangereux

function escapeHtml(str: string): string {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// ─── Templates emails ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(opts: {
  to:            string
  firstName:     string
  lastName:      string
  matricola:     string
  degreeProgram: string
}): Promise<void> {
  // Sanitize TOUS les champs utilisateur avant injection dans le HTML
  const firstName     = escapeHtml(opts.firstName)
  const lastName      = escapeHtml(opts.lastName)
  const matricola     = escapeHtml(opts.matricola)
  const degreeProgram = escapeHtml(opts.degreeProgram)

  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: 'Bienvenue à UniGest — Immatriculation confirmée',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Félicitations, ${firstName} !</h2>
        <p>Votre dossier d'immatriculation a été <strong>validé</strong>.</p>
        <table style="border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Nom :</td>
            <td style="padding: 8px;">${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Matricule :</td>
            <td style="padding: 8px;">${matricola}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Filière :</td>
            <td style="padding: 8px;">${degreeProgram}</td>
          </tr>
        </table>
        <p>Vous pouvez dès maintenant vous connecter à votre espace étudiant.</p>
        <p style="color: #6b7280; font-size: 12px;">— L'équipe UniGest</p>
      </body>
      </html>
    `,
  })
}

export async function sendRejectionEmail(opts: {
  to:        string
  firstName: string
  reason:    string
}): Promise<void> {
  const firstName = escapeHtml(opts.firstName)
  const reason    = escapeHtml(opts.reason)

  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: 'UniGest — Décision sur votre dossier d\'inscription',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Bonjour ${firstName},</h2>
        <p>Après examen, votre dossier d'immatriculation n'a pas pu être accepté.</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Motif :</strong> ${reason}</p>
        </div>
        <p>Vous pouvez corriger votre dossier et le resoumettre depuis votre espace.</p>
        <p style="color: #6b7280; font-size: 12px;">— L'équipe UniGest</p>
      </body>
      </html>
    `,
  })
}

export async function sendPasswordResetEmail(opts: {
  to:        string
  firstName: string
  resetUrl:  string
}): Promise<void> {
  const firstName = escapeHtml(opts.firstName)
  // resetUrl vient de Supabase Auth — on valide qu'il commence par notre domaine
  const allowedDomain = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const safeUrl = opts.resetUrl.startsWith(allowedDomain) ? opts.resetUrl : '#'

  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: 'UniGest — Réinitialisation de votre mot de passe',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Réinitialisation du mot de passe</h2>
        <p>Bonjour ${firstName},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable <strong>15 minutes</strong>.</p>
        <p>
          <a href="${safeUrl}"
             style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.<br>
          Ce lien expirera dans 15 minutes.
        </p>
        <p style="color: #6b7280; font-size: 12px;">— L'équipe UniGest</p>
      </body>
      </html>
    `,
  })
}

export async function sendMissionApprovalEmail(opts: {
  to:          string
  teacherName: string
  destination: string
  amount:      number
  approved:    boolean
  reason?:     string
}): Promise<void> {
  const teacherName = escapeHtml(opts.teacherName)
  const destination = escapeHtml(opts.destination)
  const reason      = opts.reason ? escapeHtml(opts.reason) : ''

  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `UniGest — Mission ${opts.approved ? 'approuvée' : 'refusée'} : ${destination}`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Bonjour ${teacherName},</h2>
        <p>Votre demande de mission à <strong>${destination}</strong> a été
          <strong style="color: ${opts.approved ? '#16a34a' : '#dc2626'};">
            ${opts.approved ? 'approuvée' : 'refusée'}
          </strong>.
        </p>
        ${opts.approved
          ? `<p>Montant remboursable : <strong>${opts.amount.toFixed(2)} €</strong></p>`
          : reason ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;"><p style="margin:0;"><strong>Motif :</strong> ${reason}</p></div>` : ''
        }
        <p style="color: #6b7280; font-size: 12px;">— L'équipe UniGest</p>
      </body>
      </html>
    `,
  })
}

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM ?? 'noreply@unigest.fr'

export async function sendWelcomeEmail(opts: {
  to:           string
  firstName:    string
  lastName:     string
  matricola:    string
  degreeProgram: string
}): Promise<void> {
  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: '🎓 Bienvenue à UniGest — Immatriculation confirmée',
    html: `
      <h2>Félicitations, ${opts.firstName} !</h2>
      <p>Votre dossier d'immatriculation a été <strong>validé</strong>.</p>
      <ul>
        <li><strong>Matricule :</strong> ${opts.matricola}</li>
        <li><strong>Filière :</strong> ${opts.degreeProgram}</li>
      </ul>
      <p>Vous pouvez dès maintenant vous connecter à votre espace étudiant.</p>
      <p>— L'équipe UniGest</p>
    `,
  })
}

export async function sendRejectionEmail(opts: {
  to:        string
  firstName: string
  reason:    string
}): Promise<void> {
  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: 'UniGest — Décision sur votre dossier d\'inscription',
    html: `
      <h2>Bonjour ${opts.firstName},</h2>
      <p>Après examen, votre dossier d'immatriculation n'a pas pu être accepté.</p>
      <p><strong>Motif :</strong> ${opts.reason}</p>
      <p>Vous pouvez corriger votre dossier et le resoumettre depuis votre espace.</p>
      <p>— L'équipe UniGest</p>
    `,
  })
}

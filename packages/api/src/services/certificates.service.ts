import { createClient } from '@supabase/supabase-js'
import PDFDocument from 'pdfkit'
import { Readable } from 'stream'
import type { Response } from 'express'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const CERT_LABELS: Record<string, string> = {
  enrollment:  'Certificat de scolarité',
  transcript:  'Relevé de notes officiel',
  degree:      'Diplôme',
  attendance:  'Attestation de présence',
  other:       'Document officiel',
}

/**
 * Générer un numéro de série unique  (ex: CERT-2025-004521)
 */
function generateSerial(): string {
  const year   = new Date().getFullYear()
  const suffix = Math.floor(Math.random() * 900000 + 100000)
  return `CERT-${year}-${suffix}`
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

export async function getStudentCertificates(studentUserId: string) {
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', studentUserId)
    .single()

  if (!student) return []

  const { data, error } = await supabase
    .from('certificates')
    .select(`
      id, type, issued_at, expires_at, serial_number, file_url,
      secretaries!issued_by(
        profiles!user_id(first_name, last_name)
      )
    `)
    .eq('student_id', student.id)
    .order('issued_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAllCertificates(filters: { type?: string } = {}) {
  let query = supabase
    .from('certificates')
    .select(`
      id, type, issued_at, serial_number, file_url,
      students!student_id(
        id, matricola,
        profiles!user_id(first_name, last_name, email)
      ),
      secretaries!issued_by(
        profiles!user_id(first_name, last_name)
      )
    `)
    .order('issued_at', { ascending: false })

  if (filters.type) query = query.eq('type', filters.type)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Émission ─────────────────────────────────────────────────────────────────

export interface IssueCertificateInput {
  studentId:   string  // UUID de la table students
  type:        string  // cert_type enum
  secretaryId: string  // UUID de la table secretaries
  expiresAt?:  string  // ISO date optionnelle
}

/**
 * Créer l'entrée certificate en base (sans fichier — le PDF est généré à la demande)
 */
export async function issueCertificate(input: IssueCertificateInput) {
  const serial = generateSerial()

  const { data, error } = await supabase
    .from('certificates')
    .insert({
      student_id:    input.studentId,
      type:          input.type,
      issued_by:     input.secretaryId,
      serial_number: serial,
      expires_at:    input.expiresAt ?? null,
    })
    .select()
    .single()

  if (error || !data) throw new Error('Impossible de créer le certificat')
  return data
}

// ─── Génération PDF (stream vers res) ────────────────────────────────────────

export async function streamCertificatePdf(certId: string, res: Response) {
  // Charger les données du certificat + étudiant
  const { data: cert } = await supabase
    .from('certificates')
    .select(`
      id, type, serial_number, issued_at, expires_at,
      students!student_id(
        id, matricola, enrollment_year,
        profiles!user_id(first_name, last_name, email),
        degree_programs!degree_program_id(name, type, total_cfu, duration_years)
      ),
      secretaries!issued_by(
        profiles!user_id(first_name, last_name)
      )
    `)
    .eq('id', certId)
    .single()

  if (!cert) throw new Error('Certificat introuvable')

  const student   = (cert.students as any)
  const profile   = student?.profiles
  const program   = student?.degree_programs
  const secretary = (cert.secretaries as any)?.profiles

  const label      = CERT_LABELS[cert.type] ?? 'Document officiel'
  const issuedDate = new Date(cert.issued_at).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="UniGest_${cert.type}_${cert.serial_number}.pdf"`,
  )

  const doc = new PDFDocument({ size: 'A4', margin: 60 })
  doc.pipe(res)

  // ── En-tête ────────────────────────────────────────────────────────────────
  doc
    .rect(0, 0, doc.page.width, 120)
    .fill('#1a365d')

  doc
    .fillColor('white')
    .fontSize(26)
    .font('Helvetica-Bold')
    .text('🎓 UniGest', 60, 30)

  doc
    .fontSize(11)
    .font('Helvetica')
    .text('Università degli Studi UniGest', 60, 65)
    .text('Système de Gestion Universitaire', 60, 82)

  // ── Titre du certificat ────────────────────────────────────────────────────
  doc
    .fillColor('#1a365d')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(label.toUpperCase(), 60, 150, { align: 'center' })

  doc
    .moveTo(60, 185)
    .lineTo(doc.page.width - 60, 185)
    .strokeColor('#1a365d')
    .lineWidth(2)
    .stroke()

  // ── Corps ──────────────────────────────────────────────────────────────────
  const bodyY = 210
  doc
    .fillColor('#333')
    .fontSize(13)
    .font('Helvetica')

  if (cert.type === 'enrollment') {
    doc.text(
      `L'Université UniGest certifie que :`,
      60, bodyY,
    )
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#1a365d')
      .text(
        `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`,
        60, bodyY + 30,
        { align: 'center' },
      )
    doc
      .fontSize(13)
      .font('Helvetica')
      .fillColor('#333')
      .text(
        `est régulièrement inscrit(e) à l'Université UniGest pour l'année universitaire ${student?.enrollment_year ?? '—'}/${(student?.enrollment_year ?? 0) + 1}.`,
        60, bodyY + 65,
        { align: 'center', width: doc.page.width - 120 },
      )
    if (program) {
      doc.text(
        `Filière : ${program.name} (${program.type?.toUpperCase()}) — ${program.total_cfu} CFU`,
        60, bodyY + 110,
        { align: 'center' },
      )
    }
    if (student?.matricola) {
      doc.text(
        `Matricule : ${student.matricola}`,
        60, bodyY + 135,
        { align: 'center' },
      )
    }
  } else if (cert.type === 'attendance') {
    doc
      .text('Ce certificat atteste de l\'assiduité de :', 60, bodyY)
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#1a365d')
      .text(
        `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`,
        60, bodyY + 30,
        { align: 'center' },
      )
  } else {
    doc
      .text(`Ce document officiel est délivré à :`, 60, bodyY)
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#1a365d')
      .text(
        `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`,
        60, bodyY + 30,
        { align: 'center' },
      )
  }

  // ── Informations officielles ────────────────────────────────────────────────
  const infoY = bodyY + 200
  doc
    .rect(60, infoY, doc.page.width - 120, 80)
    .fillAndStroke('#f8fafc', '#cbd5e0')

  doc
    .fillColor('#333')
    .fontSize(10)
    .font('Helvetica')
    .text(`Délivré le : ${issuedDate}`, 75, infoY + 12)
    .text(`N° de série : ${cert.serial_number}`, 75, infoY + 28)
    .text(
      `Délivré par : ${secretary ? `${secretary.first_name} ${secretary.last_name}` : 'Administration UniGest'}`,
      75, infoY + 44,
    )

  if (cert.expires_at) {
    const expiresDate = new Date(cert.expires_at).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
    doc.text(`Valide jusqu'au : ${expiresDate}`, 75, infoY + 60)
  }

  // ── Zone signature ──────────────────────────────────────────────────────────
  const sigY = infoY + 120
  doc
    .moveTo(doc.page.width - 240, sigY)
    .lineTo(doc.page.width - 60, sigY)
    .strokeColor('#999')
    .lineWidth(1)
    .stroke()

  doc
    .fillColor('#666')
    .fontSize(9)
    .text('Signature et cachet de l\'administration', doc.page.width - 240, sigY + 8, {
      width: 180,
      align: 'center',
    })

  // ── Pied de page ────────────────────────────────────────────────────────────
  doc
    .rect(0, doc.page.height - 40, doc.page.width, 40)
    .fill('#1a365d')

  doc
    .fillColor('white')
    .fontSize(8)
    .font('Helvetica')
    .text(
      `UniGest — Document officiel — ${cert.serial_number} — unigest.fr`,
      0,
      doc.page.height - 26,
      { align: 'center' },
    )

  doc.end()
}

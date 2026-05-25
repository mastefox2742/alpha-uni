import { Router } from 'express'
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/rbac.middleware'
import { createClient } from '@supabase/supabase-js'
import {
  getStudentCertificates,
  getAllCertificates,
  issueCertificate,
  streamCertificatePdf,
} from '../services/certificates.service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const certificatesRouter = Router()

// ─── Étudiant ─────────────────────────────────────────────────────────────────

/**
 * GET /api/certificates/me
 * Certificats de l'étudiant connecté
 */
certificatesRouter.get('/me',
  authMiddleware,
  requireRole('student'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const certs = await getStudentCertificates(req.user!.id)
      return res.json({ data: certs })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/**
 * GET /api/certificates/:id/pdf
 * Télécharger un certificat en PDF (accessible étudiant + admin)
 */
certificatesRouter.get('/:id/pdf',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      // Vérifier que l'étudiant est bien propriétaire OU que c'est un admin/secretary
      if (req.user!.role === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', req.user!.id)
          .single()

        if (student) {
          const { data: cert } = await supabase
            .from('certificates')
            .select('student_id')
            .eq('id', req.params.id!)
            .single()

          if (!cert || cert.student_id !== student.id) {
            return res.status(403).json({ error: 'Accès refusé' })
          }
        }
      }

      await streamCertificatePdf(req.params.id!, res)
      return
    } catch (err) {
      if (!res.headersSent) {
        return res.status(500).json({ error: (err as Error).message })
      }
      return
    }
  },
)

// ─── Admin / Secrétaire ───────────────────────────────────────────────────────

/**
 * GET /api/certificates
 * Tous les certificats émis
 */
certificatesRouter.get('/',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req, res) => {
    try {
      const { type } = req.query as { type?: string }
      const certFilter: Parameters<typeof getAllCertificates>[0] = {}
      if (type) certFilter.type = type
      const certs = await getAllCertificates(certFilter)
      return res.json({ data: certs })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/**
 * POST /api/certificates
 * Émettre un certificat pour un étudiant
 */
certificatesRouter.post('/',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { studentId, type, expiresAt } = req.body as {
        studentId:  string
        type:       string
        expiresAt?: string
      }

      if (!studentId || !type) {
        return res.status(400).json({ error: 'studentId et type sont requis' })
      }

      // Récupérer l'ID secretary depuis le user connecté
      const { data: secretary } = await supabase
        .from('secretaries')
        .select('id')
        .eq('user_id', req.user!.id)
        .maybeSingle()

      // Fallback : utiliser un secrétaire existant si le user est admin sans profil secretary
      let secretaryId = secretary?.id
      if (!secretaryId) {
        const { data: anySecretary } = await supabase
          .from('secretaries')
          .select('id')
          .limit(1)
          .single()
        secretaryId = anySecretary?.id
      }

      if (!secretaryId) {
        return res.status(400).json({ error: 'Aucun secrétaire trouvé pour émettre le certificat' })
      }

      const certInput: Parameters<typeof issueCertificate>[0] = {
        studentId,
        type,
        secretaryId,
      }
      if (expiresAt) certInput.expiresAt = expiresAt

      const cert = await issueCertificate(certInput)
      return res.status(201).json({ data: cert })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

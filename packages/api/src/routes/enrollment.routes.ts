import { Router } from 'express'
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/rbac.middleware'
import {
  createEnrollmentApplication,
  enrollStudent,
  rejectApplication,
  verifyDocument,
} from '../services/enrollment.service'

export const enrollmentRouter = Router()

/**
 * POST /api/students/enrollment
 * Créer un dossier d'immatriculation (étudiant non encore actif)
 */
enrollmentRouter.post('/enrollment', async (req, res) => {
  try {
    const app = await createEnrollmentApplication(req.body as Parameters<typeof createEnrollmentApplication>[0])
    return res.status(201).json({ data: app })
  } catch (err) {
    return res.status(400).json({ error: 'Bad Request', message: (err as Error).message })
  }
})

/**
 * POST /api/students/:id/enroll
 * Valider l'immatriculation (secrétaire)
 */
enrollmentRouter.post('/:id/enroll',
  authMiddleware,
  requireRole('secretary', 'admin'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const secretaryId = req.user!.id
      // Récupérer l'ID de la secrétaire depuis la table secretaries
      const student = await enrollStudent(req.params.id!, secretaryId)
      return res.json({ data: student })
    } catch (err) {
      return res.status(400).json({ error: 'Bad Request', message: (err as Error).message })
    }
  },
)

/**
 * POST /api/students/:id/reject
 * Rejeter un dossier (secrétaire)
 */
enrollmentRouter.post('/:id/reject',
  authMiddleware,
  requireRole('secretary', 'admin'),
  async (req: AuthenticatedRequest, res) => {
    const { reason } = req.body as { reason?: string }
    if (!reason?.trim()) {
      return res.status(400).json({ error: 'Bad Request', message: 'Motif requis' })
    }
    try {
      await rejectApplication(req.params.id!, req.user!.id, reason)
      return res.json({ data: { message: 'Dossier rejeté' } })
    } catch (err) {
      return res.status(400).json({ error: 'Bad Request', message: (err as Error).message })
    }
  },
)

/**
 * PUT /api/students/:id/documents/:docId/review
 * Valider ou invalider un document
 */
enrollmentRouter.put('/:id/documents/:docId/review',
  authMiddleware,
  requireRole('secretary', 'admin'),
  async (req, res) => {
    const { verified } = req.body as { verified: boolean }
    await verifyDocument(req.params.docId!, verified)
    return res.json({ data: { message: 'Document mis à jour' } })
  },
)

/**
 * GET /api/students?status=pending
 * Liste des dossiers (secrétaire)
 */
enrollmentRouter.get('/',
  authMiddleware,
  requireRole('secretary', 'admin'),
  async (req, res) => {
    // Délégué directement à Supabase via le client service_role
    // En production, utiliser un service dédié
    return res.json({ data: [], message: 'Utilisez la vue Supabase admin pour les listes' })
  },
)

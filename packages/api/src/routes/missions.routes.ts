import { Router } from 'express'
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/rbac.middleware'
import { validate, CreateMissionSchema, RefuseMissionSchema, ApproveMissionSchema } from '../middleware/validate'
import {
  getAllMissions,
  getMissionsByTeacher,
  createMission,
  approveMission,
  refuseMission,
  markMissionPaid,
  getMissionsStats,
} from '../services/missions.service'

export const missionsRouter = Router()

/** GET /api/missions/me — missions de l'enseignant connecté */
missionsRouter.get('/me',
  authMiddleware,
  requireRole('teacher'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const missions = await getMissionsByTeacher(req.user!.id)
      return res.json({ data: missions })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** GET /api/missions/stats — résumé statistique (admin) */
missionsRouter.get('/stats',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (_req, res) => {
    try {
      const stats = await getMissionsStats()
      return res.json({ data: stats })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** GET /api/missions — toutes les missions (admin/secrétaire) */
missionsRouter.get('/',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req, res) => {
    try {
      const { status } = req.query as { status?: string }
      const filter: Parameters<typeof getAllMissions>[0] = {}
      if (status) filter.status = status
      const missions = await getAllMissions(filter)
      return res.json({ data: missions })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** POST /api/missions — créer une mission (enseignant) */
missionsRouter.post('/',
  authMiddleware,
  requireRole('teacher', 'admin'),
  validate(CreateMissionSchema),
  async (req, res) => {
    try {
      const body = req.body as Parameters<typeof createMission>[0]
      const mission = await createMission(body)
      return res.status(201).json({ data: mission })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

/** POST /api/missions/:id/approve */
missionsRouter.post('/:id/approve',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const mission = await approveMission(req.params.id!, req.user!.id)
      return res.json({ data: mission })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

/** POST /api/missions/:id/refuse */
missionsRouter.post('/:id/refuse',
  authMiddleware,
  requireRole('admin', 'secretary'),
  validate(RefuseMissionSchema),
  async (req, res) => {
    try {
      const { reason } = req.body as { reason: string }
      const mission = await refuseMission(req.params.id!, reason)
      return res.json({ data: mission })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

/** POST /api/missions/:id/pay */
missionsRouter.post('/:id/pay',
  authMiddleware,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { paymentRef } = req.body as { paymentRef: string }
      if (!paymentRef) return res.status(400).json({ error: 'paymentRef requis' })
      const mission = await markMissionPaid(req.params.id!, paymentRef)
      return res.json({ data: mission })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

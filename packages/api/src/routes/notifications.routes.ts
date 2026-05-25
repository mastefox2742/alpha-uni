import { Router } from 'express'
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware'
import {
  getUserNotifications,
  markNotificationRead,
  markAllRead,
} from '../services/notifications.service'

export const notificationsRouter = Router()

/**
 * GET /api/notifications
 */
notificationsRouter.get('/',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const notifs = await getUserNotifications(req.user!.id)
      return res.json({ data: notifs })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/**
 * POST /api/notifications/:id/read
 */
notificationsRouter.post('/:id/read',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      await markNotificationRead(req.params.id!, req.user!.id)
      return res.json({ data: { message: 'Notification lue' } })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/**
 * POST /api/notifications/read-all
 */
notificationsRouter.post('/read-all',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      await markAllRead(req.user!.id)
      return res.json({ data: { message: 'Toutes les notifications lues' } })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

import { Router } from 'express'
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/rbac.middleware'
import { validate, CreateEventSchema } from '../middleware/validate'
import {
  getAcademicEvents,
  getUpcomingEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../services/calendar.service'

export const calendarRouter = Router()

/** GET /api/calendar — événements avec filtres */
calendarRouter.get('/',
  authMiddleware,
  async (req, res) => {
    try {
      const { universityId, academicYearId, type } = req.query as {
        universityId?: string; academicYearId?: string; type?: string
      }
      if (!universityId) return res.status(400).json({ error: 'universityId requis' })
      const calFilter: Parameters<typeof getAcademicEvents>[0] = { universityId }
      if (academicYearId) calFilter.academicYearId = academicYearId
      if (type)           calFilter.type           = type
      const events = await getAcademicEvents(calFilter)
      return res.json({ data: events })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** GET /api/calendar/upcoming — prochains événements */
calendarRouter.get('/upcoming',
  authMiddleware,
  async (req, res) => {
    try {
      const { universityId, limit } = req.query as { universityId?: string; limit?: string }
      if (!universityId) return res.status(400).json({ error: 'universityId requis' })
      const events = await getUpcomingEvents(universityId, limit ? parseInt(limit) : 5)
      return res.json({ data: events })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** POST /api/calendar — créer un événement */
calendarRouter.post('/',
  authMiddleware,
  requireRole('admin', 'secretary'),
  validate(CreateEventSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const body = req.body as {
        universityId: string; academicYearId?: string; title: string
        description?: string; type: string; startDate: string; endDate: string
      }
      if (!body.universityId || !body.title || !body.type || !body.startDate || !body.endDate) {
        return res.status(400).json({ error: 'universityId, title, type, startDate, endDate requis' })
      }
      const event = await createEvent({
        ...body,
        type: body.type as Parameters<typeof createEvent>[0]['type'],
        createdBy: req.user!.id,
      })
      return res.status(201).json({ data: event })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

/** PATCH /api/calendar/:id — modifier un événement */
calendarRouter.patch('/:id',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req, res) => {
    try {
      const event = await updateEvent(req.params.id!, req.body as Parameters<typeof updateEvent>[1])
      return res.json({ data: event })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

/** DELETE /api/calendar/:id — supprimer un événement */
calendarRouter.delete('/:id',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req, res) => {
    try {
      await deleteEvent(req.params.id!)
      return res.json({ data: { message: 'Événement supprimé' } })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

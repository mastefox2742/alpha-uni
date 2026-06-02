import { Router } from 'express'
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/rbac.middleware'
import { validate, CreateBookingSchema } from '../middleware/validate'
import {
  getAllRooms,
  getRoomWithBookings,
  getAllBookings,
  createBooking,
  cancelBooking,
} from '../services/rooms.service'

export const roomsRouter = Router()

/** GET /api/rooms — liste toutes les salles */
roomsRouter.get('/',
  authMiddleware,
  async (_req, res) => {
    try {
      const rooms = await getAllRooms()
      return res.json({ data: rooms })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** GET /api/rooms/bookings — toutes les réservations (admin/secrétaire) */
roomsRouter.get('/bookings',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req, res) => {
    try {
      const { day, classroomId } = req.query as { day?: string; classroomId?: string }
      const filter: Parameters<typeof getAllBookings>[0] = {}
      if (day)         filter.day         = day
      if (classroomId) filter.classroomId = classroomId
      const bookings = await getAllBookings(filter)
      return res.json({ data: bookings })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** GET /api/rooms/:id — détail salle + réservations de la semaine */
roomsRouter.get('/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const { week } = req.query as { week?: string }
      const room = await getRoomWithBookings(req.params.id!, week)
      return res.json({ data: room })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** POST /api/rooms/bookings — créer une réservation */
roomsRouter.post('/bookings',
  authMiddleware,
  requireRole('admin', 'secretary', 'teacher'),
  validate(CreateBookingSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { classroomId, title, day, startTime, endTime, notes } = req.body as {
        classroomId: string; title: string; day: string
        startTime: string; endTime: string; notes?: string
      }
      if (!classroomId || !title || !day || !startTime || !endTime) {
        return res.status(400).json({ error: 'classroomId, title, day, startTime, endTime requis' })
      }
      const bookingInput: Parameters<typeof createBooking>[0] = {
        classroomId, title, day, startTime, endTime, bookedBy: req.user!.id,
      }
      if (notes) bookingInput.notes = notes
      const booking = await createBooking(bookingInput)
      return res.status(201).json({ data: booking })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

/** DELETE /api/rooms/bookings/:id — annuler une réservation */
roomsRouter.delete('/bookings/:id',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req, res) => {
    try {
      await cancelBooking(req.params.id!)
      return res.json({ data: { message: 'Réservation annulée' } })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

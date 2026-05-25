import { Router } from 'express'
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/rbac.middleware'
import {
  getTeacherIdByUserId,
  getTeacherCourses,
  getCourseById,
  getCourseStudents,
  getStudentCourses,
} from '../services/courses.service'

export const coursesRouter = Router()

// ─── Enseignant ───────────────────────────────────────────────────────────────

/**
 * GET /api/teachers/me/courses
 */
coursesRouter.get('/me/courses',
  authMiddleware,
  requireRole('teacher'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const teacherId = await getTeacherIdByUserId(req.user!.id)
      if (!teacherId) return res.status(404).json({ error: 'Profil enseignant introuvable' })
      const courses = await getTeacherCourses(teacherId)
      return res.json({ data: courses })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/**
 * GET /api/teachers/courses/:id
 */
coursesRouter.get('/courses/:id',
  authMiddleware,
  requireRole('teacher', 'admin', 'secretary'),
  async (req, res) => {
    try {
      const course = await getCourseById(req.params.id!)
      return res.json({ data: course })
    } catch (err) {
      return res.status(404).json({ error: (err as Error).message })
    }
  },
)

/**
 * GET /api/teachers/courses/:id/students
 */
coursesRouter.get('/courses/:id/students',
  authMiddleware,
  requireRole('teacher', 'admin', 'secretary'),
  async (req, res) => {
    try {
      const students = await getCourseStudents(req.params.id!)
      return res.json({ data: students })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

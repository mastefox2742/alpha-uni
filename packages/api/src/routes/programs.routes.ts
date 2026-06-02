import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/rbac.middleware'
import {
  getAllPrograms,
  getProgramStudents,
  getProgramTeachers,
  getProgramCurriculum,
  getProgramExamResults,
  getProgramKpis,
  updateSyllabusStatus,
  upsertProgramKpi,
} from '../services/programs.service'

export const programsRouter = Router()

/** GET /api/programs */
programsRouter.get('/',
  authMiddleware,
  requireRole('admin', 'secretary', 'teacher'),
  async (_req, res) => {
    try {
      const programs = await getAllPrograms()
      return res.json({ data: programs })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** GET /api/programs/:id/students */
programsRouter.get('/:id/students',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req, res) => {
    try {
      const atRisk = req.query.atRisk === 'true'
      const students = await getProgramStudents(req.params.id!, { atRisk })
      return res.json({ data: students })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** GET /api/programs/:id/teachers */
programsRouter.get('/:id/teachers',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req, res) => {
    try {
      const teachers = await getProgramTeachers(req.params.id!)
      return res.json({ data: teachers })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** GET /api/programs/:id/curriculum */
programsRouter.get('/:id/curriculum',
  authMiddleware,
  requireRole('admin', 'secretary', 'teacher'),
  async (req, res) => {
    try {
      const curriculum = await getProgramCurriculum(req.params.id!)
      return res.json({ data: curriculum })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** GET /api/programs/:id/exams */
programsRouter.get('/:id/exams',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req, res) => {
    try {
      const { academicYearId } = req.query as { academicYearId?: string }
      const results = await getProgramExamResults(req.params.id!, academicYearId)
      return res.json({ data: results })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** GET /api/programs/:id/kpis */
programsRouter.get('/:id/kpis',
  authMiddleware,
  requireRole('admin', 'secretary'),
  async (req, res) => {
    try {
      const kpis = await getProgramKpis(req.params.id!)
      return res.json({ data: kpis })
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message })
    }
  },
)

/** PATCH /api/programs/curriculum/:unitId/syllabus */
programsRouter.patch('/curriculum/:unitId/syllabus',
  authMiddleware,
  requireRole('admin', 'secretary', 'teacher'),
  async (req, res) => {
    try {
      const { complete, syllabusUrl } = req.body as { complete: boolean; syllabusUrl?: string }
      const unit = await updateSyllabusStatus(req.params.unitId!, complete, syllabusUrl)
      return res.json({ data: unit })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

/** POST /api/programs/:id/kpis — upsert KPI snapshot */
programsRouter.post('/:id/kpis',
  authMiddleware,
  requireRole('admin'),
  async (req, res) => {
    try {
      const kpi = await upsertProgramKpi({ programId: req.params.id!, ...req.body })
      return res.json({ data: kpi })
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message })
    }
  },
)

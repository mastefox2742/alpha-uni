import { Router } from 'express'
import { authRouter }          from './auth.routes'
import { studentsRouter }      from './students.routes'
import { enrollmentRouter }    from './enrollment.routes'
import { coursesRouter }       from './courses.routes'
import { examsRouter }         from './exams.routes'
import { gradesRouter }        from './grades.routes'
import { feesRouter }          from './fees.routes'
import { certificatesRouter }  from './certificates.routes'
import { notificationsRouter } from './notifications.routes'
import { elearningRouter }    from './elearning.routes'
import { quizRouter }         from './quiz.routes'
import { forumRouter }        from './forum.routes'

export const router = Router()

router.get('/ping', (_req, res) => res.json({ message: 'pong' }))

// Phase 1 — Auth & Immatriculation
router.use('/auth',        authRouter)
router.use('/students',    studentsRouter)
router.use('/students',    enrollmentRouter)

// Phase 2 — Cœur Académique
router.use('/teachers',    coursesRouter)
router.use('/exams',       examsRouter)
router.use('/grades',      gradesRouter)

// Phase 3 — Administration & Finances
router.use('/fees',          feesRouter)
router.use('/certificates',  certificatesRouter)
router.use('/notifications', notificationsRouter)

// Phase 4 — E-Learning
router.use('/elearning',     elearningRouter)
router.use('/quiz',          quizRouter)
router.use('/forum',         forumRouter)

// À venir
// router.use('/thesis',      thesisRouter)

import { Router } from 'express'
import { authRouter }       from './auth.routes'
import { studentsRouter }   from './students.routes'
import { enrollmentRouter } from './enrollment.routes'
import { coursesRouter }    from './courses.routes'
import { examsRouter }      from './exams.routes'
import { gradesRouter }     from './grades.routes'

export const router = Router()

router.get('/ping', (_req, res) => res.json({ message: 'pong' }))

router.use('/auth',     authRouter)
router.use('/students', studentsRouter)
router.use('/students', enrollmentRouter)   // enrollment routes partagent le prefix /students

// Phase 2 — Cœur Académique
router.use('/teachers', coursesRouter)      // GET /teachers/me/courses, /teachers/courses/:id
router.use('/exams',    examsRouter)        // GET|POST /exams/...
router.use('/grades',   gradesRouter)       // GET|POST /grades/...

// À venir
// router.use('/fees',      feesRouter)
// router.use('/thesis',    thesisRouter)

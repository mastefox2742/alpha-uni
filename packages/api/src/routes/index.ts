import { Router } from 'express'
import { authRouter }       from './auth.routes'
import { studentsRouter }   from './students.routes'
import { enrollmentRouter } from './enrollment.routes'

export const router = Router()

router.get('/ping', (_req, res) => res.json({ message: 'pong' }))

router.use('/auth',     authRouter)
router.use('/students', studentsRouter)
router.use('/students', enrollmentRouter)   // enrollment routes partagent le prefix /students

// À venir
// router.use('/teachers',  teachersRouter)
// router.use('/courses',   coursesRouter)
// router.use('/exams',     examsRouter)
// router.use('/grades',    gradesRouter)
// router.use('/fees',      feesRouter)
// router.use('/thesis',    thesisRouter)

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useCreateExamSession } from '@/lib/hooks/useTeacherCourses'

const schema = z
  .object({
    date:                 z.string().min(1, 'Date requise'),
    registrationDeadline: z.string().min(1, 'Deadline requise'),
    maxStudents:          z.coerce.number().int().positive().optional().or(z.literal('')),
    notes:                z.string().max(500).optional(),
  })
  .refine(
    d => new Date(d.registrationDeadline) < new Date(d.date),
    { message: 'La deadline doit être avant la date d\'examen', path: ['registrationDeadline'] },
  )

type FormData = z.infer<typeof schema>

export function ExamSessionForm({ courseId }: { courseId: string }) {
  const router  = useRouter()
  const { mutateAsync, isPending } = useCreateExamSession(courseId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      const payload: Parameters<typeof mutateAsync>[0] = {
        date:                 new Date(data.date).toISOString(),
        registrationDeadline: new Date(data.registrationDeadline).toISOString(),
      }
      const ms = data.maxStudents !== '' ? Number(data.maxStudents) : null
      if (ms) payload.maxStudents = ms
      if (data.notes) payload.notes = data.notes

      await mutateAsync(payload)
      toast.success('Session d\'examen créée')
      router.push(`/teacher/courses/${courseId}`)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const inputCls =
    'block w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50'
  const errorCls = 'mt-1 text-xs text-destructive'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">
          Date et heure de l'examen <span className="text-destructive">*</span>
        </label>
        <input type="datetime-local" {...register('date')} className={inputCls} />
        {errors.date && <p className={errorCls}>{errors.date.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Date limite d'inscription <span className="text-destructive">*</span>
        </label>
        <input type="datetime-local" {...register('registrationDeadline')} className={inputCls} />
        {errors.registrationDeadline && (
          <p className={errorCls}>{errors.registrationDeadline.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre max d'étudiants</label>
        <input
          type="number"
          min={1}
          placeholder="Illimité si vide"
          {...register('maxStudents')}
          className={inputCls}
        />
        {errors.maxStudents && <p className={errorCls}>{errors.maxStudents.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes / Informations</label>
        <textarea
          rows={3}
          placeholder="Salle, documents autorisés, remarques..."
          {...register('notes')}
          className={inputCls}
        />
        {errors.notes && <p className={errorCls}>{errors.notes.message}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Création...' : 'Créer la session'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-accent"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}

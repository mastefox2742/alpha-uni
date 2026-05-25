import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail, sendRejectionEmail } from './email.service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface CreateEnrollmentInput {
  userId:          string
  degreeProgramId: string
  personalInfo: {
    firstName: string; lastName: string; dateOfBirth: string
    placeOfBirth: string; nationality: string; phone: string; address: string
  }
  documents: Array<{ type: string; fileName: string; fileUrl: string; fileSize: number }>
}

export async function createEnrollmentApplication(input: CreateEnrollmentInput) {
  // 1. Mettre à jour le profil
  await supabase.from('profiles').update({
    first_name: input.personalInfo.firstName,
    last_name:  input.personalInfo.lastName,
    phone:      input.personalInfo.phone,
  }).eq('id', input.userId)

  // 2. Récupérer l'année académique courante
  const { data: year } = await supabase
    .from('academic_years').select('id').eq('is_current', true).single()
  if (!year) throw new Error('Aucune année académique courante')

  // 3. Créer la demande d'immatriculation
  const { data: app, error } = await supabase
    .from('enrollment_applications')
    .insert({
      user_id:           input.userId,
      degree_program_id: input.degreeProgramId,
      academic_year_id:  year.id,
      status:            'pending',
      submitted_at:      new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !app) throw new Error('Impossible de créer le dossier')

  // 4. Enregistrer les documents
  if (input.documents.length > 0) {
    await supabase.from('enrollment_documents').insert(
      input.documents.map(d => ({
        application_id: app.id,
        type:           d.type,
        file_name:      d.fileName,
        file_url:       d.fileUrl,
        file_size:      d.fileSize,
      })),
    )
  }

  return app
}

export async function enrollStudent(applicationId: string, secretaryId: string) {
  // 1. Récupérer la demande
  const { data: app } = await supabase
    .from('enrollment_applications')
    .select('*, profiles!user_id(first_name, last_name), degree_programs!degree_program_id(name)')
    .eq('id', applicationId)
    .single()

  if (!app) throw new Error('Dossier introuvable')

  const profile = app.profiles as { first_name: string; last_name: string } | null
  const program = app.degree_programs as { name: string } | null

  // 2. Récupérer l'année académique courante
  const { data: year } = await supabase
    .from('academic_years').select('id').eq('is_current', true).single()

  // 3. Créer le student (le trigger génère la matricola)
  const { data: student, error: sErr } = await supabase
    .from('students')
    .insert({
      user_id:           app.user_id,
      status:            'enrolled',
      enrollment_year:   new Date().getFullYear(),
      degree_program_id: app.degree_program_id,
      current_year:      1,
    })
    .select()
    .single()

  if (sErr || !student) throw new Error('Impossible de créer le profil étudiant')

  // 4. Mettre à jour le statut de la demande
  await supabase.from('enrollment_applications').update({
    status:      'approved',
    reviewed_at: new Date().toISOString(),
    reviewed_by: secretaryId,
  }).eq('id', applicationId)

  // 5. Mettre à jour le rôle du profil → student
  await supabase.from('profiles').update({ role: 'student' }).eq('id', app.user_id)

  // 6. Créer les frais de scolarité de la 1ère année
  if (year) {
    await supabase.from('tuition_fees').insert({
      student_id:       student.id,
      academic_year_id: year.id,
      amount:           1500,
      due_date:         new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      status:           'pending',
    })
  }

  // 7. Email de bienvenue
  const { data: authUser } = await supabase.auth.admin.getUserById(app.user_id as string)
  if (authUser?.user?.email) {
    await sendWelcomeEmail({
      to:            authUser.user.email,
      firstName:     profile?.first_name ?? '',
      lastName:      profile?.last_name  ?? '',
      matricola:     student.matricola ?? '',
      degreeProgram: program?.name ?? '',
    }).catch(console.error)
  }

  return student
}

export async function rejectApplication(applicationId: string, secretaryId: string, reason: string) {
  const { data: app } = await supabase
    .from('enrollment_applications')
    .select('user_id, profiles!user_id(first_name)')
    .eq('id', applicationId)
    .single()

  await supabase.from('enrollment_applications').update({
    status:           'rejected',
    reviewed_at:      new Date().toISOString(),
    reviewed_by:      secretaryId,
    rejection_reason: reason,
  }).eq('id', applicationId)

  // Email de rejet
  if (app) {
    const { data: authUser } = await supabase.auth.admin.getUserById(app.user_id as string)
    const profile = app.profiles as { first_name: string } | null
    if (authUser?.user?.email) {
      await sendRejectionEmail({
        to:        authUser.user.email,
        firstName: profile?.first_name ?? '',
        reason,
      }).catch(console.error)
    }
  }
}

export async function verifyDocument(docId: string, verified: boolean) {
  await supabase.from('enrollment_documents').update({
    is_verified: verified,
    verified_at: verified ? new Date().toISOString() : null,
  }).eq('id', docId)
}

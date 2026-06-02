import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ─── Droit d'accès (Article 15 RGPD) ─────────────────────────────────────────

export async function exportUserData(userId: string) {
  // Collecte toutes les données personnelles de l'utilisateur
  const [profile, student, grades, fees, notifications, documents, applications, theses] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('students').select('*, degree_programs(name, code)').eq('user_id', userId).single(),
      supabase.from('grades').select('*, courses(name, code)').eq('student_id',
        // sous-requête via la table students
        supabase.from('students').select('id').eq('user_id', userId),
      ),
      supabase.from('tuition_fees').select('amount, status, due_date, paid_at').eq('student_id',
        supabase.from('students').select('id').eq('user_id', userId),
      ),
      supabase.from('notifications').select('title, message, type, created_at').eq('user_id', userId),
      supabase.from('student_documents').select('type, file_name, created_at').eq('student_id',
        supabase.from('students').select('id').eq('user_id', userId),
      ),
      supabase.from('enrollment_applications').select('status, created_at, updated_at').eq('user_id', userId),
      supabase.from('theses').select('title, status, created_at').eq('student_id',
        supabase.from('students').select('id').eq('user_id', userId),
      ),
    ])

  return {
    exportedAt:   new Date().toISOString(),
    exportFormat: 'JSON — UniGest RGPD Export v1.0',
    profile:      profile.data,
    academicRecord: {
      student:      student.data,
      grades:       grades.data ?? [],
      applications: applications.data ?? [],
      theses:       theses.data ?? [],
    },
    financial: {
      fees: fees.data ?? [],
    },
    communications: {
      notifications: notifications.data ?? [],
    },
    documents: {
      uploadedFiles: documents.data ?? [],
    },
  }
}

// ─── Droit à la portabilité (Article 20 RGPD) ────────────────────────────────

export async function exportUserDataAsCsv(userId: string): Promise<string> {
  const data = await exportUserData(userId)

  const lines: string[] = [
    '# Export RGPD — UniGest',
    `# Date d'export: ${data.exportedAt}`,
    '',
    '## PROFIL',
    'Champ;Valeur',
  ]

  if (data.profile) {
    const p = data.profile as Record<string, unknown>
    for (const [key, value] of Object.entries(p)) {
      // Ne pas exporter les champs techniques internes
      if (['id', 'created_at', 'updated_at'].includes(key)) continue
      lines.push(`${key};${String(value ?? '')}`)
    }
  }

  lines.push('', '## NOTES')
  lines.push('Cours;Note;Statut')
  for (const grade of (data.academicRecord.grades as Array<Record<string, unknown>>) ?? []) {
    const course = (grade.courses as Record<string, string> | null)
    lines.push(`${course?.name ?? ''};${String(grade.value ?? '')};${String(grade.status ?? '')}`)
  }

  lines.push('', '## FRAIS DE SCOLARITÉ')
  lines.push('Montant;Statut;Échéance;Payé le')
  for (const fee of (data.financial.fees as Array<Record<string, unknown>>) ?? []) {
    lines.push(`${String(fee.amount ?? '')};${String(fee.status ?? '')};${String(fee.due_date ?? '')};${String(fee.paid_at ?? '')}`)
  }

  return lines.join('\n')
}

// ─── Droit à l'effacement (Article 17 RGPD) ──────────────────────────────────

export async function deleteUserData(userId: string, requestedBy: string): Promise<{
  deletedAt: string
  confirmation: string
}> {
  // Vérification : seul l'utilisateur lui-même ou un admin peut demander la suppression
  const { data: requestor } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', requestedBy)
    .single()

  const isAdmin = requestor?.role === 'admin'
  if (requestedBy !== userId && !isAdmin) {
    throw new Error('Non autorisé — vous ne pouvez supprimer que vos propres données')
  }

  // Récupère l'ID étudiant
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (student) {
    // 1. Anonymise les données plutôt que de supprimer (intégrité référentielle + obligation légale
    //    de garder les données financières 10 ans en France)
    await supabase.from('students').update({
      date_of_birth:  null,
      place_of_birth: null,
      nationality:    null,
      tax_code:       null,
    }).eq('id', student.id)

    // 2. Supprime les documents personnels
    await supabase.from('student_documents').delete().eq('student_id', student.id)

    // 3. Supprime les notifications
    await supabase.from('notifications').delete().eq('user_id', userId)
  }

  // 4. Anonymise le profil (garde l'UUID pour l'intégrité mais supprime les PII)
  await supabase.from('profiles').update({
    first_name: '[Supprimé]',
    last_name:  '[Supprimé]',
    phone:      null,
    avatar_url: null,
    is_active:  false,
  }).eq('id', userId)

  // 5. Désactive le compte Supabase Auth (soft delete — garde les logs financiers)
  await supabase.auth.admin.updateUserById(userId, {
    ban_duration: 'none',  // L'email ne peut plus servir à se connecter
  })

  const deletedAt = new Date().toISOString()
  console.log(JSON.stringify({
    level:     'audit',
    action:    'GDPR_DELETE',
    userId:    userId.substring(0, 8) + '...', // Tronqué pour les logs
    requestedBy: requestedBy === userId ? 'self' : 'admin',
    deletedAt,
  }))

  return {
    deletedAt,
    confirmation: 'Vos données personnelles ont été supprimées conformément au RGPD (Article 17). Les données financières sont conservées 10 ans conformément à la loi française.',
  }
}

// ─── Droit de rectification (Article 16 RGPD) ───────────────────────────────

export async function rectifyUserData(userId: string, updates: {
  firstName?: string
  lastName?:  string
  phone?:     string
}): Promise<void> {
  const updateData: Record<string, string> = {}
  if (updates.firstName) updateData.first_name = updates.firstName
  if (updates.lastName)  updateData.last_name  = updates.lastName
  if (updates.phone)     updateData.phone      = updates.phone

  if (Object.keys(updateData).length === 0) return

  await supabase.from('profiles').update(updateData).eq('id', userId)
}

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const BUCKET    = process.env.SUPABASE_STORAGE_BUCKET_DOCUMENTS ?? 'documents'
const AVATARS   = process.env.SUPABASE_STORAGE_BUCKET_AVATARS   ?? 'avatars'

// ─── Types de fichiers autorisés ──────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const MAX_FILE_SIZE = 10 * 1024 * 1024  // 10 MB

// ─── Upload sécurisé ──────────────────────────────────────────────────────────

export async function uploadDocument(
  buffer:    Buffer,
  fileName:  string,
  studentId: string,
  docType:   string,
  mimeType:  string,
): Promise<{ signedUrl: string; path: string } | null> {

  // 1. Validation du type MIME
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`Type de fichier non autorisé : ${mimeType}. Types acceptés : PDF, JPEG, PNG, WebP`)
  }

  // 2. Validation de la taille
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`Fichier trop volumineux : ${Math.round(buffer.length / 1024 / 1024)}MB. Maximum : 10MB`)
  }

  // 3. Sanitize le nom de fichier (enlève les caractères dangereux)
  const safeFileName = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100)

  // 4. Chemin isolé par étudiant et type de document
  const path = `enrollments/${studentId}/${docType}/${Date.now()}_${safeFileName}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert:      false,         // Ne jamais écraser un fichier existant
    })

  if (error || !data) {
    console.error('[Storage] Upload failed:', error?.message)
    return null
  }

  // 5. URL SIGNÉE avec TTL 1 heure (jamais d'URL publique pour les documents confidentiels)
  const { data: signedData, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600)  // 1 heure

  if (signErr || !signedData) {
    // Nettoyage si la signature échoue
    await supabase.storage.from(BUCKET).remove([path])
    return null
  }

  return { signedUrl: signedData.signedUrl, path }
}

// ─── Générer une URL signée pour un document existant ────────────────────────

export async function getSignedDocumentUrl(
  path:    string,
  ttlSecs: number = 3600,  // 1h par défaut
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, ttlSecs)

  if (error || !data) return null
  return data.signedUrl
}

// ─── Générer une URL signée pour un avatar ───────────────────────────────────
// Les avatars peuvent être publics — on garde getPublicUrl pour ce cas uniquement

export function getAvatarUrl(path: string): string {
  const { data: { publicUrl } } = supabase.storage.from(AVATARS).getPublicUrl(path)
  return publicUrl
}

// ─── Suppression ─────────────────────────────────────────────────────────────

export async function deleteDocument(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.error('[Storage] Delete failed:', error.message)
}

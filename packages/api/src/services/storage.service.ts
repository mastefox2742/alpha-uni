import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET_DOCUMENTS ?? 'documents'

export async function uploadDocument(
  buffer: Buffer,
  fileName: string,
  studentId: string,
  docType: string,
  mimeType: string,
): Promise<{ url: string; path: string } | null> {
  const path = `enrollments/${studentId}/${docType}/${Date.now()}_${fileName}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false })

  if (error || !data) return null

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: publicUrl, path }
}

export async function deleteDocument(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path])
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UploadedDoc { type: string; fileName: string; fileUrl: string; fileSize: number }

const REQUIRED_DOCS = [
  { type: 'photo',      label: 'Photo d\'identité',           accept: 'image/jpeg,image/png',       maxMb: 2  },
  { type: 'id_card',    label: 'Carte d\'identité / Passeport', accept: 'application/pdf',           maxMb: 5  },
  { type: 'diploma',    label: 'Diplôme du baccalauréat',     accept: 'application/pdf',             maxMb: 10 },
  { type: 'transcript', label: 'Relevé de notes bac',         accept: 'application/pdf',             maxMb: 10 },
]

interface Props {
  studentUserId: string
  onNext: (docs: UploadedDoc[]) => void
  onBack: () => void
}

export function Step4Documents({ studentUserId, onNext, onBack }: Props) {
  const supabase = createClient()
  const [uploaded, setUploaded] = useState<Record<string, UploadedDoc>>({})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleFile(type: string, maxMb: number, file: File | null) {
    if (!file) return
    if (file.size > maxMb * 1024 * 1024) {
      setErrors(e => ({ ...e, [type]: `Fichier trop lourd (max ${maxMb} MB)` }))
      return
    }
    setErrors(e => ({ ...e, [type]: '' }))
    setUploading(u => ({ ...u, [type]: true }))

    const path = `enrollments/${studentUserId}/${type}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('documents').upload(path, file)

    if (error || !data) {
      setErrors(e => ({ ...e, [type]: 'Erreur upload. Réessayez.' }))
    } else {
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)
      setUploaded(u => ({
        ...u,
        [type]: { type, fileName: file.name, fileUrl: publicUrl, fileSize: file.size },
      }))
    }
    setUploading(u => ({ ...u, [type]: false }))
  }

  const allDone = REQUIRED_DOCS.every(d => uploaded[d.type])

  function handleSubmit() {
    if (!allDone) return
    onNext(Object.values(uploaded))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Documents requis</h2>
      <p className="text-sm text-muted-foreground">Tous les documents sont obligatoires pour valider votre dossier.</p>

      <div className="space-y-3">
        {REQUIRED_DOCS.map(({ type, label, accept, maxMb }) => {
          const doc = uploaded[type]
          const loading = uploading[type]
          const err = errors[type]

          return (
            <div key={type} className={`rounded-lg border p-4 transition-colors ${doc ? 'border-green-500 bg-green-50' : 'bg-card'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {accept.includes('image') ? 'JPG / PNG' : 'PDF'} · max {maxMb} MB
                  </p>
                  {doc && <p className="mt-0.5 truncate text-xs text-green-700">✓ {doc.fileName}</p>}
                  {err && <p className="mt-0.5 text-xs text-destructive">{err}</p>}
                </div>

                <label className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' :
                  doc ? 'border-green-500 text-green-700 hover:bg-green-100' :
                  'hover:bg-accent'
                }`}>
                  {loading ? '⏳ Upload…' : doc ? '🔄 Remplacer' : '📎 Choisir'}
                  <input type="file" className="hidden" accept={accept} disabled={loading}
                    onChange={e => handleFile(type, maxMb, e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border px-4 py-2 text-sm hover:bg-accent">← Retour</button>
        <button onClick={handleSubmit} disabled={!allDone}
          className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
          Suivant →
        </button>
      </div>
    </div>
  )
}

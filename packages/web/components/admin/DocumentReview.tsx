'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface Document {
  id:         string
  type:       string
  file_name:  string
  file_url:   string
  is_verified: boolean
}

interface Props {
  applicationId: string
  documents: Document[]
  onDocVerified: (docId: string, verified: boolean) => void
}

export function DocumentReview({ documents, onDocVerified }: Props) {
  const [selected, setSelected] = useState<Document | null>(documents[0] ?? null)

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Liste des docs */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Documents soumis</h3>
        {documents.map(doc => (
          <button key={doc.id} onClick={() => setSelected(doc)}
            className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent ${
              selected?.id === doc.id ? 'border-primary bg-primary/5' : 'bg-card'
            }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium capitalize">{doc.type.replace('_', ' ')}</p>
                <p className="truncate text-xs text-muted-foreground">{doc.file_name}</p>
              </div>
              <Badge variant={doc.is_verified ? 'success' : 'warning'}>
                {doc.is_verified ? '✓' : '?'}
              </Badge>
            </div>
          </button>
        ))}
      </div>

      {/* Visionneuse */}
      <div className="lg:col-span-2 space-y-3">
        {selected ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold capitalize">{selected.type.replace('_', ' ')}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => onDocVerified(selected.id, true)}
                  disabled={selected.is_verified}
                  className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-40">
                  ✅ Valider
                </button>
                <button
                  onClick={() => onDocVerified(selected.id, false)}
                  disabled={!selected.is_verified}
                  className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-white hover:bg-destructive/90 disabled:opacity-40">
                  ❌ Invalider
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="overflow-hidden rounded-xl border bg-muted/30" style={{ height: 480 }}>
              {selected.file_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.file_url} alt={selected.file_name}
                  className="h-full w-full object-contain" />
              ) : (
                <iframe src={selected.file_url} className="h-full w-full"
                  title={selected.file_name} />
              )}
            </div>

            <a href={selected.file_url} target="_blank" rel="noopener noreferrer"
              className="inline-block text-xs text-primary hover:underline">
              Ouvrir dans un nouvel onglet ↗
            </a>
          </>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl border text-muted-foreground text-sm">
            Sélectionnez un document
          </div>
        )}
      </div>
    </div>
  )
}

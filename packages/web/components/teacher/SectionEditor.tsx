'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useUpdateSection, useDeleteSection, useCreateMaterial, useDeleteMaterial } from '@/lib/hooks/useElearning'

const MATERIAL_TYPES = [
  { value: 'video',  label: '🎬 Vidéo' },
  { value: 'pdf',    label: '📄 PDF' },
  { value: 'slide',  label: '📊 Slides' },
  { value: 'link',   label: '🔗 Lien' },
  { value: 'text',   label: '📝 Texte' },
  { value: 'other',  label: '📎 Autre' },
]

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m${sec > 0 ? ` ${sec}s` : ''}`
}

export function SectionEditor({ section }: { section: any }) {
  const [expanded, setExpanded]       = useState(true)
  const [editing, setEditing]         = useState(false)
  const [title, setTitle]             = useState(section.title as string)
  const [showAddMat, setShowAddMat]   = useState(false)
  const [matForm, setMatForm]         = useState({
    title: '', type: 'video', url: '', content: '', durationS: '',
  })

  const updateSection = useUpdateSection()
  const deleteSection = useDeleteSection()
  const createMat     = useCreateMaterial(section.id)
  const deleteMat     = useDeleteMaterial()

  const materials: any[] = [...((section.elearning_materials as any[]) ?? [])]
    .sort((a, b) => a.position - b.position)

  async function handleSaveTitle() {
    try {
      await updateSection.mutateAsync({ id: section.id, body: { title } })
      setEditing(false)
      toast.success('Section mise à jour')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette section et tout son contenu ?')) return
    try {
      await deleteSection.mutateAsync(section.id)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleAddMaterial() {
    if (!matForm.title.trim()) { toast.error('Titre requis'); return }
    try {
      const body: { title: string; type: string; url?: string; content?: string; durationS?: number } = {
        title: matForm.title,
        type:  matForm.type,
      }
      if (matForm.url)      body.url      = matForm.url
      if (matForm.content)  body.content  = matForm.content
      if (matForm.durationS && Number(matForm.durationS) > 0)
        body.durationS = Number(matForm.durationS)

      await createMat.mutateAsync(body)
      setMatForm({ title: '', type: 'video', url: '', content: '', durationS: '' })
      setShowAddMat(false)
      toast.success('Matériau ajouté')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header section */}
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
        <button onClick={() => setExpanded(v => !v)} className="text-muted-foreground hover:text-foreground">
          {expanded ? '▾' : '▸'}
        </button>

        {editing ? (
          <div className="flex flex-1 gap-2">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="flex-1 rounded-md border bg-background px-2 py-1 text-sm font-medium"
              onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
              autoFocus
            />
            <button onClick={handleSaveTitle} className="rounded bg-primary px-2 py-1 text-xs text-white">✓</button>
            <button onClick={() => { setEditing(false); setTitle(section.title) }} className="rounded border px-2 py-1 text-xs">✕</button>
          </div>
        ) : (
          <>
            <span className="flex-1 font-medium text-sm">{title}</span>
            <span className="text-xs text-muted-foreground">{materials.length} matériaux</span>
            <button onClick={() => setEditing(true)} className="rounded p-1 text-xs hover:bg-accent">✏️</button>
            <button onClick={handleDelete} className="rounded p-1 text-xs text-red-500 hover:bg-red-50">🗑</button>
          </>
        )}
      </div>

      {/* Contenu section */}
      {expanded && (
        <div className="divide-y">
          {materials.map((mat: any) => (
            <div key={mat.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-lg">
                {MATERIAL_TYPES.find(t => t.value === mat.type)?.label.split(' ')[0] ?? '📎'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{mat.title}</p>
                <p className="text-xs text-muted-foreground">
                  {MATERIAL_TYPES.find(t => t.value === mat.type)?.label.split(' ').slice(1).join(' ')}
                  {mat.duration_s ? ` • ${formatDuration(mat.duration_s)}` : ''}
                </p>
              </div>
              {mat.url && (
                <a href={mat.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary underline hover:text-primary/80">
                  Ouvrir
                </a>
              )}
              <button
                onClick={async () => {
                  try {
                    await deleteMat.mutateAsync(mat.id)
                  } catch (err) {
                    toast.error((err as Error).message)
                  }
                }}
                className="rounded p-1 text-xs text-red-500 hover:bg-red-50"
              >
                🗑
              </button>
            </div>
          ))}

          {/* Formulaire ajout matériau */}
          {showAddMat ? (
            <div className="p-4 space-y-3 bg-muted/20">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Titre *</label>
                  <input
                    type="text"
                    value={matForm.title}
                    onChange={e => setMatForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Titre du matériau"
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Type *</label>
                  <select
                    value={matForm.type}
                    onChange={e => setMatForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  >
                    {MATERIAL_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {['video', 'pdf', 'slide', 'link'].includes(matForm.type) && (
                <div>
                  <label className="block text-xs font-medium mb-1">URL</label>
                  <input
                    type="url"
                    value={matForm.url}
                    onChange={e => setMatForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  />
                </div>
              )}
              {matForm.type === 'text' && (
                <div>
                  <label className="block text-xs font-medium mb-1">Contenu</label>
                  <textarea
                    value={matForm.content}
                    onChange={e => setMatForm(f => ({ ...f, content: e.target.value }))}
                    rows={3}
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  />
                </div>
              )}
              {matForm.type === 'video' && (
                <div>
                  <label className="block text-xs font-medium mb-1">Durée (secondes)</label>
                  <input
                    type="number"
                    value={matForm.durationS}
                    onChange={e => setMatForm(f => ({ ...f, durationS: e.target.value }))}
                    placeholder="ex: 3600"
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAddMaterial}
                  disabled={createMat.isPending}
                  className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createMat.isPending ? 'Ajout...' : 'Ajouter'}
                </button>
                <button
                  onClick={() => setShowAddMat(false)}
                  className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddMat(true)}
              className="w-full py-2.5 text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
            >
              + Ajouter un matériau
            </button>
          )}
        </div>
      )}
    </div>
  )
}

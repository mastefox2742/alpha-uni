'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  useElearningCourseTeacher,
  useUpsertElearningCourse,
  usePublishElearningCourse,
  useCreateSection,
} from '@/lib/hooks/useElearning'
import { SectionEditor } from './SectionEditor'
import { AssignmentsList } from './AssignmentsList'
import { QuizManager } from './QuizManager'

type Tab = 'content' | 'assignments' | 'quizzes'

export function ElearningEditor({ courseId }: { courseId: string }) {
  const [tab, setTab]                   = useState<Tab>('content')
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [showSectionForm, setShowSectionForm] = useState(false)

  const { data: ec, isLoading } = useElearningCourseTeacher(courseId)
  const upsert    = useUpsertElearningCourse()
  const publish   = usePublishElearningCourse()

  // If no e-learning course exists yet, ec will be null — we still show the page
  const ecId: string | null = ec?.id ?? null

  const createSectionMut = useCreateSection(ecId ?? '')

  // ── Initialiser le cours e-learning si inexistant
  async function handleInit() {
    try {
      await upsert.mutateAsync({ courseId, body: {} })
      toast.success('Cours e-learning créé')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handlePublish(published: boolean) {
    if (!ecId) return
    try {
      await publish.mutateAsync({ ecId, published })
      toast.success(published ? 'Cours publié ✅' : 'Cours dépublié')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function handleCreateSection() {
    if (!ecId) return
    if (!newSectionTitle.trim()) { toast.error('Titre requis'); return }
    try {
      await createSectionMut.mutateAsync({ title: newSectionTitle })
      setNewSectionTitle('')
      setShowSectionForm(false)
      toast.success('Section ajoutée')
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
      </div>
    )
  }

  if (!ec) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <p className="text-muted-foreground mb-4 text-sm">
          Ce cours n'a pas encore de contenu e-learning.
        </p>
        <button
          onClick={handleInit}
          disabled={upsert.isPending}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {upsert.isPending ? 'Création...' : '🚀 Créer le cours e-learning'}
        </button>
      </div>
    )
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'content',     label: '📚 Contenu' },
    { id: 'assignments', label: '📝 Devoirs' },
    { id: 'quizzes',     label: '🧠 Quiz' },
  ]

  const sections = (ec.elearning_sections as any[]) ?? []
  const sortedSections = [...sections].sort((a, b) => a.position - b.position)

  return (
    <div className="space-y-6">
      {/* Header du cours e-learning */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <div>
          <h2 className="font-semibold">{(ec.courses as any)?.name ?? 'Cours'}</h2>
          <p className="text-xs text-muted-foreground">
            {sortedSections.length} section(s) •{' '}
            {sections.reduce((s: number, sec: any) =>
              s + ((sec.elearning_materials as any[])?.length ?? 0), 0)} matériaux
          </p>
        </div>
        <div className="flex items-center gap-2">
          {ec.is_published ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              ✅ Publié
            </span>
          ) : (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
              ⏸ Brouillon
            </span>
          )}
          <button
            onClick={() => handlePublish(!ec.is_published)}
            disabled={publish.isPending}
            className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
          >
            {ec.is_published ? 'Dépublier' : 'Publier'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              tab === t.id ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {tab === 'content' && (
        <div className="space-y-4">
          {sortedSections.map((section: any) => (
            <SectionEditor key={section.id} section={section} />
          ))}

          {/* Ajouter une section */}
          {showSectionForm ? (
            <div className="flex gap-2 rounded-xl border bg-card p-4">
              <input
                type="text"
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                placeholder="Titre de la section..."
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleCreateSection()}
                autoFocus
              />
              <button
                onClick={handleCreateSection}
                disabled={createSectionMut.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Créer
              </button>
              <button
                onClick={() => { setShowSectionForm(false); setNewSectionTitle('') }}
                className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSectionForm(true)}
              className="w-full rounded-xl border border-dashed py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              + Ajouter une section
            </button>
          )}
        </div>
      )}

      {tab === 'assignments' && <AssignmentsList ecId={ecId!} assignments={(ec.elearning_assignments as any[]) ?? []} />}
      {tab === 'quizzes'     && <QuizManager     ecId={ecId!} quizzes={(ec.elearning_quizzes as any[]) ?? []} />}
    </div>
  )
}

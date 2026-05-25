'use client'

import { useState } from 'react'
import { useLibretto, type LibrettoFilters } from '@/lib/hooks/useLibretto'
import { LibrettoFiltersBar } from './LibrettoFilters'
import { GpaSummary } from './GpaSummary'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type SortKey = 'courseName' | 'grade' | 'cfu' | 'examDate'
type SortDir = 'asc' | 'desc'

function gradeVariant(grade: string) {
  if (grade === '30L') return 'success'
  const n = Number(grade)
  if (n >= 27) return 'success'
  if (n >= 18) return 'warning'
  return 'destructive'
}

export function LibrettoTable({ studentId }: { studentId?: string }) {
  const [filters, setFilters] = useState<LibrettoFilters>({})
  const [sortKey, setSortKey] = useState<SortKey>('examDate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const { data = [], isLoading } = useLibretto(filters)

  // tri
  const sorted = [...data].sort((a, b) => {
    let av: string | number = a[sortKey] ?? ''
    let bv: string | number = b[sortKey] ?? ''
    if (sortKey === 'grade') {
      av = a.grade === '30L' ? 30 : Number(a.grade) || 0
      bv = b.grade === '30L' ? 30 : Number(b.grade) || 0
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortBtn({ col, label }: { col: SortKey; label: string }) {
    return (
      <button
        onClick={() => toggleSort(col)}
        className="flex items-center gap-1 hover:text-foreground"
      >
        {label}
        {sortKey === col && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
      </button>
    )
  }

  async function handleExportPdf() {
    const res = await fetch('/api/students/me/libretto/pdf', { method: 'POST' })
    if (!res.ok) return
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'libretto.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Filtres + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LibrettoFiltersBar filters={filters} onChange={setFilters} />
        <button
          onClick={handleExportPdf}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          📄 Exporter PDF
        </button>
      </div>

      {/* Résumé */}
      {sorted.length > 0 && <GpaSummary entries={sorted} />}

      {/* Tableau */}
      {sorted.length === 0 ? (
        <div className="rounded-xl border bg-card py-16 text-center text-muted-foreground">
          <p className="text-4xl">📭</p>
          <p className="mt-2 text-sm">Aucune note enregistrée.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">
                  <SortBtn col="courseName" label="Matière" />
                </th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-center">
                  <SortBtn col="cfu" label="CFU" />
                </th>
                <th className="px-4 py-3 text-center">
                  <SortBtn col="grade" label="Note" />
                </th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Enseignant</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  <SortBtn col="examDate" label="Date" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{entry.courseName}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{entry.courseCode}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{entry.cfu}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={gradeVariant(entry.grade)}>
                      {entry.grade}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {entry.teacherName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {entry.examDate
                      ? new Intl.DateTimeFormat('fr-FR').format(new Date(entry.examDate))
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

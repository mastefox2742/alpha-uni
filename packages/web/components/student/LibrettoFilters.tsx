'use client'

import type { LibrettoFilters } from '@/lib/hooks/useLibretto'

interface Props {
  filters:   LibrettoFilters
  onChange:  (f: LibrettoFilters) => void
}

export function LibrettoFiltersBar({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Semestre */}
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-muted-foreground">Semestre</label>
        <select
          value={filters.semester ?? ''}
          onChange={(e) =>
            onChange({ ...filters, semester: e.target.value ? (Number(e.target.value) as 1 | 2) : undefined })
          }
          className="rounded-md border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tous</option>
          <option value="1">S1</option>
          <option value="2">S2</option>
        </select>
      </div>

      {/* Année de cours */}
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-muted-foreground">Année</label>
        <select
          value={filters.courseYear ?? ''}
          onChange={(e) =>
            onChange({ ...filters, courseYear: e.target.value ? Number(e.target.value) : undefined })
          }
          className="rounded-md border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Toutes</option>
          {[1, 2, 3, 4, 5].map((y) => (
            <option key={y} value={y}>Année {y}</option>
          ))}
        </select>
      </div>

      {/* Reset */}
      {(filters.semester || filters.courseYear) && (
        <button
          onClick={() => onChange({})}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Réinitialiser
        </button>
      )}
    </div>
  )
}

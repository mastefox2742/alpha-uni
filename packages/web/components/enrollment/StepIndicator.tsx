import { cn } from '@/lib/utils'

const STEPS = [
  { n: 1, label: 'Compte' },
  { n: 2, label: 'Identité' },
  { n: 3, label: 'Filière' },
  { n: 4, label: 'Documents' },
  { n: 5, label: 'Confirmation' },
]

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Étapes d'inscription" className="mb-8">
      <ol className="flex items-center gap-0">
        {STEPS.map(({ n, label }, i) => (
          <li key={n} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors',
                  n < current  && 'bg-primary text-primary-foreground',
                  n === current && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  n > current  && 'bg-muted text-muted-foreground',
                )}
              >
                {n < current ? '✓' : n}
              </span>
              <span className={cn(
                'hidden text-xs sm:block',
                n === current ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'mx-1 h-0.5 flex-1',
                n < current ? 'bg-primary' : 'bg-muted',
              )} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

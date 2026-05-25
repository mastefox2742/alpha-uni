import { cn } from '@/lib/utils'

type Variant = 'default' | 'success' | 'warning' | 'destructive' | 'outline'

const variants: Record<Variant, string> = {
  default:     'bg-primary text-primary-foreground',
  success:     'bg-green-100 text-green-800',
  warning:     'bg-yellow-100 text-yellow-800',
  destructive: 'bg-red-100 text-red-800',
  outline:     'border border-border text-foreground',
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

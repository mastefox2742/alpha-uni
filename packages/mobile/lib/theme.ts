/**
 * Design tokens UniGest Mobile
 * Source unique de vérité pour toutes les couleurs, espacements et typographies.
 */

export const colors = {
  // Brand
  primary:     '#6366f1',  // Indigo-500
  primaryDark: '#4f46e5',  // Indigo-600
  primaryBg:   '#ede9fe',  // Violet-100
  primaryLight:'#e0e7ff',  // Indigo-100

  // Status
  success:     '#10b981',  // Emerald-500
  successBg:   '#d1fae5',  // Emerald-100
  successDark: '#065f46',

  warning:     '#f59e0b',  // Amber-500
  warningBg:   '#fef3c7',  // Amber-100
  warningDark: '#92400e',

  error:       '#ef4444',  // Red-500
  errorBg:     '#fee2e2',  // Red-100
  errorDark:   '#991b1b',

  info:        '#3b82f6',  // Blue-500
  infoBg:      '#eff6ff',  // Blue-50
  infoDark:    '#1e40af',

  // Neutrals
  text:        '#111827',  // Gray-900
  textSecond:  '#6b7280',  // Gray-500
  textMuted:   '#9ca3af',  // Gray-400
  border:      '#e5e7eb',  // Gray-200
  borderLight: '#f3f4f6',  // Gray-100
  background:  '#f9fafb',  // Gray-50
  card:        '#ffffff',

  // Grades
  gradeExcellent: '#f59e0b',  // 30/30
  gradeGood:      '#10b981',  // ≥27
  gradeOk:        '#6366f1',  // ≥24
  gradeLow:       '#f97316',  // <24
} as const

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
} as const

export const typography = {
  xs:   { fontSize: 11, lineHeight: 16 },
  sm:   { fontSize: 12, lineHeight: 18 },
  base: { fontSize: 14, lineHeight: 20 },
  md:   { fontSize: 15, lineHeight: 22 },
  lg:   { fontSize: 18, lineHeight: 26 },
  xl:   { fontSize: 22, lineHeight: 30 },
  '2xl':{ fontSize: 24, lineHeight: 32 },
  '3xl':{ fontSize: 28, lineHeight: 36 },
  '4xl':{ fontSize: 32, lineHeight: 40 },
} as const

export const shadow = {
  sm: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius:  4,
    elevation:     2,
  },
  md: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius:  8,
    elevation:     4,
  },
  lg: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius:  16,
    elevation:     8,
  },
} as const

// ─── Styles composants réutilisables ─────────────────────────────────────────

export const card = {
  backgroundColor: colors.card,
  borderRadius:    radius.lg,
  padding:         spacing.lg,
  ...shadow.sm,
}

export const screenHeader = {
  paddingTop:        56,
  paddingHorizontal: spacing.xl,
  paddingBottom:     spacing.md,
  backgroundColor:   colors.background,
}

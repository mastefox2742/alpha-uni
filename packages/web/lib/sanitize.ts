/**
 * Utilitaires de sanitization côté client.
 * Protège contre XSS et injections avant tout affichage ou envoi de données.
 */

// ─── DOMPurify (navigateur uniquement) ────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let DOMPurify: any = null

async function getDOMPurify(): Promise<{ sanitize: (s: string, cfg?: Record<string, unknown>) => string } | null> {
  if (typeof window === 'undefined') return null  // SSR : skip
  if (!DOMPurify) {
    const mod = await import('dompurify')
    DOMPurify = mod.default ?? mod
  }
  return DOMPurify as { sanitize: (s: string, cfg?: Record<string, unknown>) => string }
}

/**
 * Nettoie du HTML pour affichage sécurisé.
 * Utilisation : contenu utilisateur affiché en dangerouslySetInnerHTML.
 */
export async function sanitizeHtml(dirty: string): Promise<string> {
  const purifier = await getDOMPurify()
  if (!purifier) return escapeHtml(dirty)  // Fallback SSR
  return purifier.sanitize(dirty, {
    ALLOWED_TAGS:  ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR:  ['href'],
    FORCE_BODY:    true,
  })
}

/**
 * Sanitize pour texte brut — supprime tout HTML.
 * Utilisation : inputs utilisateur avant envoi à l'API.
 */
export async function sanitizeText(dirty: string): Promise<string> {
  const purifier = await getDOMPurify()
  if (!purifier) return escapeHtml(dirty)
  return purifier.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

// ─── Escape HTML pur (sync, SSR-safe) ────────────────────────────────────────

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;')
}

// ─── Validation + sanitize des inputs formulaire ─────────────────────────────

export function sanitizeInput(value: string, maxLength = 500): string {
  return value
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')  // Supprime les caractères de contrôle
}

/**
 * Valide qu'une URL est sûre (commence par https:// ou http://)
 * Protège contre les attaques javascript: et data:
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['https:', 'http:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Nettoie un objet formulaire — applique sanitizeInput sur toutes les strings.
 * Usage : const clean = sanitizeFormData(formValues)
 */
export function sanitizeFormData<T extends Record<string, unknown>>(
  data: T,
  maxLengths: Partial<Record<keyof T, number>> = {},
): T {
  const result = { ...data }
  for (const key of Object.keys(result) as Array<keyof T>) {
    const val = result[key]
    if (typeof val === 'string') {
      result[key] = sanitizeInput(val, maxLengths[key] ?? 500) as T[keyof T]
    }
  }
  return result
}

// ─── Validation email côté client ─────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  // RFC 5322 simplifié — suffisant pour la validation UX
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email) && email.length <= 255
}

// ─── Protection contre le Path Traversal ─────────────────────────────────────

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[/\\?%*:|"<>]/g, '_')  // Caractères interdits dans les noms de fichiers
    .replace(/\.\./g, '_')            // Bloque le path traversal (../../etc/passwd)
    .trim()
    .slice(0, 100)
}

/**
 * Configuration Sentry — monitoring des erreurs en production.
 * Ne capture rien si SENTRY_DSN n'est pas configuré (dev/test).
 */
import * as Sentry from '@sentry/node'

export function initSentry() {
  const dsn = process.env.SENTRY_DSN
  if (!dsn || process.env.NODE_ENV !== 'production') return

  Sentry.init({
    dsn,
    environment:  process.env.NODE_ENV,
    release:      process.env.npm_package_version ?? '1.0.0',
    tracesSampleRate: 0.1,  // 10% des transactions en trace

    // ─── Filtrage des données sensibles ──────────────────────────────────────
    beforeSend(event) {
      // Supprime les données sensibles avant envoi à Sentry
      if (event.request) {
        // Masque les headers d'autorisation
        if (event.request.headers) {
          delete event.request.headers['authorization']
          delete event.request.headers['cookie']
        }
        // Masque le body des requêtes auth
        if (event.request.url?.includes('/auth/')) {
          event.request.data = '[REDACTED - auth endpoint]'
        }
      }

      // Masque les propriétés utilisateur (RGPD)
      if (event.user?.id !== undefined) {
        event.user = { id: event.user.id }  // Garde uniquement l'ID anonyme
      } else if (event.user) {
        delete event.user
      }

      return event
    },

    // Ignore les erreurs attendues (non-bugs)
    ignoreErrors: [
      'Token invalide',
      'Non authentifié',
      'Accès refusé',
      'Route introuvable',
      'Too Many Requests',
    ],
  })

  console.log('[Sentry] Monitoring activé')
}

export { Sentry }

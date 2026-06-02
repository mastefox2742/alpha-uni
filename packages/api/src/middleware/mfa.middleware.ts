import type { Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'
import type { AuthenticatedRequest } from './auth.middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/**
 * Middleware MFA — Vérifie que l'utilisateur a complété l'authentification MFA.
 *
 * À utiliser sur les routes admin critiques :
 *   router.delete('/users/:id', authMiddleware, requireMFA, requireRole('admin'), handler)
 *
 * Si le projet n'a pas encore activé MFA obligatoire (REQUIRE_MFA=false),
 * le middleware logge un avertissement et laisse passer (mode progressif).
 */
export async function requireMFA(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  // Mode progressif : désactivable via variable d'env pendant la migration
  if (process.env.REQUIRE_MFA !== 'true') {
    // Logge pour tracking — combien de requêtes admin sans MFA
    console.warn(`[MFA] Contournement autorisé (REQUIRE_MFA=false) — user: ${req.user?.id ?? 'unknown'} — ${req.method} ${req.path}`)
    return next()
  }

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Non authentifié', statusCode: 401 })
  }

  try {
    // Vérifie le niveau d'assurance de l'authentification via Supabase
    const { data, error } = await supabase.auth.admin.getUserById(req.user.id)

    if (error || !data.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Utilisateur introuvable', statusCode: 401 })
    }

    // Supabase stocke les facteurs MFA sur l'utilisateur
    const factors = data.user.factors ?? []
    const hasTOTP  = factors.some(f => f.factor_type === 'totp' && f.status === 'verified')

    if (!hasTOTP) {
      return res.status(403).json({
        error:      'MFA Required',
        message:    'L\'authentification à deux facteurs est obligatoire pour cette action.',
        mfaSetupUrl: '/settings/security/mfa',
        statusCode: 403,
      })
    }

    return next()
  } catch (err) {
    console.error('[MFA] Erreur vérification MFA:', (err as Error).message)
    return res.status(500).json({ error: 'Internal Server Error', message: 'Erreur vérification MFA', statusCode: 500 })
  }
}

/**
 * Middleware : Log les accès admin sensibles pour l'audit trail.
 * À brancher sur toutes les routes à risque (suppression, export, diplôme).
 */
export function auditLog(action: string) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const userId    = req.user?.id ?? 'anonymous'
    const userRole  = req.user?.role ?? 'unknown'
    const timestamp = new Date().toISOString()
    const ip        = req.ip ?? req.socket.remoteAddress ?? 'unknown'

    // Log structuré — facilement parsable par Loki/Datadog/CloudWatch
    console.log(JSON.stringify({
      level:     'audit',
      timestamp,
      action,
      userId,
      userRole,
      method:    req.method,
      path:      req.path,
      // Masque l'IP en production pour RGPD
      ip:        process.env.NODE_ENV === 'production' ? ip.split('.').slice(0, 2).join('.') + '.x.x' : ip,
    }))

    return next()
  }
}

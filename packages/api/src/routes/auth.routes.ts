import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware'
import { validate, LoginSchema, RefreshTokenSchema } from '../middleware/validate'
import { getProfile } from '../services/profile.service'

export const authRouter = Router()

// Service-role client — uniquement pour les opérations admin (vérif token, profil)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/**
 * POST /api/auth/login
 * Authentification email + password
 * Rate limité à 5 tentatives/15min (voir src/index.ts)
 */
authRouter.post('/login',
  validate(LoginSchema),  // ← Validation Zod : email valide, password ≥ 6 chars
  async (req, res) => {
    const { email, password } = req.body as { email: string; password: string }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      // Message générique — ne pas révéler si l'email existe ou non (user enumeration)
      return res.status(401).json({
        error:      'Unauthorized',
        message:    'Identifiants invalides',
        statusCode: 401,
      })
    }

    const profile = await getProfile(data.user.id)
    return res.json({
      data: {
        accessToken:  data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt:    data.session.expires_at,
        user: {
          id:   data.user.id,
          // Ne jamais retourner l'email en clair dans une réponse loggée
          role: profile?.role ?? 'student',
          name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : '',
        },
      },
    })
  },
)

/**
 * POST /api/auth/logout
 * Révoque le token de l'utilisateur côté Supabase
 */
authRouter.post('/logout',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    // Révoquer le token spécifique de cet utilisateur (pas signOut() global)
    // On utilise l'access token de la requête pour révoquer la session correcte
    const token = req.headers.authorization?.slice(7)
    if (token) {
      // Crée un client avec le token utilisateur pour cibler SA session
      const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } },
      )
      await userClient.auth.signOut()
    }
    return res.json({ data: { message: 'Déconnecté avec succès' } })
  },
)

/**
 * POST /api/auth/refresh
 * Renouvelle l'access token via le refresh token
 */
authRouter.post('/refresh',
  validate(RefreshTokenSchema),
  async (req, res) => {
    const { refreshToken } = req.body as { refreshToken: string }

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data.session) {
      return res.status(401).json({
        error:      'Unauthorized',
        message:    'Token invalide ou expiré',
        statusCode: 401,
      })
    }

    return res.json({
      data: {
        accessToken:  data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt:    data.session.expires_at,
      },
    })
  },
)

/**
 * GET /api/auth/me
 * Retourne le profil de l'utilisateur connecté
 */
authRouter.get('/me',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

    const profile = await getProfile(req.user.id)
    if (!profile) return res.status(404).json({ error: 'Not Found', message: 'Profil introuvable' })

    return res.json({
      data: {
        id:        req.user.id,
        role:      req.user.role,
        firstName: profile.firstName,
        lastName:  profile.lastName,
        avatarUrl: profile.avatarUrl,
        isActive:  profile.isActive,
      },
    })
  },
)

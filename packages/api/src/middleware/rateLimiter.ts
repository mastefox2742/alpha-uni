import rateLimit from 'express-rate-limit'

const jsonError = (message: string) =>
  (_req: unknown, res: { status: (n: number) => { json: (o: unknown) => void } }) => {
    res.status(429).json({ error: 'Too Many Requests', message, statusCode: 429 })
  }

// ─── Login / Signup : 5 tentatives / 15 min par IP ───────────────────────────
export const loginLimiter = rateLimit({
  windowMs:              15 * 60 * 1000,  // 15 minutes
  limit:                 5,
  standardHeaders:       true,
  legacyHeaders:         false,
  skipSuccessfulRequests: true,
  handler:               jsonError('Trop de tentatives de connexion. Réessayez dans 15 minutes.'),
})

// ─── API publique générale : 100 req/min ──────────────────────────────────────
export const apiLimiter = rateLimit({
  windowMs:        60 * 1000,
  limit:           100,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         jsonError("Limite de requêtes atteinte. Réessayez dans 1 minute."),
})

// ─── Upload de fichiers : 10 req/min ─────────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs:        60 * 1000,
  limit:           10,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         jsonError("Trop d'envois de fichiers. Réessayez dans 1 minute."),
})

// ─── Endpoints sensibles admin : 30 req/min ───────────────────────────────────
export const adminLimiter = rateLimit({
  windowMs:        60 * 1000,
  limit:           30,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         jsonError("Limite de requêtes admin atteinte. Réessayez dans 1 minute."),
})

// ─── Génération de documents : 5 req/min ─────────────────────────────────────
export const documentLimiter = rateLimit({
  windowMs:        60 * 1000,
  limit:           5,
  standardHeaders: true,
  legacyHeaders:   false,
  handler:         jsonError("Trop de générations de documents. Réessayez dans 1 minute."),
})

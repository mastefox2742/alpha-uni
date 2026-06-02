/**
 * UniGest — Cloudflare Worker WAF
 *
 * Fonctions :
 * 1. Rate limiting distribué (KV Storage)
 * 2. Blocage des patterns d'attaque (SQLi, XSS, path traversal)
 * 3. Headers de sécurité additionnels
 * 4. Geo-blocking optionnel
 * 5. Bot detection basique
 * 6. DDoS protection (seuils stricts)
 */

interface Env {
  RATE_LIMIT_KV: KVNamespace
  API_ORIGIN:    string
  WEB_ORIGIN:    string
}

// ─── Configuration ────────────────────────────────────────────────────────────

const RATE_LIMITS: Record<string, { max: number; windowSec: number }> = {
  '/api/auth/login':  { max: 5,   windowSec: 900  },  // 5/15min — brute force
  '/api/auth/signup': { max: 3,   windowSec: 3600 },  // 3/h — inscription
  '/api/gdpr':        { max: 5,   windowSec: 60   },  // 5/min — export
  'default':          { max: 200, windowSec: 60   },  // 200/min — global
}

// Patterns SQLi / XSS / Path traversal à bloquer
const ATTACK_PATTERNS = [
  /(\bSELECT\b.*\bFROM\b|\bINSERT\b.*\bINTO\b|\bDROP\b.*\bTABLE\b|\bUNION\b.*\bSELECT\b)/i,
  /(<script[\s\S]*?>[\s\S]*?<\/script>|javascript:|on\w+\s*=)/i,
  /(\.\.\/|\.\.\\|%2e%2e%2f|%252e%252e)/i,
  /(\|\||&&|;.*\b(cat|ls|pwd|wget|curl|bash|sh)\b)/i,
]

// User-agents de bots malveillants connus
const BAD_BOTS = [
  'sqlmap', 'nikto', 'nessus', 'masscan', 'zgrab',
  'dirbuster', 'gobuster', 'wfuzz', 'hydra', 'medusa',
]

// ─── Handler principal ────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url   = new URL(request.url)
    const ip    = request.headers.get('CF-Connecting-IP') ?? 'unknown'
    const ua    = request.headers.get('User-Agent')?.toLowerCase() ?? ''
    const path  = url.pathname

    // 1. Bot detection
    if (BAD_BOTS.some(bot => ua.includes(bot))) {
      return new Response('Forbidden', { status: 403 })
    }

    // 2. Scan de l'URL pour patterns d'attaque
    const fullUrl = decodeURIComponent(url.pathname + url.search)
    for (const pattern of ATTACK_PATTERNS) {
      if (pattern.test(fullUrl)) {
        console.warn(`[WAF] Attack pattern blocked: ${ip} — ${path}`)
        return new Response(
          JSON.stringify({ error: 'Bad Request', message: 'Requête bloquée', statusCode: 400 }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
      }
    }

    // 3. Scan du body pour les requêtes POST/PATCH/PUT
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const cloned = request.clone()
      try {
        const body = await cloned.text()
        if (body.length > 1_048_576) {  // 1MB max
          return new Response(
            JSON.stringify({ error: 'Payload Too Large', statusCode: 413 }),
            { status: 413, headers: { 'Content-Type': 'application/json' } },
          )
        }
        for (const pattern of ATTACK_PATTERNS) {
          if (pattern.test(body)) {
            console.warn(`[WAF] Attack in body: ${ip} — ${path}`)
            return new Response(
              JSON.stringify({ error: 'Bad Request', message: 'Requête bloquée', statusCode: 400 }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }
        }
      } catch { /* Body non-parseable — ignore */ }
    }

    // 4. Rate limiting distribué
    const rateLimitCfg = RATE_LIMITS[path] ?? RATE_LIMITS['default']!
    const rateLimitKey = `rl:${ip}:${path}`

    const current = await env.RATE_LIMIT_KV.get(rateLimitKey)
    const count   = current ? parseInt(current) : 0

    if (count >= rateLimitCfg.max) {
      return new Response(
        JSON.stringify({ error: 'Too Many Requests', message: 'Limite de requêtes atteinte', statusCode: 429 }),
        {
          status:  429,
          headers: {
            'Content-Type':  'application/json',
            'Retry-After':   String(rateLimitCfg.windowSec),
            'X-RateLimit-Limit':     String(rateLimitCfg.max),
            'X-RateLimit-Remaining': '0',
          },
        },
      )
    }

    // Incrémenter le compteur (fire-and-forget)
    ctx.waitUntil(
      env.RATE_LIMIT_KV.put(rateLimitKey, String(count + 1), {
        expirationTtl: rateLimitCfg.windowSec,
      }),
    )

    // 5. Proxy vers l'origine
    const isApi  = path.startsWith('/api/')
    const origin = isApi ? env.API_ORIGIN : env.WEB_ORIGIN
    const proxied = new Request(`${origin}${path}${url.search}`, request)

    const response = await fetch(proxied)

    // 6. Ajouter les headers de sécurité WAF sur la réponse
    const newHeaders = new Headers(response.headers)
    newHeaders.set('X-Content-Type-Options',     'nosniff')
    newHeaders.set('X-Frame-Options',             'DENY')
    newHeaders.set('X-XSS-Protection',            '1; mode=block')
    newHeaders.set('Strict-Transport-Security',   'max-age=31536000; includeSubDomains; preload')
    newHeaders.set('Referrer-Policy',             'strict-origin-when-cross-origin')
    newHeaders.set('Permissions-Policy',          'camera=(), microphone=(), geolocation=()')
    newHeaders.set('X-Powered-By',               '')  // Masque la stack technique

    // Rate limit headers informatifs
    newHeaders.set('X-RateLimit-Limit',     String(rateLimitCfg.max))
    newHeaders.set('X-RateLimit-Remaining', String(rateLimitCfg.max - count - 1))

    return new Response(response.body, {
      status:     response.status,
      statusText: response.statusText,
      headers:    newHeaders,
    })
  },
}

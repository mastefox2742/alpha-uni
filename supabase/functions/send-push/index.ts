/**
 * UniGest — Edge Function : send-push
 *
 * Envoie une notification push via l'API Expo Push Service.
 * Appelée depuis le backend ou directement par Supabase triggers.
 *
 * POST /functions/v1/send-push
 * Body: {
 *   userId?: string           // Envoyer à un utilisateur spécifique
 *   userIds?: string[]        // Envoyer à plusieurs utilisateurs
 *   title: string
 *   body: string
 *   data?: Record<string, unknown>   // Données supplémentaires (route, id...)
 *   sound?: 'default' | null
 *   badge?: number
 * }
 *
 * Auth: Bearer SUPABASE_SERVICE_ROLE_KEY (interne uniquement)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

interface PushPayload {
  userId?:  string
  userIds?: string[]
  title:    string
  body:     string
  data?:    Record<string, unknown>
  sound?:   'default' | null
  badge?:   number
}

interface ExpoPushMessage {
  to:     string
  title:  string
  body:   string
  data?:  Record<string, unknown>
  sound?: 'default' | null
  badge?: number
}

Deno.serve(async (req: Request) => {
  // ─── CORS ────────────────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    // ─── Auth : service role uniquement ────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Vérifie que l'appelant est authentifié
    const token = authHeader.slice(7)
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ─── Parsing du body ───────────────────────────────────────────────────────
    const payload: PushPayload = await req.json()
    const { title, body, data, sound = 'default', badge } = payload

    if (!title || !body) {
      return Response.json({ error: 'title et body sont requis' }, { status: 400 })
    }

    // ─── Résoudre les user IDs ─────────────────────────────────────────────────
    const targetIds: string[] = []
    if (payload.userId)        targetIds.push(payload.userId)
    if (payload.userIds?.length) targetIds.push(...payload.userIds)

    if (targetIds.length === 0) {
      return Response.json({ error: 'userId ou userIds requis' }, { status: 400 })
    }

    // ─── Récupérer les tokens actifs ───────────────────────────────────────────
    const { data: tokens, error: tokErr } = await supabase
      .from('push_tokens')
      .select('token, platform, user_id')
      .in('user_id', targetIds)
      .eq('is_active', true)

    if (tokErr) throw new Error(tokErr.message)
    if (!tokens || tokens.length === 0) {
      return Response.json({ sent: 0, message: 'Aucun token actif trouvé' })
    }

    // ─── Préparer les messages Expo ────────────────────────────────────────────
    const messages: ExpoPushMessage[] = tokens.map(t => ({
      to:    t.token as string,
      title,
      body,
      data:  data ?? {},
      sound: sound ?? 'default',
      badge,
    }))

    // ─── Envoi par batch de 100 (limite Expo) ──────────────────────────────────
    const BATCH_SIZE = 100
    const results: unknown[] = []

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch   = messages.slice(i, i + BATCH_SIZE)
      const expoRes = await fetch(EXPO_PUSH_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify(batch),
      })
      const expoData = await expoRes.json()
      results.push(expoData)

      // Gestion des tokens invalides → désactiver
      if (expoData.data && Array.isArray(expoData.data)) {
        for (let j = 0; j < expoData.data.length; j++) {
          const ticket = expoData.data[j]
          if (ticket?.status === 'error' && ticket?.details?.error === 'DeviceNotRegistered') {
            const badToken = messages[i + j]?.to
            if (badToken) {
              await supabase
                .from('push_tokens')
                .update({ is_active: false })
                .eq('token', badToken)
            }
          }
        }
      }
    }

    // ─── Sauvegarder la notification en base ──────────────────────────────────
    const notifRows = targetIds.map(userId => ({
      user_id: userId,
      type:    (data?.type as string) ?? 'info',
      title,
      message: body,
      is_read: false,
    }))

    await supabase.from('notifications').insert(notifRows)

    console.log(`[send-push] Envoyé à ${tokens.length} token(s) pour ${targetIds.length} user(s)`)

    return Response.json({
      sent:    tokens.length,
      users:   targetIds.length,
      results,
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[send-push] Error:', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
})

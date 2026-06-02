/**
 * Hook de gestion des notifications push.
 *
 * Ce hook :
 * 1. Demande la permission de notifications à l'utilisateur
 * 2. Récupère le token Expo Push Token
 * 3. Sauvegarde le token dans Supabase (table push_tokens)
 * 4. Configure les handlers pour notifications en foreground
 * 5. Configure le handler de tap sur notification (navigation)
 *
 * Usage :
 *   // Dans _layout.tsx ou app/(student)/_layout.tsx
 *   useNotifications()
 */

import { useEffect, useRef } from 'react'
import { Platform, Alert } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { supabase } from './supabase'

// ─── Configuration globale du comportement des notifications ─────────────────
// À appeler une seule fois au démarrage de l'app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:   true,    // Afficher l'alerte même si l'app est ouverte
    shouldPlaySound:   true,
    shouldSetBadge:    true,
    shouldShowBanner:  true,
    shouldShowList:    true,
  }),
})

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useNotifications() {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null)
  const responseListener     = useRef<Notifications.EventSubscription | null>(null)

  useEffect(() => {
    registerForPushNotifications()

    // ─── Handler : notification reçue quand l'app est ouverte ────────────────
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Push] Notification reçue en foreground:', notification.request.identifier)
      // Ici on pourrait mettre à jour un compteur de notifications non lues
    })

    // ─── Handler : tap sur une notification ──────────────────────────────────
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as Record<string, unknown>

      // Navigation basée sur le type de notification
      if (data?.route) {
        router.push(data.route as Parameters<typeof router.push>[0])
      } else if (data?.type) {
        switch (data.type) {
          case 'exam':
            router.push('/(student)/exams')
            break
          case 'fee':
            router.push('/(student)/fees')
            break
          case 'grade':
            router.push('/(student)/libretto')
            break
          case 'thesis':
            router.push('/(student)/thesis' as Parameters<typeof router.push>[0])
            break
          default:
            router.push('/(student)/notifications')
        }
      } else {
        router.push('/(student)/notifications')
      }
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])
}

// ─── Enregistrement du token push ────────────────────────────────────────────

async function registerForPushNotifications(): Promise<string | null> {
  // Les simulateurs ne supportent pas les push notifications
  if (!Device.isDevice) {
    console.log('[Push] Pas de push sur simulateur')
    return null
  }

  // Vérification de la permission existante
  // expo-notifications étend expo-modules-core PermissionResponse (status, granted, canAskAgain)
  // On cast pour accéder aux champs de l'interface parente
  const existingPerm = await Notifications.getPermissionsAsync() as unknown as {
    status: string; granted: boolean; canAskAgain: boolean
  }
  let isGranted = existingPerm.granted

  if (!isGranted) {
    const newPerm = await Notifications.requestPermissionsAsync() as unknown as {
      granted: boolean
    }
    isGranted = newPerm.granted
  }

  if (!isGranted) {
    console.log('[Push] Permission refusée')
    return null
  }

  // ─── Configuration Android ────────────────────────────────────────────────
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('unigest', {
      name:              'UniGest',
      importance:        Notifications.AndroidImportance.MAX,
      vibrationPattern:  [0, 250, 250, 250],
      lightColor:        '#6366f1',
      sound:             'default',
      enableVibrate:     true,
      showBadge:         true,
    })

    await Notifications.setNotificationChannelAsync('unigest-urgent', {
      name:              'Alertes urgentes',
      importance:        Notifications.AndroidImportance.HIGH,
      vibrationPattern:  [0, 500, 250, 500],
      lightColor:        '#ef4444',
      sound:             'default',
      enableVibrate:     true,
      showBadge:         true,
    })
  }

  try {
    // Récupère le token Expo (format : ExponentPushToken[xxxx])
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId

    if (!projectId) {
      console.warn('[Push] projectId manquant dans app.json — push désactivé en dev')
      return null
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
    const token     = tokenData.data

    console.log('[Push] Token obtenu:', token.substring(0, 30) + '…')

    // Sauvegarde dans Supabase
    await savePushToken(token)

    return token
  } catch (err) {
    console.error('[Push] Erreur obtention token:', err)
    return null
  }
}

async function savePushToken(token: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  const platform = Platform.OS as 'ios' | 'android' | 'web'

  const { error } = await supabase.rpc('upsert_push_token', {
    p_user_id:   session.user.id,
    p_token:     token,
    p_platform:  platform,
    p_device_id: null,
  })

  if (error) {
    console.error('[Push] Erreur sauvegarde token:', error.message)
  } else {
    console.log('[Push] Token sauvegardé en base')
  }
}

// ─── Désactiver le token au logout ───────────────────────────────────────────

export async function deregisterPushToken(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync()
    const token     = tokenData.data

    await supabase
      .from('push_tokens')
      .update({ is_active: false })
      .eq('user_id', session.user.id)
      .eq('token', token)
  } catch {
    // Silencieux — pas critique si ça échoue
  }
}

// ─── Utilitaire : envoyer une notification locale (test / rappel) ─────────────

export async function scheduleLocalNotification(opts: {
  title:   string
  body:    string
  seconds: number
  data?:   Record<string, unknown>
}): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: opts.title,
      body:  opts.body,
      sound: 'default',
      data:  opts.data ?? {},
    },
    trigger: opts.seconds > 0
      ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: opts.seconds }
      : null,
  })
}

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useNotifications } from '@/lib/useNotifications'

export default function RootLayout() {
  // Initialise les push notifications dès le démarrage
  useNotifications()

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(student)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}

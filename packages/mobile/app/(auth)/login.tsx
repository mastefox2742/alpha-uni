import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native'
import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'
import { colors, spacing, radius, shadow, typography } from '@/lib/theme'

const BIOMETRIC_KEY = '@unigest:biometric_enabled'
const LAST_EMAIL_KEY = '@unigest:last_email'

export default function LoginScreen() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [bioAvailable, setBioAvail] = useState(false)
  const [bioEnabled, setBioEnabled] = useState(false)
  const [showPass, setShowPass]   = useState(false)

  useEffect(() => {
    initBiometric()
  }, [])

  async function initBiometric() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled  = await LocalAuthentication.isEnrolledAsync()
    const enabled     = await AsyncStorage.getItem(BIOMETRIC_KEY)
    const lastEmail   = await AsyncStorage.getItem(LAST_EMAIL_KEY)

    if (lastEmail) setEmail(lastEmail)

    const canUseBio = hasHardware && isEnrolled && enabled === 'true'
    setBioAvail(canUseBio)
    setBioEnabled(canUseBio)

    // Auto-lancement biométrie si disponible
    if (canUseBio) {
      triggerBiometric()
    }
  }

  async function triggerBiometric() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Connexion à UniGest',
        cancelLabel:   'Utiliser le mot de passe',
        fallbackLabel: 'Mot de passe',
        disableDeviceFallback: false,
      })

      if (result.success) {
        // Récupère la session Supabase existante
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.replace('/(student)/dashboard')
        } else {
          // Session expirée — refresh token
          const { data: { session: newSession } } = await supabase.auth.refreshSession()
          if (newSession) {
            router.replace('/(student)/dashboard')
          } else {
            // Token expiré — retour au login classique
            setBioEnabled(false)
            Alert.alert('Session expirée', 'Veuillez vous reconnecter avec votre mot de passe.')
          }
        }
      }
    } catch {
      // Biométrie annulée — on laisse l'user faire le login classique
    }
  }

  async function handleLogin() {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password.trim()) {
      Alert.alert('Erreur', 'Email et mot de passe requis')
      return
    }

    // Validation email basique côté client
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Erreur', 'Format d\'email invalide')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email:    trimmedEmail,
        password: password.trim(),
      })
      if (error) throw error

      // Mémorise l'email pour la prochaine connexion biométrique
      await AsyncStorage.setItem(LAST_EMAIL_KEY, trimmedEmail)

      router.replace('/(student)/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Identifiants incorrects'
      Alert.alert('Connexion échouée', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🎓</Text>
          </View>
          <Text style={styles.logoTitle}>UniGest</Text>
          <Text style={styles.logoSub}>Portail étudiant</Text>
        </View>

        {/* Bouton biométrique */}
        {bioAvailable && bioEnabled && (
          <TouchableOpacity
            style={styles.bioButton}
            onPress={triggerBiometric}
            activeOpacity={0.8}
          >
            <Text style={styles.bioIcon}>
              {Platform.OS === 'ios' ? '🔒' : '👆'}
            </Text>
            <Text style={styles.bioText}>
              {Platform.OS === 'ios' ? 'Se connecter avec Face ID / Touch ID' : 'Se connecter avec l\'empreinte digitale'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Séparateur */}
        {bioAvailable && bioEnabled && (
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou continuer avec</Text>
            <View style={styles.separatorLine} />
          </View>
        )}

        {/* Formulaire */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email universitaire</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="prenom.nom@univ.fr"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPass}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPass(v => !v)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Se connecter</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Identifiants oubliés ? Contactez le secrétariat ou{'\n'}
          utilisez le portail web UniGest.
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: {
    flex:              1,
    justifyContent:    'center',
    paddingHorizontal: 28,
    paddingBottom:     40,
  },

  logoContainer: { alignItems: 'center', marginBottom: spacing['3xl'] },
  logoBox: {
    width:           88,
    height:          88,
    borderRadius:    radius.xl,
    backgroundColor: colors.primaryBg,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.md,
    ...shadow.md,
  },
  logoEmoji: { fontSize: 44 },
  logoTitle: { ...typography['4xl'], fontWeight: '900', color: colors.text, letterSpacing: -1 },
  logoSub:   { ...typography.base, color: colors.textMuted, marginTop: spacing.xs },

  bioButton: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             spacing.sm,
    backgroundColor: colors.primaryBg,
    borderRadius:    radius.lg,
    paddingVertical: spacing.lg,
    marginBottom:    spacing.xl,
    borderWidth:     1,
    borderColor:     colors.primaryLight,
  },
  bioIcon: { fontSize: 24 },
  bioText: { ...typography.base, fontWeight: '600', color: colors.primary },

  separator: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.md,
    marginBottom:   spacing.xl,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: colors.border },
  separatorText: { ...typography.sm, color: colors.textMuted },

  form:  { gap: spacing.lg },
  field: { gap: spacing.xs },
  label: { ...typography.sm, fontWeight: '600', color: colors.textSecond },

  input: {
    backgroundColor:  colors.card,
    borderWidth:      1,
    borderColor:      colors.border,
    borderRadius:     radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical:  spacing.md,
    ...typography.md,
    color:            colors.text,
  },
  passwordRow:  { flexDirection: 'row', alignItems: 'center' },
  passwordInput:{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  eyeBtn: {
    backgroundColor:        colors.card,
    borderWidth:            1,
    borderLeftWidth:        0,
    borderColor:            colors.border,
    borderTopRightRadius:   radius.md,
    borderBottomRightRadius: radius.md,
    paddingHorizontal:      spacing.md,
    paddingVertical:        spacing.md,
    justifyContent:         'center',
  },
  eyeIcon: { fontSize: 18 },

  button: {
    backgroundColor: colors.primary,
    borderRadius:    radius.md,
    paddingVertical: spacing.lg,
    alignItems:      'center',
    marginTop:       spacing.sm,
    ...shadow.md,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', ...typography.md, fontWeight: '700' },

  footer: {
    textAlign: 'center',
    color:     colors.textMuted,
    ...typography.xs,
    marginTop: spacing['3xl'],
    lineHeight: 18,
  },
})

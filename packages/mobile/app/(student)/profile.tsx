import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert,
  ActivityIndicator, Platform, TextInput,
} from 'react-native'
import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'
import { apiFetch } from '@/lib/api'
import { deregisterPushToken } from '@/lib/useNotifications'
import { colors, spacing, radius, shadow, typography } from '@/lib/theme'

const NOTIF_PREFS_KEY = '@unigest:notif_prefs'

// ─── Types ────────────────────────────────────────────────────────────────────

type StudentProfile = {
  firstName:    string
  lastName:     string
  role:         string
  matricola:    string | null
  program:      string
  currentYear:  number
  cfuEarned:    number
  cfuTotal:     number
  status:       string
  thesisStatus: string | null
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  active:     { label: 'Actif',      color: colors.successDark, bg: colors.successBg },
  enrolled:   { label: 'Inscrit',    color: colors.infoDark,    bg: colors.infoBg    },
  suspended:  { label: 'Suspendu',   color: colors.errorDark,   bg: colors.errorBg   },
  graduated:  { label: 'Diplômé 🎓', color: colors.successDark, bg: colors.successBg },
  withdrawn:  { label: 'Retiré',     color: colors.textMuted,   bg: colors.border    },
}

const BIOMETRIC_KEY = '@unigest:biometric_enabled'

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const [profile, setProfile]         = useState<StudentProfile | null>(null)
  const [loading, setLoading]         = useState(true)
  const [exporting, setExporting]         = useState(false)
  const [biometricAvail, setBioAvail]     = useState(false)
  const [biometricEnabled, setBioEnabled] = useState(false)
  // Préférences de notifications
  const [notifExams,    setNotifExams]    = useState(true)
  const [notifFees,     setNotifFees]     = useState(true)
  const [notifGrades,   setNotifGrades]   = useState(true)
  const [notifThesis,   setNotifThesis]   = useState(false)
  // Changement de mot de passe
  const [showPwdForm,   setShowPwdForm]   = useState(false)
  const [currentPwd,    setCurrentPwd]    = useState('')
  const [newPwd,        setNewPwd]        = useState('')
  const [changingPwd,   setChangingPwd]   = useState(false)

  useEffect(() => {
    loadProfile()
    checkBiometric()
    loadNotifPrefs()
  }, [])

  async function loadProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const [profileRes, studentRes] = await Promise.all([
        supabase.from('profiles').select('first_name, last_name, role').eq('id', session.user.id).single(),
        supabase
          .from('students')
          .select(`
            matricola, status, current_year, total_cfu_earned,
            degree_programs!degree_program_id(name, total_cfu),
            theses!student_id(status)
          `)
          .eq('user_id', session.user.id)
          .single(),
      ])

      const p = profileRes.data
      const s = studentRes.data
      const dpRaw = s?.degree_programs as Array<{ name: string; total_cfu: number }> | null
      const dp = Array.isArray(dpRaw) ? (dpRaw[0] ?? null) : (dpRaw as { name: string; total_cfu: number } | null)
      const th = (s?.theses as Array<{ status: string }> | null)?.[0]

      setProfile({
        firstName:   p?.first_name ?? '',
        lastName:    p?.last_name  ?? '',
        role:        p?.role ?? 'student',
        matricola:   s?.matricola ?? null,
        program:     dp?.name ?? '—',
        currentYear: s?.current_year ?? 1,
        cfuEarned:   s?.total_cfu_earned ?? 0,
        cfuTotal:    dp?.total_cfu ?? 180,
        status:      s?.status ?? 'active',
        thesisStatus: th?.status ?? null,
      })
    } catch (err) {
      console.error('[Profile]', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadNotifPrefs() {
    const stored = await AsyncStorage.getItem(NOTIF_PREFS_KEY)
    if (stored) {
      const prefs = JSON.parse(stored) as Record<string, boolean>
      if (prefs.exams    !== undefined) setNotifExams(prefs.exams)
      if (prefs.fees     !== undefined) setNotifFees(prefs.fees)
      if (prefs.grades   !== undefined) setNotifGrades(prefs.grades)
      if (prefs.thesis   !== undefined) setNotifThesis(prefs.thesis)
    }
  }

  async function saveNotifPref(key: string, value: boolean) {
    const stored = await AsyncStorage.getItem(NOTIF_PREFS_KEY)
    const prefs  = stored ? JSON.parse(stored) as Record<string, boolean> : {}
    await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify({ ...prefs, [key]: value }))
  }

  async function handleChangePassword() {
    if (!currentPwd || !newPwd) {
      Alert.alert('Erreur', 'Remplissez les deux champs.')
      return
    }
    if (newPwd.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setChangingPwd(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) throw error
      setCurrentPwd('')
      setNewPwd('')
      setShowPwdForm(false)
      Alert.alert('✅ Mot de passe modifié', 'Votre mot de passe a été mis à jour.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du changement'
      Alert.alert('Erreur', msg)
    } finally {
      setChangingPwd(false)
    }
  }

  async function checkBiometric() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled  = await LocalAuthentication.isEnrolledAsync()
    setBioAvail(hasHardware && isEnrolled)

    const stored = await AsyncStorage.getItem(BIOMETRIC_KEY)
    setBioEnabled(stored === 'true')
  }

  async function toggleBiometric(value: boolean) {
    if (value) {
      // Demande une authentification avant d'activer
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirmez votre identité pour activer Face ID / Empreinte',
        cancelLabel:   'Annuler',
      })
      if (!result.success) return
    }
    await AsyncStorage.setItem(BIOMETRIC_KEY, value.toString())
    setBioEnabled(value)
  }

  async function handleExportData() {
    Alert.alert(
      'Exporter mes données',
      'Vous allez recevoir un fichier JSON avec toutes vos données personnelles (RGPD Article 15).',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Exporter',
          onPress: async () => {
            setExporting(true)
            try {
              await apiFetch('/api/gdpr/export')
              Alert.alert(
                '✅ Export préparé',
                'Vos données ont été préparées. Consultez votre espace web UniGest pour les télécharger.',
              )
            } catch {
              Alert.alert('Erreur', "Impossible d'exporter vos données.")
            } finally {
              setExporting(false)
            }
          },
        },
      ],
    )
  }

  async function handleDeleteAccount() {
    Alert.alert(
      '⚠️ Supprimer mon compte',
      'Cette action supprimera vos données personnelles (RGPD Article 17). Les données financières sont conservées 10 ans conformément à la loi. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            // Double confirmation
            Alert.alert(
              'Confirmation finale',
              'Êtes-vous absolument certain ? Cette action ne peut pas être annulée.',
              [
                { text: 'Non', style: 'cancel' },
                {
                  text: 'Oui, supprimer',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await apiFetch('/api/gdpr/me', { method: 'DELETE' })
                      await supabase.auth.signOut()
                      router.replace('/(auth)/login')
                    } catch {
                      Alert.alert('Erreur', 'Impossible de supprimer le compte. Contactez le secrétariat.')
                    }
                  },
                },
              ],
            )
          },
        },
      ],
    )
  }

  async function handleLogout() {
    // Désactive le token push AVANT de se déconnecter
    await deregisterPushToken()
    await supabase.auth.signOut()
    router.replace('/(auth)/login')
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  const statusCfg = STATUS_CFG[profile?.status ?? 'active'] ?? STATUS_CFG.active!
  const cfuPct    = profile ? Math.round((profile.cfuEarned / profile.cfuTotal) * 100) : 0

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Carte profil */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {(profile?.firstName[0] ?? '') + (profile?.lastName[0] ?? '')}
          </Text>
        </View>
        <Text style={styles.fullName}>{profile?.firstName} {profile?.lastName}</Text>
        {profile?.matricola && (
          <Text style={styles.matricola}>Matr. {profile.matricola}</Text>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>

      {/* Infos académiques */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parcours académique</Text>

        <View style={styles.infoCard}>
          <InfoRow label="Filière"    value={profile?.program ?? '—'} />
          <InfoRow label="Année"      value={`L${profile?.currentYear ?? '?'}`} />

          {/* Barre de progression CFU */}
          <View style={styles.cfuRow}>
            <Text style={styles.infoLabel}>CFU</Text>
            <View style={styles.cfuRight}>
              <Text style={styles.infoValue}>{profile?.cfuEarned} / {profile?.cfuTotal}</Text>
              <View style={styles.cfuBar}>
                <View style={[styles.cfuFill, { width: `${Math.min(cfuPct, 100)}%` as `${number}%` }]} />
              </View>
              <Text style={styles.cfuPct}>{cfuPct}%</Text>
            </View>
          </View>

          {profile?.thesisStatus && (
            <InfoRow
              label="Thèse"
              value={
                profile.thesisStatus === 'defended'    ? '✅ Soutenue'
                : profile.thesisStatus === 'in_progress' ? '📝 En cours'
                : profile.thesisStatus === 'submitted'   ? '📤 Soumise'
                : profile.thesisStatus === 'approved'    ? '✔️ Approuvée'
                : profile.thesisStatus
              }
            />
          )}
        </View>
      </View>

      {/* Sécurité */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sécurité</Text>
        <View style={styles.infoCard}>
          {biometricAvail ? (
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.switchTitle}>
                  {Platform.OS === 'ios' ? '🔒 Face ID / Touch ID' : '🔒 Empreinte digitale'}
                </Text>
                <Text style={styles.switchSubtitle}>Connexion rapide et sécurisée</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={biometricEnabled ? '#fff' : colors.textMuted}
              />
            </View>
          ) : (
            <View style={styles.bioUnavailable}>
              <Text style={styles.infoValue}>
                Biométrie non disponible sur cet appareil
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* RGPD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes données (RGPD)</Text>
        <View style={styles.infoCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleExportData}
            disabled={exporting}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📥</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Exporter mes données</Text>
              <Text style={styles.actionSubtitle}>Article 15 & 20 RGPD — Format JSON/CSV</Text>
            </View>
            {exporting
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={styles.actionChevron}>›</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.error }]}>Supprimer mon compte</Text>
              <Text style={styles.actionSubtitle}>Article 17 RGPD — Irréversible</Text>
            </View>
            <Text style={[styles.actionChevron, { color: colors.error }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Accès rapide */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accès rapide</Text>
        <View style={styles.infoCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/(student)/certificates' as Parameters<typeof router.push>[0])}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📄</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Mes certificats</Text>
              <Text style={styles.actionSubtitle}>Scolarité, relevé de notes, attestations</Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Préférences de notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications push</Text>
        <View style={styles.infoCard}>
          {([
            { key: 'exams',  label: '📝 Rappels examens',   sub: 'Avant chaque date d\'examen',     val: notifExams,  set: setNotifExams  },
            { key: 'fees',   label: '💶 Alertes frais',     sub: 'Échéances et retards de paiement', val: notifFees,   set: setNotifFees   },
            { key: 'grades', label: '📋 Publication notes', sub: 'Quand vos notes sont disponibles', val: notifGrades, set: setNotifGrades },
            { key: 'thesis', label: '📖 Mises à jour thèse',sub: 'Jalons et nouvelles de votre directeur', val: notifThesis, set: setNotifThesis },
          ] as const).map(({ key, label, sub, val, set }) => (
            <View key={key} style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.switchTitle}>{label}</Text>
                <Text style={styles.switchSubtitle}>{sub}</Text>
              </View>
              <Switch
                value={val}
                onValueChange={v => { set(v); void saveNotifPref(key, v) }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={val ? '#fff' : colors.textMuted}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Paramètres du compte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.infoCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setShowPwdForm(v => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🔑</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Changer le mot de passe</Text>
              <Text style={styles.actionSubtitle}>Modifiez votre mot de passe de connexion</Text>
            </View>
            <Text style={styles.actionChevron}>{showPwdForm ? '▲' : '›'}</Text>
          </TouchableOpacity>

          {showPwdForm && (
            <View style={styles.pwdForm}>
              <TextInput
                style={styles.pwdInput}
                placeholder="Mot de passe actuel"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={currentPwd}
                onChangeText={setCurrentPwd}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.pwdInput}
                placeholder="Nouveau mot de passe (min. 8 caractères)"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={newPwd}
                onChangeText={setNewPwd}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.pwdBtn, changingPwd && { opacity: 0.6 }]}
                onPress={handleChangePassword}
                disabled={changingPwd}
                activeOpacity={0.8}
              >
                {changingPwd
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.pwdBtnText}>Confirmer le changement</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Déconnexion */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
      </TouchableOpacity>

      <Text style={styles.version}>UniGest v1.0.0 — Portail étudiant</Text>
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { paddingTop: 56, paddingBottom: 40 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },

  profileCard: {
    alignItems:   'center',
    paddingVertical: spacing['3xl'],
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width:           80,
    height:          80,
    borderRadius:    radius.full,
    backgroundColor: colors.primaryBg,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.md,
  },
  avatarInitials: { fontSize: 32, fontWeight: '800', color: colors.primary },
  fullName:       { ...typography['2xl'], fontWeight: '800', color: colors.text },
  matricola:      { ...typography.sm, color: colors.textMuted, marginTop: spacing.xs },
  statusBadge: {
    marginTop:       spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius:    radius.full,
  },
  statusText: { ...typography.sm, fontWeight: '700' },

  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionTitle: {
    ...typography.sm,
    fontWeight:   '700',
    color:        colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },

  infoCard: {
    backgroundColor: colors.card,
    borderRadius:    radius.lg,
    overflow:        'hidden',
    ...shadow.sm,
  },

  infoRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap:             spacing.md,
  },
  infoLabel: { ...typography.base, color: colors.textSecond, flexShrink: 0 },
  infoValue: { ...typography.base, fontWeight: '600', color: colors.text, textAlign: 'right', flex: 1 },

  cfuRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cfuRight:  { flex: 1, alignItems: 'flex-end', gap: 4, marginLeft: spacing.md },
  cfuBar:    { height: 6, width: 120, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' },
  cfuFill:   { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  cfuPct:    { ...typography.xs, color: colors.primary, fontWeight: '700' },

  switchRow: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap:             spacing.md,
  },
  switchLabel:    { flex: 1 },
  switchTitle:    { ...typography.base, fontWeight: '600', color: colors.text },
  switchSubtitle: { ...typography.xs, color: colors.textMuted, marginTop: 2 },
  bioUnavailable: { padding: spacing.lg },

  divider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: spacing.lg },

  actionRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap:            spacing.md,
  },
  actionIcon:     { fontSize: 22, width: 32, textAlign: 'center' },
  actionContent:  { flex: 1 },
  actionTitle:    { ...typography.base, fontWeight: '600', color: colors.text },
  actionSubtitle: { ...typography.xs, color: colors.textMuted, marginTop: 2 },
  actionChevron:  { ...typography.xl, color: colors.textMuted },

  pwdForm: {
    paddingHorizontal: spacing.lg,
    paddingBottom:     spacing.md,
    gap:               spacing.sm,
    borderTopWidth:    1,
    borderTopColor:    colors.borderLight,
    paddingTop:        spacing.md,
  },
  pwdInput: {
    backgroundColor:   colors.background,
    borderWidth:       1,
    borderColor:       colors.border,
    borderRadius:      radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    ...typography.base,
    color:             colors.text,
  },
  pwdBtn: {
    backgroundColor: colors.primary,
    borderRadius:    radius.md,
    paddingVertical: spacing.md,
    alignItems:      'center',
    marginTop:       spacing.xs,
  },
  pwdBtnText: { color: '#fff', ...typography.base, fontWeight: '700' },

  logoutBtn: {
    marginHorizontal: spacing.xl,
    marginBottom:     spacing.lg,
    backgroundColor:  colors.errorBg,
    borderWidth:      1,
    borderColor:      '#fecaca',
    borderRadius:     radius.lg,
    paddingVertical:  spacing.lg,
    alignItems:       'center',
  },
  logoutText: { ...typography.base, fontWeight: '700', color: colors.error },
  version:    { textAlign: 'center', ...typography.xs, color: colors.textMuted, paddingBottom: spacing.xl },
})

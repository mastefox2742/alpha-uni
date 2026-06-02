import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  RefreshControl, Linking, Alert,
} from 'react-native'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { colors, spacing, radius, shadow, typography } from '@/lib/theme'

// ─── Types ────────────────────────────────────────────────────────────────────

type ThesisStatus = 'proposed' | 'approved' | 'in_progress' | 'submitted' | 'defended' | 'rejected'

type Milestone = {
  id:           string
  title:        string
  description:  string | null
  due_date:     string | null
  completed_at: string | null
  status:       'pending' | 'completed' | 'overdue'
}

type Thesis = {
  id:            string
  title:         string
  status:        ThesisStatus
  abstract:      string | null
  submitted_at:  string | null
  defended_at:   string | null
  created_at:    string
  supervisor:    { name: string; email: string | null; department: string } | null
  milestones:    Milestone[]
}

// ─── Config statuts ───────────────────────────────────────────────────────────

const STATUS_CFG: Record<ThesisStatus, {
  label:    string
  emoji:    string
  color:    string
  bg:       string
  progress: number
}> = {
  proposed:    { label: 'Proposée',    emoji: '💡', color: colors.infoDark,    bg: colors.infoBg,    progress: 10 },
  approved:    { label: 'Approuvée',   emoji: '✅', color: colors.successDark, bg: colors.successBg, progress: 25 },
  in_progress: { label: 'En cours',    emoji: '📝', color: colors.primary,     bg: colors.primaryBg, progress: 55 },
  submitted:   { label: 'Soumise',     emoji: '📤', color: colors.warningDark, bg: colors.warningBg, progress: 80 },
  defended:    { label: 'Soutenue',    emoji: '🎓', color: colors.successDark, bg: colors.successBg, progress: 95 },
  rejected:    { label: 'Rejetée',     emoji: '❌', color: colors.errorDark,   bg: colors.errorBg,   progress: 0  },
}

const STEPS: Array<{ key: ThesisStatus; label: string }> = [
  { key: 'proposed',    label: 'Proposition' },
  { key: 'approved',    label: 'Approuvée'   },
  { key: 'in_progress', label: 'Rédaction'   },
  { key: 'submitted',   label: 'Soumission'  },
  { key: 'defended',    label: 'Soutenance'  },
]

function stepIndex(status: ThesisStatus): number {
  return STEPS.findIndex(s => s.key === status)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ThesisScreen() {
  const [thesis, setThesis]         = useState<Thesis | null>(null)
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [noThesis, setNoThesis]     = useState(false)

  async function loadThesis() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!student) { setNoThesis(true); setLoading(false); return }

      // Charge la thèse + jalons + directeur
      const { data } = await supabase
        .from('theses')
        .select(`
          id, title, status, abstract, submitted_at, defended_at, created_at,
          teachers!supervisor_id(
            title,
            profiles!user_id(first_name, last_name),
            departments!department_id(name)
          ),
          thesis_milestones(
            id, title, description, due_date, completed_at
          )
        `)
        .eq('student_id', student.id)
        .not('status', 'eq', 'rejected')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!data) { setNoThesis(true); setLoading(false); return }

      // Normalise le directeur (join Supabase = array)
      const supRaw = data.teachers as Array<{
        title: string
        profiles: Array<{ first_name: string; last_name: string }>
        departments: Array<{ name: string }>
      }> | null
      const sup = Array.isArray(supRaw) ? supRaw[0] : null
      const supProf = Array.isArray(sup?.profiles) ? sup.profiles[0] : null
      const supDept = Array.isArray(sup?.departments) ? sup.departments[0] : null

      // Normalise les jalons + calcule statut
      const today = new Date()
      const rawMilestones = (data.thesis_milestones as Array<{
        id: string; title: string; description: string | null
        due_date: string | null; completed_at: string | null
      }>) ?? []

      const milestones: Milestone[] = rawMilestones
        .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))
        .map(m => ({
          ...m,
          status: m.completed_at
            ? 'completed'
            : m.due_date && new Date(m.due_date) < today
              ? 'overdue'
              : 'pending',
        }))

      setThesis({
        id:           data.id as string,
        title:        data.title as string,
        status:       data.status as ThesisStatus,
        abstract:     data.abstract as string | null,
        submitted_at: data.submitted_at as string | null,
        defended_at:  data.defended_at as string | null,
        created_at:   data.created_at as string,
        supervisor:   sup && supProf ? {
          name:       `${sup.title} ${supProf.first_name} ${supProf.last_name}`,
          email:      null,
          department: supDept?.name ?? '—',
        } : null,
        milestones,
      })
    } catch (err) {
      console.error('[Thesis]', err)
      setNoThesis(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadThesis() }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (noThesis || !thesis) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📖 Ma thèse</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>Aucune thèse enregistrée</Text>
          <Text style={styles.emptySubtitle}>
            Soumettez une proposition de thèse auprès de votre directeur ou du secrétariat.
          </Text>
        </View>
      </View>
    )
  }

  const cfg       = STATUS_CFG[thesis.status]
  const activeStep = stepIndex(thesis.status)
  const doneCount  = thesis.milestones.filter(m => m.status === 'completed').length
  const overdueCount = thesis.milestones.filter(m => m.status === 'overdue').length

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadThesis() }}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📖 Ma thèse</Text>
      </View>

      {/* Carte titre + statut */}
      <View style={styles.heroCard}>
        <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
          <Text style={styles.statusEmoji}>{cfg.emoji}</Text>
          <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>

        <Text style={styles.thesisTitle}>{thesis.title}</Text>

        {thesis.abstract && (
          <Text style={styles.abstract} numberOfLines={3}>{thesis.abstract}</Text>
        )}

        {/* Barre de progression */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Avancement global</Text>
            <Text style={[styles.progressPct, { color: cfg.color }]}>{cfg.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${cfg.progress}%` as `${number}%`, backgroundColor: cfg.color },
            ]} />
          </View>
        </View>
      </View>

      {/* Stepper — étapes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parcours</Text>
        <View style={styles.stepperCard}>
          {STEPS.map((step, idx) => {
            const isDone    = activeStep > idx
            const isCurrent = activeStep === idx
            const isFuture  = activeStep < idx

            return (
              <View key={step.key} style={styles.stepRow}>
                {/* Indicateur */}
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepDot,
                    isDone    && styles.stepDotDone,
                    isCurrent && styles.stepDotCurrent,
                    isFuture  && styles.stepDotFuture,
                  ]}>
                    <Text style={styles.stepDotText}>
                      {isDone ? '✓' : isCurrent ? '●' : String(idx + 1)}
                    </Text>
                  </View>
                  {idx < STEPS.length - 1 && (
                    <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
                  )}
                </View>

                {/* Label */}
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepLabel,
                    isCurrent && { color: colors.primary, fontWeight: '700' },
                    isDone    && { color: colors.success },
                    isFuture  && { color: colors.textMuted },
                  ]}>
                    {step.label}
                    {isCurrent && ' ← en cours'}
                  </Text>
                  {/* Dates */}
                  {step.key === 'submitted' && thesis.submitted_at && (
                    <Text style={styles.stepDate}>
                      {new Date(thesis.submitted_at).toLocaleDateString('fr-FR')}
                    </Text>
                  )}
                  {step.key === 'defended' && thesis.defended_at && (
                    <Text style={styles.stepDate}>
                      {new Date(thesis.defended_at).toLocaleDateString('fr-FR')}
                    </Text>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      </View>

      {/* Directeur */}
      {thesis.supervisor && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Directeur de thèse</Text>
          <View style={styles.supervisorCard}>
            <View style={styles.supervisorAvatar}>
              <Text style={styles.supervisorInitial}>
                {thesis.supervisor.name.split(' ').find(w => /^[A-Z]/.test(w))?.[0] ?? '?'}
              </Text>
            </View>
            <View style={styles.supervisorInfo}>
              <Text style={styles.supervisorName}>{thesis.supervisor.name}</Text>
              <Text style={styles.supervisorDept}>{thesis.supervisor.department}</Text>
            </View>
            {thesis.supervisor.email && (
              <TouchableOpacity
                style={styles.mailBtn}
                onPress={() => Linking.openURL(`mailto:${thesis.supervisor!.email}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.mailIcon}>✉️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Jalons */}
      {thesis.milestones.length > 0 && (
        <View style={styles.section}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.sectionTitle}>Jalons</Text>
            <Text style={styles.milestoneStat}>
              {doneCount}/{thesis.milestones.length} ✓
              {overdueCount > 0 && ` · ${overdueCount} en retard ⚠️`}
            </Text>
          </View>

          <View style={styles.milestonesCard}>
            {thesis.milestones.map((m, idx) => (
              <View key={m.id}>
                <View style={styles.milestoneRow}>
                  <View style={[
                    styles.milestoneIcon,
                    m.status === 'completed' && styles.milestoneIconDone,
                    m.status === 'overdue'   && styles.milestoneIconOverdue,
                  ]}>
                    <Text style={styles.milestoneIconText}>
                      {m.status === 'completed' ? '✓' : m.status === 'overdue' ? '!' : '○'}
                    </Text>
                  </View>

                  <View style={styles.milestoneContent}>
                    <Text style={[
                      styles.milestoneTitle,
                      m.status === 'completed' && styles.milestoneTitleDone,
                      m.status === 'overdue'   && { color: colors.error },
                    ]}>
                      {m.title}
                    </Text>
                    {m.description && (
                      <Text style={styles.milestoneDesc} numberOfLines={2}>{m.description}</Text>
                    )}
                    {m.due_date && (
                      <Text style={[
                        styles.milestoneDate,
                        m.status === 'overdue' && { color: colors.error },
                      ]}>
                        {m.status === 'completed' ? '✅ Terminé le ' : '📅 '}
                        {new Date(m.completed_at ?? m.due_date).toLocaleDateString('fr-FR')}
                      </Text>
                    )}
                  </View>
                </View>
                {idx < thesis.milestones.length - 1 && (
                  <View style={styles.milestoneDivider} />
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Alerte jalons en retard */}
      {overdueCount > 0 && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>
            ⚠️ {overdueCount} jalon{overdueCount > 1 ? 's' : ''} en retard.
            Contactez votre directeur de thèse dès que possible.
          </Text>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { paddingBottom: 32 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingTop:        56,
    paddingHorizontal: spacing.xl,
    paddingBottom:     spacing.md,
    backgroundColor:   colors.background,
  },
  title: { ...typography['2xl'], fontWeight: '800', color: colors.text },

  emptyContainer: {
    flex:          1,
    alignItems:    'center',
    justifyContent:'center',
    paddingTop:    60,
    paddingHorizontal: spacing['4xl'],
  },
  emptyEmoji:    { fontSize: 56, marginBottom: spacing.lg },
  emptyTitle:    { ...typography.xl, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptySubtitle: { ...typography.base, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },

  heroCard: {
    marginHorizontal: spacing.xl,
    marginBottom:     spacing.xl,
    backgroundColor:  colors.card,
    borderRadius:     radius.xl,
    padding:          spacing['2xl'],
    ...shadow.md,
  },
  statusPill: {
    flexDirection:   'row',
    alignItems:      'center',
    alignSelf:       'flex-start',
    gap:             spacing.xs,
    borderRadius:    radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom:    spacing.md,
  },
  statusEmoji:  { fontSize: 14 },
  statusLabel:  { ...typography.sm, fontWeight: '700' },
  thesisTitle:  { ...typography.lg, fontWeight: '800', color: colors.text, marginBottom: spacing.sm, lineHeight: 26 },
  abstract:     { ...typography.sm, color: colors.textSecond, lineHeight: 18, marginBottom: spacing.lg },

  progressSection: { gap: spacing.xs },
  progressHeader:  { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel:   { ...typography.xs, color: colors.textMuted },
  progressPct:     { ...typography.xs, fontWeight: '700' },
  progressBar:     { height: 8, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' },
  progressFill:    { height: '100%', borderRadius: radius.full },

  section: {
    paddingHorizontal: spacing.xl,
    marginBottom:      spacing.xl,
  },
  sectionTitle: {
    ...typography.sm,
    fontWeight:    '700',
    color:         colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom:  spacing.sm,
  },

  // Stepper
  stepperCard: {
    backgroundColor: colors.card,
    borderRadius:    radius.lg,
    padding:         spacing.lg,
    ...shadow.sm,
  },
  stepRow: {
    flexDirection: 'row',
    gap:           spacing.md,
  },
  stepLeft: {
    alignItems: 'center',
    width:      28,
  },
  stepDot: {
    width:           28,
    height:          28,
    borderRadius:    radius.full,
    backgroundColor: colors.border,
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          1,
  },
  stepDotDone:    { backgroundColor: colors.success },
  stepDotCurrent: { backgroundColor: colors.primary },
  stepDotFuture:  { backgroundColor: colors.borderLight, borderWidth: 1, borderColor: colors.border },
  stepDotText: {
    color:      '#fff',
    fontSize:   11,
    fontWeight: '800',
  },
  stepLine: {
    width:           2,
    flex:            1,
    backgroundColor: colors.border,
    marginVertical:  2,
    minHeight:       16,
  },
  stepLineDone:  { backgroundColor: colors.success },
  stepContent: {
    flex:          1,
    paddingBottom: spacing.lg,
    paddingTop:    4,
  },
  stepLabel: { ...typography.base, color: colors.text },
  stepDate:  { ...typography.xs, color: colors.textMuted, marginTop: 2 },

  // Directeur
  supervisorCard: {
    backgroundColor: colors.card,
    borderRadius:    radius.lg,
    padding:         spacing.lg,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.md,
    ...shadow.sm,
  },
  supervisorAvatar: {
    width:           48,
    height:          48,
    borderRadius:    radius.full,
    backgroundColor: colors.primaryBg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  supervisorInitial: { fontSize: 20, fontWeight: '800', color: colors.primary },
  supervisorInfo:    { flex: 1 },
  supervisorName:    { ...typography.base, fontWeight: '700', color: colors.text },
  supervisorDept:    { ...typography.sm, color: colors.textMuted, marginTop: 2 },
  mailBtn: {
    width:           40,
    height:          40,
    borderRadius:    radius.full,
    backgroundColor: colors.infoBg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  mailIcon: { fontSize: 18 },

  // Jalons
  milestoneHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginBottom:    spacing.sm,
  },
  milestoneStat: { ...typography.xs, color: colors.textMuted },
  milestonesCard: {
    backgroundColor: colors.card,
    borderRadius:    radius.lg,
    overflow:        'hidden',
    ...shadow.sm,
  },
  milestoneRow: {
    flexDirection:     'row',
    gap:               spacing.md,
    padding:           spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems:        'flex-start',
  },
  milestoneIcon: {
    width:           28,
    height:          28,
    borderRadius:    radius.full,
    backgroundColor: colors.border,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       2,
    flexShrink:      0,
  },
  milestoneIconDone:    { backgroundColor: colors.successBg },
  milestoneIconOverdue: { backgroundColor: colors.errorBg },
  milestoneIconText:    { fontSize: 12, fontWeight: '800', color: colors.textSecond },
  milestoneContent:  { flex: 1, gap: 3 },
  milestoneTitle:    { ...typography.base, fontWeight: '600', color: colors.text },
  milestoneTitleDone:{ color: colors.textMuted, textDecorationLine: 'line-through' },
  milestoneDesc:     { ...typography.sm, color: colors.textSecond },
  milestoneDate:     { ...typography.xs, color: colors.textMuted },
  milestoneDivider:  { height: 1, backgroundColor: colors.borderLight, marginHorizontal: spacing.lg },

  alert: {
    marginHorizontal: spacing.xl,
    backgroundColor:  colors.errorBg,
    borderWidth:      1,
    borderColor:      '#fecaca',
    borderRadius:     radius.lg,
    padding:          spacing.md,
  },
  alertText: { ...typography.sm, color: colors.errorDark, lineHeight: 18 },
})

import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { colors, spacing, radius, shadow, typography } from '@/lib/theme'

// ─── Types ────────────────────────────────────────────────────────────────────

type Slot = {
  id:        string
  day_of_week: number   // 0=Lun … 4=Ven
  start_time:  string   // "08:00"
  end_time:    string
  room:        string | null
  courses: {
    name:  string
    code:  string
    teachers?: { profiles?: { first_name: string; last_name: string } }
  }
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']
const FULL_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

const SLOT_COLORS = [
  { bg: '#ede9fe', border: '#8b5cf6', text: '#5b21b6' },
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d' },
  { bg: '#e0f2fe', border: '#0ea5e9', text: '#0c4a6e' },
]

// Génère une couleur stable par code de cours
function courseColor(code: string) {
  let hash = 0
  for (let i = 0; i < code.length; i++) hash = code.charCodeAt(i) + ((hash << 5) - hash)
  return SLOT_COLORS[Math.abs(hash) % SLOT_COLORS.length]!
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScheduleScreen() {
  const [slots, setSlots]         = useState<Slot[]>([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = new Date().getDay()
    // Convertit JS (0=dim) → notre format (0=lun)
    return d === 0 ? 4 : d - 1  // Le weekend, on affiche vendredi
  })

  async function loadSlots() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Récupère les cours de l'étudiant via course_enrollments
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!student) { setLoading(false); return }

      // 1. Récupère les IDs de cours de l'étudiant
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', student.id)

      const courseIds = (enrollments ?? []).map(e => e.course_id as string)

      const { data } = courseIds.length > 0
        ? await supabase
            .from('schedule_slots')
            .select(`
              id, day_of_week, start_time, end_time, room,
              courses!course_id(
                name, code,
                teachers!teacher_id(
                  profiles!user_id(first_name, last_name)
                )
              )
            `)
            .in('course_id', courseIds)
            .order('day_of_week')
            .order('start_time')
        : { data: [] }

      setSlots((data ?? []) as unknown as Slot[])
    } catch (err) {
      console.error('[Schedule]', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadSlots() }, [])

  const daySlots = slots.filter(s => s.day_of_week === selectedDay)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🗓️ Mon planning</Text>

        {/* Sélecteur jours */}
        <View style={styles.daySelector}>
          {DAYS.map((day, idx) => {
            const isToday = new Date().getDay() - 1 === idx
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayBtn,
                  selectedDay === idx && styles.dayBtnActive,
                  isToday && selectedDay !== idx && styles.dayBtnToday,
                ]}
                onPress={() => setSelectedDay(idx)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayBtnText,
                  selectedDay === idx && styles.dayBtnTextActive,
                ]}>
                  {day}
                </Text>
                {isToday && (
                  <View style={[
                    styles.todayDot,
                    selectedDay === idx && styles.todayDotActive,
                  ]} />
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadSlots() }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <Text style={styles.dayTitle}>{FULL_DAYS[selectedDay]}</Text>

          {daySlots.length === 0 ? (
            <View style={styles.emptyDay}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyTitle}>Pas de cours</Text>
              <Text style={styles.emptySubtitle}>Profitez de cette journée libre !</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {daySlots.map(slot => {
                const course  = slot.courses as Slot['courses']
                const teacher = (course?.teachers as { profiles?: { first_name: string; last_name: string } } | null)
                const profile = teacher?.profiles
                const col     = courseColor(course?.code ?? '')

                return (
                  <View key={slot.id} style={styles.slotRow}>
                    {/* Heure */}
                    <View style={styles.timeCol}>
                      <Text style={styles.timeStart}>{slot.start_time.slice(0, 5)}</Text>
                      <View style={styles.timeLine} />
                      <Text style={styles.timeEnd}>{slot.end_time.slice(0, 5)}</Text>
                    </View>

                    {/* Carte cours */}
                    <View style={[
                      styles.slotCard,
                      { backgroundColor: col.bg, borderLeftColor: col.border },
                    ]}>
                      <Text style={[styles.slotName, { color: col.text }]} numberOfLines={2}>
                        {course?.name ?? '—'}
                      </Text>
                      <Text style={[styles.slotCode, { color: col.border }]}>
                        {course?.code}
                      </Text>
                      {profile && (
                        <Text style={styles.slotTeacher}>
                          Prof. {profile.last_name} {profile.first_name}
                        </Text>
                      )}
                      {slot.room && (
                        <Text style={styles.slotRoom}>📍 {slot.room}</Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          {/* Résumé de la semaine */}
          <View style={styles.weekSummary}>
            <Text style={styles.weekTitle}>Semaine complète</Text>
            <View style={styles.weekGrid}>
              {DAYS.map((day, idx) => {
                const count = slots.filter(s => s.day_of_week === idx).length
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.weekDay, selectedDay === idx && styles.weekDayActive]}
                    onPress={() => setSelectedDay(idx)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.weekDayName, selectedDay === idx && styles.weekDayNameActive]}>
                      {day}
                    </Text>
                    <Text style={[styles.weekDayCount, selectedDay === idx && styles.weekDayCountActive]}>
                      {count > 0 ? `${count} cours` : '—'}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingTop:        56,
    paddingHorizontal: spacing.xl,
    paddingBottom:     spacing.md,
    backgroundColor:   colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...typography['2xl'], fontWeight: '800', color: colors.text, marginBottom: spacing.md },

  daySelector: {
    flexDirection: 'row',
    gap:           spacing.xs,
  },
  dayBtn: {
    flex:            1,
    paddingVertical: spacing.sm,
    alignItems:      'center',
    borderRadius:    radius.md,
    backgroundColor: colors.background,
    position:        'relative',
  },
  dayBtnActive: {
    backgroundColor: colors.primary,
  },
  dayBtnToday: {
    borderWidth:   1,
    borderColor:   colors.primary,
  },
  dayBtnText:       { ...typography.sm, fontWeight: '600', color: colors.textSecond },
  dayBtnTextActive: { color: '#fff', fontWeight: '700' },
  todayDot: {
    width:           5,
    height:          5,
    borderRadius:    radius.full,
    backgroundColor: colors.primary,
    marginTop:       2,
  },
  todayDotActive: { backgroundColor: '#fff' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },

  content: { padding: spacing.xl, paddingBottom: 32 },

  dayTitle: {
    ...typography.lg,
    fontWeight:   '700',
    color:        colors.text,
    marginBottom: spacing.lg,
  },

  emptyDay: {
    alignItems:   'center',
    paddingTop:   40,
    paddingBottom: 20,
  },
  emptyEmoji:    { fontSize: 48, marginBottom: spacing.md },
  emptyTitle:    { ...typography.lg, fontWeight: '700', color: colors.text },
  emptySubtitle: { ...typography.base, color: colors.textMuted, marginTop: spacing.xs },

  timeline: { gap: spacing.md },

  slotRow: {
    flexDirection: 'row',
    gap:           spacing.md,
    alignItems:    'stretch',
  },

  timeCol: {
    width:      52,
    alignItems: 'center',
    paddingTop: 4,
  },
  timeStart: { ...typography.xs, fontWeight: '700', color: colors.textSecond },
  timeLine:  {
    flex:            1,
    width:           1,
    backgroundColor: colors.border,
    marginVertical:  4,
    minHeight:       20,
  },
  timeEnd: { ...typography.xs, color: colors.textMuted },

  slotCard: {
    flex:            1,
    borderRadius:    radius.md,
    borderLeftWidth: 4,
    padding:         spacing.md,
    gap:             3,
  },
  slotName:    { ...typography.base, fontWeight: '700', lineHeight: 20 },
  slotCode:    { ...typography.sm, fontWeight: '600' },
  slotTeacher: { ...typography.sm, color: colors.textSecond },
  slotRoom:    { ...typography.xs, color: colors.textMuted, marginTop: 2 },

  weekSummary: {
    marginTop:       spacing['3xl'],
    backgroundColor: colors.card,
    borderRadius:    radius.lg,
    padding:         spacing.lg,
    ...shadow.sm,
  },
  weekTitle: {
    ...typography.base,
    fontWeight:   '700',
    color:        colors.text,
    marginBottom: spacing.md,
  },
  weekGrid: { flexDirection: 'row', gap: spacing.xs },
  weekDay: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: spacing.sm,
    borderRadius:    radius.sm,
    backgroundColor: colors.background,
  },
  weekDayActive: { backgroundColor: colors.primaryBg },
  weekDayName:       { ...typography.xs, fontWeight: '700', color: colors.textSecond },
  weekDayNameActive: { color: colors.primary },
  weekDayCount:       { ...typography.xs, color: colors.textMuted, marginTop: 2 },
  weekDayCountActive: { color: colors.primary, fontWeight: '600' },
})

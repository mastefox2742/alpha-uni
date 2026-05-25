import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, RefreshControl, TouchableOpacity,
  Linking,
} from 'react-native'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

type ElearningCourse = {
  id:              string
  is_published:    boolean
  welcome_message: string | null
  thumbnail_url:   string | null
  courses: {
    name: string; code: string; cfu: number; year: number; semester: number
    teachers?: { profiles?: { first_name: string; last_name: string } }
  }
  elearning_sections: { count: number }[]
  elearning_materials: { count: number }[]
}

export default function CoursesScreen() {
  const [courses, setCourses]   = useState<ElearningCourse[]>([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadData() {
    try {
      const data = await apiFetch<ElearningCourse[]>('/api/elearning/student/courses')
      setCourses(data ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const renderItem = ({ item }: { item: ElearningCourse }) => {
    const course    = item.courses as any
    const teacher   = course?.teachers as any
    const profile   = teacher?.profiles as any
    const sections  = (item.elearning_sections as any[]) ?? []
    const materials = (item.elearning_materials as any[]) ?? []

    return (
      <View style={styles.card}>
        {/* Icône */}
        <View style={styles.courseIcon}>
          <Text style={styles.courseEmoji}>📚</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.courseName} numberOfLines={2}>{course?.name}</Text>
          <Text style={styles.courseCode}>
            {course?.code} • {course?.cfu} CFU • Sem. {course?.semester}
          </Text>
          {profile && (
            <Text style={styles.teacher}>
              Prof. {profile.last_name} {profile.first_name}
            </Text>
          )}

          <View style={styles.stats}>
            <Text style={styles.stat}>📂 {sections.length} section(s)</Text>
            <Text style={styles.stat}>📎 {materials.length} matériaux</Text>
          </View>

          {item.welcome_message && (
            <Text style={styles.welcome} numberOfLines={2}>
              {item.welcome_message}
            </Text>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🖥 Cours en ligne</Text>
        <Text style={styles.subtitle}>Accédez à vos cours via le portail web</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <>
          {/* Bannière d'info */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💡 Pour accéder aux vidéos, quiz et forum, ouvrez le portail web UniGest dans votre navigateur.
            </Text>
          </View>

          <FlatList
            data={courses}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadData() }}
                colors={['#6366f1']}
              />
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>Aucun cours disponible.</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header:    { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  title:     { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle:  { fontSize: 13, color: '#9ca3af', marginTop: 3 },

  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 14 },

  infoBanner: {
    marginHorizontal: 16,
    marginBottom:     8,
    backgroundColor:  '#eff6ff',
    borderWidth:      1,
    borderColor:      '#bfdbfe',
    borderRadius:     12,
    padding:          12,
  },
  infoBannerText: { fontSize: 12, color: '#1e40af', lineHeight: 17 },

  list: { padding: 16, gap: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    flexDirection:   'row',
    gap:             14,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.06,
    shadowRadius:    4,
    elevation:       2,
  },
  courseIcon: {
    width:           52,
    height:          52,
    borderRadius:    14,
    backgroundColor: '#ede9fe',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  courseEmoji: { fontSize: 26 },
  cardContent: { flex: 1, gap: 3 },

  courseName: { fontSize: 14, fontWeight: '700', color: '#111827', lineHeight: 20 },
  courseCode: { fontSize: 12, color: '#6b7280' },
  teacher:    { fontSize: 12, color: '#6366f1' },

  stats: { flexDirection: 'row', gap: 10, marginTop: 4 },
  stat:  { fontSize: 11, color: '#9ca3af' },

  welcome: { fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 4, lineHeight: 16 },
})

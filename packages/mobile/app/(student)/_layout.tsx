import { Tabs } from 'expo-router'
import { StyleSheet, View, Text } from 'react-native'

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  )
}

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:     false,
        tabBarStyle:     styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Accueil" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="libretto"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Libretto" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🖥" label="Cours" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" label="Examens" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💶" label="Frais" focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth:  1,
    borderTopColor:  '#f3f4f6',
    height:          72,
    paddingBottom:   12,
    paddingTop:      8,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: -2 },
    shadowOpacity:   0.06,
    shadowRadius:    8,
    elevation:       8,
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabEmojiFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  tabLabelFocused: {
    color:      '#6366f1',
    fontWeight: '600',
  },
})

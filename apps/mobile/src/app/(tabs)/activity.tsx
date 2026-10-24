import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useStore } from '@/store'
import { colors } from '@/theme'
import { Card } from '@/components/ui'

export default function Activity() {
  const { activity } = useStore()

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>Activity</Text>
        <Text style={styles.sub}>Milestones and diary updates from the people you follow.</Text>
        {activity.map((a) => (
          <Pressable key={a.id} onPress={() => a.personId && router.push(`/person/${a.personId}`)}>
            <Card style={styles.item}>
              <View style={styles.icon}><Text style={{ fontSize: 22 }}>{a.icon}</Text></View>
              <View style={{ flex: 1 }}>
                <View style={styles.between}>
                  <Text style={styles.title}>{a.title}</Text>
                  <Text style={styles.when}>{a.when}</Text>
                </View>
                <Text style={styles.body}>{a.body}</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 12 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  sub: { fontSize: 14, color: colors.muted, marginBottom: 6 },
  item: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  when: { fontSize: 12, color: colors.muted },
  body: { fontSize: 14, color: '#334155', lineHeight: 20, marginTop: 2 },
})

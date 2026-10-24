import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'
import { useStore } from '@/store'
import { colors } from '@/theme'
import { Avatar, Card, ProgressBar, SectionTitle } from '@/components/ui'

export default function Circle() {
  const { people, supporting } = useStore()
  const mine = people.filter((p) => supporting.includes(p.id))

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>My Circle</Text>

        {mine.length === 0 ? (
          <Card style={styles.empty}>
            <Text style={{ fontSize: 44 }}>🤝</Text>
            <Text style={styles.emptyTitle}>You&apos;re not in a circle yet</Text>
            <Text style={styles.meta}>Pick someone to support and follow their journey here.</Text>
            <Pressable style={styles.cta} onPress={() => router.navigate('/discover')}>
              <Text style={styles.ctaText}>Discover people</Text>
            </Pressable>
          </Card>
        ) : (
          <>
            <Card style={styles.summary}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sumN}>${mine.length * 30}</Text>
                <Text style={styles.sumL}>you give / month</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sumN}>{mine.length}</Text>
                <Text style={styles.sumL}>{mine.length === 1 ? 'person supported' : 'people supported'}</Text>
              </View>
            </Card>

            <SectionTitle>Supporting</SectionTitle>
            {mine.map((p) => {
              const done = p.milestones.filter((m) => m.completed).length
              const next = p.milestones.find((m) => !m.completed)
              return (
                <Link key={p.id} href={`/person/${p.id}`} asChild>
                  <Pressable>
                    <Card style={{ gap: 12 }}>
                      <View style={styles.row}>
                        <Avatar person={p} size={48} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.name}>{p.name}</Text>
                          <Text style={styles.meta}>{done} of {p.milestones.length} milestones</Text>
                        </View>
                      </View>
                      <ProgressBar value={(done / p.milestones.length) * 100} color="#14b8a6" />
                      {next && <Text style={styles.next}>Next up: {next.title}</Text>}
                    </Card>
                  </Pressable>
                </Link>
              )
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  cta: { backgroundColor: colors.primary, borderRadius: 99, paddingVertical: 13, paddingHorizontal: 24, marginTop: 8 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  summary: { flexDirection: 'row', backgroundColor: colors.primaryDark },
  sumN: { color: '#fff', fontSize: 26, fontWeight: '800' },
  sumL: { color: '#a7f3d0', fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  next: { fontSize: 13, color: colors.primaryDark, fontWeight: '600' },
})

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { useStore } from '@/store'
import { colors } from '@/theme'
import { MAX_SUPPORTERS, budget } from '@/data'
import { Avatar, Card, ExampleTag, ProgressBar, SectionTitle } from '@/components/ui'

export default function Discover() {
  const { people } = useStore()
  const open = people.filter((p) => p.supporters < MAX_SUPPORTERS)
  const totalDonors = people.reduce((sum, p) => sum + p.supporters, 0)

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.hello}>Good morning 👋</Text>
        <Text style={styles.h1}>Who will you{'\n'}help rebuild?</Text>

        <Card style={styles.impact}>
          <View style={{ flex: 1 }}>
            <Text style={styles.impactN}>{totalDonors}</Text>
            <Text style={styles.impactL}>neighbours giving{'\n'}this month</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.impactN}>${(totalDonors * 30).toLocaleString()}</Text>
            <Text style={styles.impactL}>raised every{'\n'}month</Text>
          </View>
        </Card>

        <SectionTitle>Needs support · {open.length}</SectionTitle>
        {people.map((p) => {
          const full = p.supporters >= MAX_SUPPORTERS
          return (
            <Link key={p.id} href={`/person/${p.id}`} asChild>
              <Pressable style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
                <Card style={styles.person}>
                  <View style={styles.row}>
                    <Avatar person={p} size={52} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{p.name}, {p.age}</Text>
                      <Text style={styles.meta}>{p.neighbourhood}</Text>
                    </View>
                    <Text style={[styles.badge, full && styles.badgeFull]}>
                      {full ? 'Funded' : `${MAX_SUPPORTERS - p.supporters} left`}
                    </Text>
                  </View>
                  <Text style={styles.headline}>{p.headline}</Text>
                  <ProgressBar value={p.supporters} />
                  <View style={[styles.row, { marginTop: 8, justifyContent: 'space-between' }]}>
                    <ExampleTag />
                    <Text style={styles.meta}>{p.supporters}/100 supporters</Text>
                  </View>
                </Card>
              </Pressable>
            </Link>
          )
        })}

        <SectionTitle>Where $3,000 goes</SectionTitle>
        <Card>
          <View style={styles.bar}>
            {budget.map((b) => (
              <View key={b.label} style={{ flex: b.amount, backgroundColor: b.color }} />
            ))}
          </View>
          {budget.map((b) => (
            <View key={b.label} style={styles.budgetRow}>
              <View style={[styles.swatch, { backgroundColor: b.color }]} />
              <Text style={styles.budgetLabel}>{b.label}</Text>
              <Text style={styles.budgetAmt}>${b.amount.toLocaleString()}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40, gap: 14 },
  hello: { color: colors.muted, fontSize: 15 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.8, lineHeight: 36, marginBottom: 4 },
  impact: { flexDirection: 'row', backgroundColor: colors.primaryDark, marginBottom: 8 },
  impactN: { color: '#fff', fontSize: 26, fontWeight: '800' },
  impactL: { color: '#a7f3d0', fontSize: 12, marginTop: 2 },
  person: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.muted },
  headline: { fontSize: 15, color: colors.text },
  badge: { fontSize: 12, fontWeight: '700', color: colors.primary, backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, overflow: 'hidden' },
  badgeFull: { color: colors.muted, backgroundColor: colors.faint },
  bar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  budgetLabel: { flex: 1, fontSize: 14, color: colors.text },
  budgetAmt: { fontSize: 14, fontWeight: '700', color: colors.text },
})

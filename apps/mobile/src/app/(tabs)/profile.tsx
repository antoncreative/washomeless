import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useStore } from '@/store'
import { colors } from '@/theme'
import { Card } from '@/components/ui'
import { WEBSITE_URL } from '@/data'

const rows: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }[] = [
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'card-outline', label: 'Payment methods' },
  { icon: 'receipt-outline', label: 'Tax receipts' },
  { icon: 'help-circle-outline', label: 'How Washomeless works' },
]

export default function Profile() {
  const { supporting } = useStore()

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>Profile</Text>

        <Card style={styles.me}>
          <View style={styles.avatar}><Text style={styles.avatarText}>Y</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>You</Text>
            <Text style={styles.meta}>Toronto · Supporter</Text>
          </View>
        </Card>

        <View style={styles.stats}>
          <Card style={styles.stat}>
            <Text style={styles.statN}>{supporting.length}</Text>
            <Text style={styles.meta}>circles</Text>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statN}>${supporting.length * 30}</Text>
            <Text style={styles.meta}>given</Text>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statN}>{supporting.length > 0 ? '🌱' : '—'}</Text>
            <Text style={styles.meta}>impact</Text>
          </Card>
        </View>

        <Card style={{ paddingVertical: 4 }}>
          {rows.map((r, i) => (
            <View key={r.label} style={[styles.row, i < rows.length - 1 && styles.divider]}>
              <Ionicons name={r.icon} size={20} color={colors.primary} />
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </View>
          ))}
        </Card>

        <Pressable onPress={() => Linking.openURL(WEBSITE_URL)}>
          <Text style={styles.link}>Visit washomeless.com →</Text>
        </Pressable>
        <Text style={styles.version}>Washomeless demo · v1.0 · Toronto</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.8 },
  me: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.muted },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statN: { fontSize: 22, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.faint },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text },
  link: { color: colors.primary, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  version: { color: '#94a3b8', fontSize: 12, textAlign: 'center' },
})

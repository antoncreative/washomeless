import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { useAuth } from '@/auth'
import { useStore } from '@/store'
import { colors } from '@/theme'
import { UPDATES_PER_WEEK } from '@/data'
import { Avatar, Card, ProgressBar, SectionTitle } from '@/components/ui'
import { UpdateMedia } from '@/components/media'

function startOfWeek() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // Monday
  return d.getTime()
}

// The sponsored person's own space: weekly goal, posting, and their updates.
export default function Journey() {
  const { person: me } = useAuth()
  const { people, refreshing, refresh } = useStore()
  const person = people.find((p) => p.id === me?.id)

  if (!me) return null

  const updates = person?.updates ?? []
  const thisWeek = updates.filter((u) => u.createdAt && new Date(u.createdAt).getTime() >= startOfWeek()).length
  const done = thisWeek >= UPDATES_PER_WEEK
  const first = me.name.split(' ')[0]

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      >
        <Text style={styles.hello}>Hi {first} 👋</Text>
        <Text style={styles.h1}>My Journey</Text>

        <Card style={[styles.goal, done && styles.goalDone]}>
          <View style={styles.between}>
            <Text style={[styles.goalTitle, done && { color: '#fff' }]}>This week</Text>
            <Text style={[styles.goalCount, done && { color: '#fff' }]}>{thisWeek} / {UPDATES_PER_WEEK}</Text>
          </View>
          <View style={styles.goalBars}>
            {Array.from({ length: UPDATES_PER_WEEK }, (_, i) => (
              <View key={i} style={[styles.goalBar, i < thisWeek && (done ? styles.goalBarDoneFill : styles.goalBarFill)]} />
            ))}
          </View>
          <Text style={[styles.goalText, done && { color: '#d1fae5' }]}>
            {done
              ? 'Done for this week 🎉 Your supporters love hearing from you.'
              : 'A quick voice note, photo or a few words all count.'}
          </Text>
        </Card>

        <Pressable
          style={({ pressed }) => [styles.post, pressed && { transform: [{ scale: 0.98 }] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            router.push('/post')
          }}
        >
          <View style={styles.postIcon}><Ionicons name="add" size={28} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.postTitle}>Post an update</Text>
            <Text style={styles.postSub}>Voice · Photo · Text</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </Pressable>

        <Card style={{ gap: 10 }}>
          <View style={styles.row}>
            {person && <Avatar person={person} size={44} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{me.current_supporters} of {me.max_supporters} supporters</Text>
              <Text style={styles.meta}>${(me.current_supporters * 30).toLocaleString()} of $3,000 / month</Text>
            </View>
          </View>
          <ProgressBar value={(me.current_supporters / me.max_supporters) * 100} />
        </Card>

        <SectionTitle>My updates · {updates.length}</SectionTitle>
        {updates.length === 0 && <Text style={styles.meta}>No updates yet — post your first one above.</Text>}
        {updates.map((u, i) => (
          <Card key={`${u.title}-${i}`} style={{ gap: 8 }}>
            <View style={styles.between}>
              <Text style={styles.updateTitle}>{u.title}</Text>
              <Text style={styles.meta}>{u.when}</Text>
            </View>
            <UpdateMedia kind={u.kind} imageUrl={u.imageUrl} audioUrl={u.audioUrl} accent={person?.colors} />
            {!!u.content && <Text style={styles.body}>{u.content}</Text>}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  hello: { color: colors.muted, fontSize: 15 },
  h1: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.8, marginBottom: 4 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goal: { gap: 10 },
  goalDone: { backgroundColor: colors.primary },
  goalTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  goalCount: { fontSize: 22, fontWeight: '800', color: colors.primary },
  goalBars: { flexDirection: 'row', gap: 6 },
  goalBar: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.faint },
  goalBarFill: { backgroundColor: colors.primary },
  goalBarDoneFill: { backgroundColor: '#fff' },
  goalText: { fontSize: 13, color: colors.muted },
  post: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.primaryDark, borderRadius: 22, padding: 16 },
  postIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  postTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  postSub: { color: '#a7f3d0', fontSize: 13, marginTop: 2 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.muted },
  updateTitle: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  body: { fontSize: 15, lineHeight: 22, color: '#334155' },
})

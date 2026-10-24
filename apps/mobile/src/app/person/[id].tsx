import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useStore } from '@/store'
import { colors } from '@/theme'
import { MAX_SUPPORTERS, UPDATES_PER_WEEK } from '@/data'
import { Avatar, Card, DonorDots, ExampleTag, SectionTitle } from '@/components/ui'
import { UpdateMedia } from '@/components/media'

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { people, isSupporting } = useStore()
  const person = people.find((p) => p.id === id)

  if (!person) return <Text style={{ padding: 40 }}>Not found</Text>

  const supporting = isSupporting(person.id)
  const full = person.supporters >= MAX_SUPPORTERS

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <LinearGradient colors={[person.colors[0] + '55', colors.bg]} style={styles.header}>
          <SafeAreaView edges={['top']} style={{ alignItems: 'center', paddingTop: 40 }}>
            <Avatar person={person} size={96} />
            <Text style={styles.name}>{person.name}</Text>
            <Text style={styles.meta}>{person.age ? `${person.age} · ` : ''}{person.neighbourhood}, Toronto</Text>
            {person.isExample && <View style={{ marginTop: 8 }}><ExampleTag /></View>}
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.body}>
          <Card style={{ gap: 14 }}>
            <View style={styles.between}>
              <Text style={styles.big}>{person.supporters}<Text style={styles.of}>/100</Text></Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.big}>${(person.supporters * 30).toLocaleString()}</Text>
                <Text style={styles.meta}>of $3,000 / month</Text>
              </View>
            </View>
            <DonorDots filled={person.supporters} highlight={supporting ? person.supporters - 1 : undefined} />
            {supporting && <Text style={styles.you}>● The dark dot is you</Text>}
          </Card>

          <SectionTitle>My story</SectionTitle>
          <Text style={styles.story}>{person.story}</Text>

          <SectionTitle>Journey</SectionTitle>
          <Card style={{ gap: 0 }}>
            {person.milestones.map((m, i) => (
              <View key={m.title} style={styles.step}>
                <View style={{ alignItems: 'center' }}>
                  <View style={[styles.stepDot, m.completed && styles.stepDone]}>
                    {m.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  {i < person.milestones.length - 1 && <View style={[styles.stepLine, m.completed && { backgroundColor: colors.primary }]} />}
                </View>
                <View style={{ flex: 1, paddingBottom: 16 }}>
                  <Text style={[styles.stepTitle, m.completed && { color: colors.primary }]}>{m.title}</Text>
                  <Text style={styles.meta}>{m.completed ? `Done · ${m.when}` : m.description}</Text>
                </View>
              </View>
            ))}
          </Card>

          <SectionTitle>Diary · posts {UPDATES_PER_WEEK}× a week</SectionTitle>
          {person.updates.length === 0 && !person.locked?.length && <Text style={styles.meta}>No updates yet.</Text>}
          {!!person.locked?.length && (
            <View style={styles.lockBanner}>
              <Ionicons name="lock-closed" size={16} color={colors.primaryDark} />
              <Text style={styles.lockBannerText}>
                {person.name.split(' ')[0]}&apos;s voice notes, photos and diary are shared only with their circle.
              </Text>
            </View>
          )}
          {person.updates.map((u, i) => (
            <Card key={`${u.title}-${i}`} style={{ gap: 8 }}>
              <View style={styles.between}>
                <Text style={styles.stepTitle}>{u.title}</Text>
                <Text style={styles.meta}>{u.when}</Text>
              </View>
              <UpdateMedia kind={u.kind} imageUrl={u.imageUrl} audioUrl={u.audioUrl} accent={person.colors} />
              {!!u.content && <Text style={styles.story}>
                {u.kind === 'voice' && !u.audioUrl && <Text style={styles.meta}>Transcript: </Text>}
                {u.content}
              </Text>}
            </Card>
          ))}
          {person.locked?.map((t) => (
            <Card key={t.id} style={{ gap: 8 }}>
              <View style={styles.between}>
                <Text style={styles.stepTitle}>{t.title}</Text>
                <Text style={styles.meta}>{t.when}</Text>
              </View>
              <View style={styles.locked}>
                <Ionicons name={t.kind === 'voice' ? 'mic' : t.kind === 'photo' ? 'image' : 'document-text'} size={18} color={colors.muted} />
                <Text style={styles.lockedText}>
                  {t.kind === 'voice' ? 'Voice note' : t.kind === 'photo' ? 'Photo' : 'Diary entry'} · for supporters only
                </Text>
                <Ionicons name="lock-closed" size={16} color={colors.muted} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {supporting ? (
          <View style={[styles.cta, styles.ctaDone]}>
            <Ionicons name="heart" size={18} color={colors.primary} />
            <Text style={[styles.ctaText, { color: colors.primary }]}>You&apos;re in {person.name.split(' ')[0]}&apos;s circle</Text>
          </View>
        ) : full ? (
          <View style={[styles.cta, styles.ctaDone]}>
            <Text style={[styles.ctaText, { color: colors.muted }]}>Fully funded 🎉</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
            onPress={() => router.push(`/support/${person.id}`)}
          >
            <Text style={styles.ctaText}>Join the circle · $30/mo</Text>
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { paddingBottom: 20 },
  name: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 12 },
  meta: { fontSize: 13, color: colors.muted },
  body: { paddingHorizontal: 20, gap: 14 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  big: { fontSize: 26, fontWeight: '800', color: colors.text },
  of: { fontSize: 16, color: colors.muted, fontWeight: '600' },
  you: { fontSize: 12, color: colors.primaryDark, fontWeight: '600' },
  story: { fontSize: 15, lineHeight: 22, color: '#334155' },
  step: { flexDirection: 'row', gap: 12 },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.faint, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: colors.primary },
  stepLine: { width: 2, flex: 1, backgroundColor: colors.faint, marginVertical: 2 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  lockBanner: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 14, padding: 12 },
  lockBannerText: { flex: 1, fontSize: 13, color: colors.primaryDark, lineHeight: 18 },
  locked: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14 },
  lockedText: { flex: 1, fontSize: 14, color: colors.muted },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, backgroundColor: 'rgba(246,247,245,0.96)' },
  cta: { backgroundColor: colors.primary, borderRadius: 99, paddingVertical: 17, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  ctaDone: { backgroundColor: colors.primarySoft },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
})

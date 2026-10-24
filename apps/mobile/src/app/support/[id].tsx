import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { useStore } from '@/store'
import { colors } from '@/theme'
import { Avatar } from '@/components/ui'

type Stage = 'confirm' | 'paying' | 'done'

// Demo checkout sheet. No real payment happens here — the production app
// will hand off to Stripe (Apple Pay) exactly like the website does.
export default function SupportSheet() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { people, support } = useStore()
  const person = people.find((p) => p.id === id)
  const [stage, setStage] = useState<Stage>('confirm')
  const pop = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (stage !== 'done') return
    Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }).start()
  }, [stage, pop])

  if (!person) return null
  const first = person.name.split(' ')[0]

  function pay() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setStage('paying')
    setTimeout(() => {
      support(person!.id)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setStage('done')
    }, 1400)
  }

  if (stage === 'done') {
    return (
      <View style={[styles.sheet, { alignItems: 'center', justifyContent: 'center' }]}>
        <Animated.View style={[styles.check, { transform: [{ scale: pop }] }]}>
          <Ionicons name="heart" size={44} color="#fff" />
        </Animated.View>
        <Text style={styles.title}>Welcome to {first}&apos;s circle</Text>
        <Text style={[styles.sub, { textAlign: 'center' }]}>
          You&apos;re supporter #{person.supporters}. You&apos;ll get a notification every time {first} reaches a milestone.
        </Text>
        <Pressable style={styles.pay} onPress={() => router.back()}>
          <Text style={styles.payText}>See {first}&apos;s journey</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.sheet}>
      <View style={styles.row}>
        <Avatar person={person} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Support {first}</Text>
          <Text style={styles.sub}>{person.headline}</Text>
        </View>
      </View>

      <View style={styles.box}>
        {[
          ['Monthly gift', '$30.00'],
          ['Program length', '12 months'],
          ['Your circle', `${person.supporters} of 100`],
          ['Cancel', 'Anytime'],
        ].map(([k, v]) => (
          <View key={k} style={styles.line}>
            <Text style={styles.k}>{k}</Text>
            <Text style={styles.v}>{v}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.impact}>
        💚 Your $30 + 99 others = a safe room, food, counselling and job training for {first} this month.
      </Text>

      <Pressable style={[styles.pay, styles.applePay]} onPress={pay} disabled={stage === 'paying'}>
        {stage === 'paying' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="logo-apple" size={20} color="#fff" />
            <Text style={styles.payText}>Pay · $30/month</Text>
          </>
        )}
      </Pressable>
      <Text style={styles.demo}>Demo mode — no real payment is made</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  sheet: { flex: 1, padding: 24, paddingTop: 32, gap: 18, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  box: { backgroundColor: colors.bg, borderRadius: 18, padding: 16, gap: 10 },
  line: { flexDirection: 'row', justifyContent: 'space-between' },
  k: { fontSize: 15, color: colors.muted },
  v: { fontSize: 15, fontWeight: '700', color: colors.text },
  impact: { fontSize: 14, lineHeight: 20, color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 14, borderRadius: 14, overflow: 'hidden' },
  pay: { backgroundColor: colors.primary, borderRadius: 99, paddingVertical: 17, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, alignSelf: 'stretch' },
  applePay: { backgroundColor: '#000' },
  payText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  demo: { textAlign: 'center', fontSize: 12, color: colors.muted },
  check: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
})

import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useStore } from '@/store'

// Welcome screen — the first thing the audience sees.
export default function Welcome() {
  const { isLive } = useStore()

  return (
    <LinearGradient colors={['#022c22', '#065f46', '#0f766e']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.brand}>Washomeless</Text>
          <Text style={styles.pill}>📍 Toronto</Text>
        </View>

        <View>
          <Text style={styles.h1}>100 people.{'\n'}$30 a month.</Text>
          <Text style={[styles.h1, styles.accent]}>One life rebuilt.</Text>
          <Text style={styles.sub}>
            Join a circle of 100 neighbours funding one person&apos;s 12-month journey from shelter to a home and a job — and watch it happen.
          </Text>

          <View style={styles.stats}>
            {[
              ['$3,000', 'per month'],
              ['100', 'donors'],
              ['12', 'months'],
            ].map(([n, l]) => (
              <View key={l} style={styles.stat}>
                <Text style={styles.statN}>{n}</Text>
                <Text style={styles.statL}>{l}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.replace('/discover')
            }}
          >
            <Text style={styles.ctaText}>Get started</Text>
          </Pressable>
          <Text style={styles.note}>{isLive ? '● Live from washomeless.com' : 'Demo · example profiles'}</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  logo: { width: 40, height: 40, borderRadius: 20 },
  brand: { color: '#fff', fontSize: 20, fontWeight: '700', flex: 1 },
  pill: { color: '#d1fae5', fontSize: 12, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, overflow: 'hidden' },
  h1: { color: '#fff', fontSize: 42, fontWeight: '800', lineHeight: 46, letterSpacing: -1 },
  accent: { color: '#6ee7b7', marginBottom: 16 },
  sub: { color: 'rgba(236,253,245,0.85)', fontSize: 16, lineHeight: 23, marginBottom: 24 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  statN: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statL: { color: '#a7f3d0', fontSize: 12, marginTop: 2 },
  cta: { backgroundColor: '#fff', borderRadius: 99, paddingVertical: 17, alignItems: 'center' },
  ctaText: { color: '#064e3b', fontSize: 17, fontWeight: '700' },
  note: { color: 'rgba(209,250,229,0.6)', fontSize: 12, textAlign: 'center', marginTop: 12 },
})

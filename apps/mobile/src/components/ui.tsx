import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, radius, shadow } from '@/theme'
import { MAX_SUPPORTERS, type Person } from '@/data'

export function Avatar({ person, size = 48 }: { person: Person; size?: number }) {
  return (
    <LinearGradient
      colors={person.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.42 }}>{person.name.charAt(0)}</Text>
    </LinearGradient>
  )
}

export function ProgressBar({ value, height = 8, color = colors.primary }: { value: number; height?: number; color?: string }) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 700, useNativeDriver: false }).start()
  }, [anim, value])

  return (
    <View style={{ height, borderRadius: height, backgroundColor: colors.faint, overflow: 'hidden' }}>
      <Animated.View
        style={{
          height,
          borderRadius: height,
          backgroundColor: color,
          width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  )
}

// 100 dots — one per $30/month donor. `highlight` marks the viewer's own dot.
export function DonorDots({ filled, highlight }: { filled: number; highlight?: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: MAX_SUPPORTERS / 10 }, (_, row) => (
        <View key={row} style={styles.dotRow}>
          {Array.from({ length: 10 }, (_, col) => {
            const i = row * 10 + col
            return (
              <View
                key={i}
                style={[styles.dot, i < filled && styles.dotFilled, highlight === i && styles.dotMine]}
              />
            )
          })}
        </View>
      ))}
    </View>
  )
}

// Static waveform for example voice notes (no audio file behind them).
export function VoiceNote() {
  return (
    <View style={styles.voice}>
      <View style={styles.voiceIcon}><Text style={{ color: '#fff', fontSize: 14 }}>🎙</Text></View>
      <View style={styles.wave}>
        {Array.from({ length: 28 }, (_, i) => (
          <View key={i} style={[styles.bar, { height: `${30 + Math.abs(Math.sin(i * 1.7)) * 70}%` }]} />
        ))}
      </View>
      <Text style={styles.voiceLabel}>0:42</Text>
    </View>
  )
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function ExampleTag() {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>EXAMPLE PROFILE</Text>
    </View>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.section}>{children}</Text>
}

const styles = StyleSheet.create({
  dots: { gap: 6 },
  dotRow: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, aspectRatio: 1, borderRadius: '50%', backgroundColor: colors.faint },
  dotFilled: { backgroundColor: '#6ee7b7' },
  dotMine: { backgroundColor: colors.primaryDark, transform: [{ scale: 1.25 }] },
  voice: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primarySoft, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 8 },
  voiceIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  wave: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 22 },
  bar: { flex: 1, borderRadius: 2, backgroundColor: '#34d399' },
  voiceLabel: { fontSize: 12, color: colors.primaryDark, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, ...shadow },
  tag: { alignSelf: 'flex-start', backgroundColor: colors.amberSoft, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { color: colors.amber, fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  section: { fontSize: 13, fontWeight: '700', color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
})

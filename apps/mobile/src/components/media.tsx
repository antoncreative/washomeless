import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { colors } from '@/theme'
import { VoiceNote } from './ui'

const BARS = 38
const RATES = [1, 1.5, 2]

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// iPhones can't decode WebM, which older web recordings use.
const playableOnIOS = (url: string) => !/\.webm(\?|$)/i.test(url)

// A stable, natural-looking waveform for each recording (seeded from its URL).
function waveform(seed: string) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  return Array.from({ length: BARS }, (_, i) => {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0
    const noise = (h % 1000) / 1000
    const envelope = Math.sin((Math.PI * (i + 1)) / (BARS + 1)) // quieter at the edges
    return 0.18 + 0.82 * (0.35 * envelope + 0.65 * noise * (0.4 + 0.6 * envelope))
  })
}

export function VoicePlayer({ url, accent = ['#059669', '#0d9488'] }: { url: string; accent?: [string, string] }) {
  const player = useAudioPlayer(url, { updateInterval: 80 })
  const status = useAudioPlayerStatus(player)
  const bars = useMemo(() => waveform(url), [url])
  const [rate, setRate] = useState(1)
  const [width, setWidth] = useState(0)
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true })
  }, [])

  // Rewind when it ends so the next tap plays from the start.
  useEffect(() => {
    if (status.didJustFinish) {
      player.pause()
      player.seekTo(0)
    }
  }, [status.didJustFinish, player])

  // Soft pulsing ring around the play button while audio is playing.
  useEffect(() => {
    if (!status.playing) {
      pulse.stopAnimation()
      pulse.setValue(0)
      return
    }
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true })
    )
    loop.start()
    return () => loop.stop()
  }, [status.playing, pulse])

  const duration = status.duration || 0
  const progress = duration > 0 ? Math.min(1, status.currentTime / duration) : 0
  const started = status.playing || status.currentTime > 0.05

  function toggle() {
    Haptics.selectionAsync()
    if (status.playing) return player.pause()
    player.play()
  }

  function seekTo(e: GestureResponderEvent) {
    if (!width || !duration) return
    const ratio = Math.max(0, Math.min(1, e.nativeEvent.locationX / width))
    player.seekTo(ratio * duration)
  }

  function cycleRate() {
    Haptics.selectionAsync()
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length]
    setRate(next)
    player.setPlaybackRate(next)
  }

  return (
    <LinearGradient colors={accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
            },
          ]}
        />
        <Pressable onPress={toggle} style={({ pressed }) => [styles.play, pressed && { transform: [{ scale: 0.92 }] }]} hitSlop={8}>
          <Ionicons
            name={status.playing ? 'pause' : 'play'}
            size={22}
            color={accent[1]}
            style={!status.playing && { marginLeft: 3 }}
          />
        </Pressable>
      </View>

      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={styles.wave}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={seekTo}
          onResponderMove={seekTo}
        >
          {bars.map((h, i) => {
            const played = (i + 0.5) / BARS <= progress
            return (
              <View
                key={i}
                pointerEvents="none"
                style={[styles.bar, { height: `${h * 100}%` }, played ? styles.barPlayed : styles.barIdle]}
              />
            )
          })}
        </View>
        <View style={styles.meta}>
          <Text style={styles.time}>
            {!status.isLoaded ? 'Loading…' : started ? `${fmt(status.currentTime)} / ${fmt(duration)}` : fmt(duration)}
          </Text>
          <Text style={styles.label}>🎙 Voice note</Text>
        </View>
      </View>

      <Pressable onPress={cycleRate} style={styles.rate} hitSlop={8}>
        <Text style={styles.rateText}>{rate}×</Text>
      </Pressable>
    </LinearGradient>
  )
}

export function UpdateMedia({
  kind,
  imageUrl,
  audioUrl,
  accent,
}: {
  kind: string
  imageUrl?: string | null
  audioUrl?: string | null
  accent?: [string, string]
}) {
  return (
    <>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.photo} resizeMode="cover" />}
      {audioUrl && playableOnIOS(audioUrl) && <VoicePlayer url={audioUrl} accent={accent} />}
      {audioUrl && !playableOnIOS(audioUrl) && (
        <Text style={styles.note}>🎙 Voice note — listen on washomeless.com</Text>
      )}
      {kind === 'voice' && !audioUrl && <VoiceNote />}
    </>
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 22, paddingVertical: 12, paddingLeft: 12, paddingRight: 10 },
  ring: { position: 'absolute', width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff' },
  play: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  wave: { height: 32, flexDirection: 'row', alignItems: 'center', gap: 2 },
  bar: { flex: 1, borderRadius: 2 },
  barPlayed: { backgroundColor: '#fff' },
  barIdle: { backgroundColor: 'rgba(255,255,255,0.38)' },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontSize: 12, color: '#fff', fontWeight: '700', fontVariant: ['tabular-nums'] },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  rate: { minWidth: 38, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center' },
  rateText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 14, backgroundColor: colors.faint },
  note: { fontSize: 13, color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 10, borderRadius: 12, overflow: 'hidden' },
})

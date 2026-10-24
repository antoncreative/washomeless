import { useEffect } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '@/theme'
import { VoiceNote } from './ui'

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// iPhones can't decode WebM, which older web recordings use.
const playableOnIOS = (url: string) => !/\.webm(\?|$)/i.test(url)

export function VoicePlayer({ url }: { url: string }) {
  const player = useAudioPlayer(url)
  const status = useAudioPlayerStatus(player)

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true })
  }, [])

  const finished = status.duration > 0 && status.currentTime >= status.duration - 0.1
  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0

  function toggle() {
    if (status.playing) return player.pause()
    if (finished) player.seekTo(0)
    player.play()
  }

  return (
    <View style={styles.voice}>
      <Pressable onPress={toggle} style={styles.play} hitSlop={8}>
        <Ionicons name={status.playing ? 'pause' : 'play'} size={16} color="#fff" />
      </Pressable>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.time}>
        {status.duration > 0 ? `${fmt(status.currentTime)} / ${fmt(status.duration)}` : '…'}
      </Text>
    </View>
  )
}

export function UpdateMedia({ kind, imageUrl, audioUrl }: { kind: string; imageUrl?: string | null; audioUrl?: string | null }) {
  return (
    <>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.photo} resizeMode="cover" />}
      {audioUrl && playableOnIOS(audioUrl) && <VoicePlayer url={audioUrl} />}
      {audioUrl && !playableOnIOS(audioUrl) && (
        <Text style={styles.note}>🎙 Voice note — listen on washomeless.com</Text>
      )}
      {kind === 'voice' && !audioUrl && <VoiceNote />}
    </>
  )
}

const styles = StyleSheet.create({
  voice: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primarySoft, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 8 },
  play: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#a7f3d0', overflow: 'hidden' },
  fill: { height: 4, backgroundColor: colors.primary },
  time: { fontSize: 12, color: colors.primaryDark, fontWeight: '600', minWidth: 70, textAlign: 'right' },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 14, backgroundColor: colors.faint },
  note: { fontSize: 13, color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 10, borderRadius: 12, overflow: 'hidden' },
})

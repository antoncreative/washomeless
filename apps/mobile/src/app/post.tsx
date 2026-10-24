import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import * as ImagePicker from 'expo-image-picker'
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio'
import { useAuth } from '@/auth'
import { useStore } from '@/store'
import { supabase, uploadMedia } from '@/supabase'
import { colors } from '@/theme'
import { VoicePlayer } from '@/components/media'

type Kind = 'text' | 'photo' | 'voice'

const MAX_RECORDING_MS = 120_000

const kinds: { id: Kind; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'voice', label: 'Voice', icon: 'mic' },
  { id: 'photo', label: 'Photo', icon: 'camera' },
  { id: 'text', label: 'Text', icon: 'create' },
]

const defaultTitles: Record<Kind, string> = { text: 'Update', photo: 'Photo update', voice: 'Voice note' }

const prompts = ['What went well this week?', 'What are you working on next?', 'Anything you’re proud of?']

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function Post() {
  const { session, person } = useAuth()
  const { refresh } = useStore()
  const [kind, setKind] = useState<Kind>('voice')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [recordingUri, setRecordingUri] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const recState = useAudioRecorderState(recorder, 100)
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!recState.isRecording) {
      pulse.stopAnimation()
      pulse.setValue(0)
      return
    }
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }))
    loop.start()
    return () => loop.stop()
  }, [recState.isRecording, pulse])

  useEffect(() => {
    if (recState.isRecording && recState.durationMillis >= MAX_RECORDING_MS) stopRecording()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recState.isRecording, recState.durationMillis])

  if (!session || !person || person.status !== 'active') {
    return (
      <View style={[styles.wrap, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.sub}>Only approved people can post updates.</Text>
      </View>
    )
  }

  async function startRecording() {
    const permission = await requestRecordingPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Microphone needed', 'Please allow microphone access in Settings to record a voice note.')
      return
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
    await recorder.prepareToRecordAsync()
    recorder.record()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  async function stopRecording() {
    await recorder.stop()
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setRecordingUri(recorder.uri)
  }

  async function pickPhoto(fromCamera: boolean) {
    if (fromCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) {
        Alert.alert('Camera needed', 'Please allow camera access in Settings to take a photo.')
        return
      }
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: 'images', quality: 0.7, allowsEditing: true }
    const result = fromCamera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options)
    if (!result.canceled) setPhoto(result.assets[0])
  }

  async function submit() {
    if (kind === 'text' && !content.trim()) return Alert.alert('Write a few words first.')
    if (kind === 'photo' && !photo) return Alert.alert('Choose a photo first.')
    if (kind === 'voice' && !recordingUri) return Alert.alert('Record a voice note first.')

    setPosting(true)
    try {
      const userId = session!.user.id
      let imageUrl: string | null = null
      let audioUrl: string | null = null

      if (kind === 'photo' && photo) {
        // Photos are re-encoded by the picker as JPEG.
        imageUrl = await uploadMedia(userId, photo.uri, photo.mimeType ?? 'image/jpeg', 'jpg')
      }
      if (kind === 'voice' && recordingUri) {
        audioUrl = await uploadMedia(userId, recordingUri, 'audio/mp4', 'm4a')
      }

      const { error } = await supabase.from('diary_updates').insert({
        person_id: person!.id,
        kind,
        title: title.trim() || defaultTitles[kind],
        content: content.trim(),
        image_url: imageUrl,
        audio_url: audioUrl,
      })
      if (error) throw error

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      await refresh()
      router.back()
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Could not post', err instanceof Error ? err.message : 'Please try again.')
      setPosting(false)
    }
  }

  const ready = kind === 'text' ? !!content.trim() : kind === 'photo' ? !!photo : !!recordingUri

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>New update</Text>
          <View style={{ width: 52 }} />
        </View>

        <View style={styles.segment}>
          {kinds.map((k) => (
            <Pressable
              key={k.id}
              onPress={() => {
                Haptics.selectionAsync()
                setKind(k.id)
              }}
              style={[styles.segmentItem, kind === k.id && styles.segmentActive]}
              disabled={recState.isRecording}
            >
              <Ionicons name={k.icon} size={16} color={kind === k.id ? colors.primary : colors.muted} />
              <Text style={[styles.segmentText, kind === k.id && { color: colors.primary }]}>{k.label}</Text>
            </Pressable>
          ))}
        </View>

        {kind === 'voice' && (
          <View style={styles.recordBox}>
            {recordingUri ? (
              <View style={{ alignSelf: 'stretch', gap: 12 }}>
                <VoicePlayer url={recordingUri} accent={['#059669', '#0d9488']} />
                <Pressable onPress={() => setRecordingUri(null)} style={styles.redo}>
                  <Ionicons name="refresh" size={16} color={colors.primary} />
                  <Text style={styles.redoText}>Record again</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View>
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.recRing,
                      {
                        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                        transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
                      },
                    ]}
                  />
                  <Pressable
                    onPress={recState.isRecording ? stopRecording : startRecording}
                    style={[styles.recButton, recState.isRecording && { backgroundColor: '#ef4444' }]}
                  >
                    <Ionicons name={recState.isRecording ? 'stop' : 'mic'} size={38} color="#fff" />
                  </Pressable>
                </View>
                <Text style={styles.recTime}>{fmt(recState.durationMillis)}</Text>
                <Text style={styles.sub}>
                  {recState.isRecording ? 'Recording… tap to stop' : 'Tap to record · up to 2 minutes'}
                </Text>
              </>
            )}
          </View>
        )}

        {kind === 'photo' && (
          <View>
            {photo ? (
              <View>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <Pressable onPress={() => setPhoto(null)} style={styles.photoRemove}>
                  <Ionicons name="close" size={18} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <View style={styles.photoChoices}>
                <Pressable style={styles.photoChoice} onPress={() => pickPhoto(true)}>
                  <Ionicons name="camera" size={28} color={colors.primary} />
                  <Text style={styles.photoChoiceText}>Take photo</Text>
                </Pressable>
                <Pressable style={styles.photoChoice} onPress={() => pickPhoto(false)}>
                  <Ionicons name="images" size={28} color={colors.primary} />
                  <Text style={styles.photoChoiceText}>Choose photo</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={kind === 'text' ? 'Headline, e.g. Got my first interview!' : 'Headline (optional)'}
          placeholderTextColor="#94a3b8"
          maxLength={120}
          style={styles.input}
        />
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder={kind === 'text' ? 'Share how things are going…' : 'Add a caption (optional)'}
          placeholderTextColor="#94a3b8"
          multiline
          style={[styles.input, { minHeight: kind === 'text' ? 140 : 80, textAlignVertical: 'top' }]}
        />
        <View style={styles.prompts}>
          {prompts.map((p) => (
            <Pressable key={p} style={styles.prompt} onPress={() => setContent((c) => (c ? `${c}\n\n${p} ` : `${p} `))}>
              <Text style={styles.promptText}>{p}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.cta, (!ready || posting || recState.isRecording) && { opacity: 0.5 }]}
          onPress={submit}
          disabled={!ready || posting || recState.isRecording}
        >
          {posting ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Post update</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 14, paddingBottom: 40, backgroundColor: '#fff', flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cancel: { color: colors.primary, fontSize: 16 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sub: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  segment: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 16, padding: 4, gap: 4 },
  segmentItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12 },
  segmentActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  segmentText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  recordBox: { alignItems: 'center', gap: 10, paddingVertical: 28, backgroundColor: colors.bg, borderRadius: 24 },
  recRing: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: '#ef4444' },
  recButton: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  recTime: { fontSize: 32, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  redo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  redoText: { color: colors.primary, fontWeight: '600' },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 20 },
  photoRemove: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  photoChoices: { flexDirection: 'row', gap: 12 },
  photoChoice: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 32, backgroundColor: colors.bg, borderRadius: 20 },
  photoChoiceText: { fontSize: 14, fontWeight: '600', color: colors.text },
  input: { backgroundColor: colors.bg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text },
  prompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prompt: { backgroundColor: colors.primarySoft, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  promptText: { fontSize: 12, color: colors.primaryDark },
  cta: { backgroundColor: colors.primary, borderRadius: 99, paddingVertical: 17, alignItems: 'center', marginTop: 6 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
})

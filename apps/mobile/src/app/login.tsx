import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAuth } from '@/auth'
import { colors } from '@/theme'
import { WEBSITE_URL } from '@/data'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    setLoading(true)
    const message = await signIn(email, password)
    setLoading(false)
    if (message) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setError(message)
      return
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    router.back()
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
      <View style={styles.grabber} />
      <Text style={styles.title}>Log in</Text>
      <Text style={styles.sub}>Use the same email and password as on washomeless.com.</Text>

      <View style={{ gap: 12 }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          style={styles.input}
          onSubmitEditing={submit}
        />
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.cta, (!email || !password) && { opacity: 0.5 }]} onPress={submit} disabled={loading || !email || !password}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Log in</Text>}
      </Pressable>

      <Pressable onPress={() => Linking.openURL(`${WEBSITE_URL}/auth/signup`)}>
        <Text style={styles.link}>No account yet? Create one on washomeless.com</Text>
      </Pressable>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 24, gap: 16 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.faint, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.6 },
  sub: { fontSize: 15, color: colors.muted, marginBottom: 8 },
  input: { backgroundColor: colors.bg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, color: colors.text },
  error: { color: '#dc2626', fontSize: 14 },
  cta: { backgroundColor: colors.primary, borderRadius: 99, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  link: { color: colors.primary, fontWeight: '600', textAlign: 'center', marginTop: 4 },
})

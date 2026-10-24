import { AppState } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// Same Supabase project as washomeless.com. The anon key is public by design;
// row level security decides what each logged-in user can read and write.
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

// Only refresh the session while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh()
  else supabase.auth.stopAutoRefresh()
})

export const MEDIA_BUCKET = 'diary-media'

// Uploads a local file (photo or recording) into the user's own folder and returns its public URL.
export async function uploadMedia(userId: string, localUri: string, contentType: string, ext: string) {
  const body = await (await fetch(localUri)).arrayBuffer()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, body, { contentType })
  if (error) throw error
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

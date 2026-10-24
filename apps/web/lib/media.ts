import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, DiaryUpdate } from '@/types/database'

const BUCKET = 'diary-media'
const SIGNED_URL_SECONDS = 60 * 60

// Media URLs are stored in their public form; the bucket is private, so we pull out
// the object path and hand the browser a short-lived signed URL instead.
export function mediaPath(url: string | null) {
  if (!url) return null
  const marker = `/${BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0])
}

export async function withSignedMedia(supabase: SupabaseClient<Database>, updates: DiaryUpdate[]) {
  const paths = Array.from(
    new Set(updates.flatMap((u) => [mediaPath(u.image_url), mediaPath(u.audio_url)]).filter((p): p is string => !!p))
  )
  if (paths.length === 0) return updates

  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS)
  const signed = new Map((data ?? []).filter((d) => d.signedUrl).map((d) => [d.path, d.signedUrl]))
  const sign = (url: string | null) => {
    const path = mediaPath(url)
    return path ? signed.get(path) ?? null : url
  }

  return updates.map((u) => ({ ...u, image_url: sign(u.image_url), audio_url: sign(u.audio_url) }))
}

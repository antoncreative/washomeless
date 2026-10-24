import type { Milestone, Person, Teaser, Update } from './data'
import { MEDIA_BUCKET, supabase } from './supabase'

// Reads from the same Supabase project as washomeless.com, as the logged-in user (or anonymously).
// Full updates are only returned for people whose circle you're in (or your own); everyone else
// gets teasers — type, headline and date. Media files are private, so we fetch signed URLs.

const SIGNED_URL_SECONDS = 60 * 60

type PersonRow = {
  id: string
  name: string
  city: string
  story: string
  current_supporters: number
}

type UpdateRow = {
  id: string
  person_id: string
  kind: Update['kind'] | null
  title: string
  content: string
  image_url: string | null
  audio_url: string | null
  created_at: string
}

type TeaserRow = {
  id: string
  person_id: string
  kind: Update['kind'] | null
  title: string
  created_at: string
}

type MilestoneRow = {
  person_id: string
  title: string
  description: string | null
  completed: boolean
  completed_at: string | null
  sort_order: number
}

const palettes: [string, string][] = [
  ['#34d399', '#0d9488'],
  ['#fbbf24', '#f97316'],
  ['#60a5fa', '#6366f1'],
  ['#f472b6', '#a855f7'],
  ['#2dd4bf', '#0284c7'],
]

function paletteFor(id: string) {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return palettes[hash % palettes.length]
}

export function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
}

function firstSentence(text: string) {
  const sentence = (text.match(/^.*?[.!?](?:\s|$)/)?.[0] ?? text).trim()
  return sentence.length > 80 ? `${sentence.slice(0, 77)}…` : sentence
}

function mediaPath(url: string | null) {
  if (!url) return null
  const marker = `/${MEDIA_BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0])
}

async function signMedia(updates: UpdateRow[]) {
  const paths = Array.from(
    new Set(updates.flatMap((u) => [mediaPath(u.image_url), mediaPath(u.audio_url)]).filter((p): p is string => !!p))
  )
  if (paths.length === 0) return updates
  const { data } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS)
  const signed = new Map((data ?? []).filter((d) => d.signedUrl).map((d) => [d.path, d.signedUrl]))
  const sign = (url: string | null) => {
    const path = mediaPath(url)
    return path ? signed.get(path) ?? null : url
  }
  return updates.map((u) => ({ ...u, image_url: sign(u.image_url), audio_url: sign(u.audio_url) }))
}

async function rows<T>(query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export type LiveData = { people: Person[]; latest: (Teaser & { personId: string })[] }

export async function fetchLive(): Promise<LiveData> {
  const [peopleRows, readable, milestones, teaserRows] = await Promise.all([
    rows<PersonRow>(
      supabase.from('sponsored_people').select('id,name,city,story,current_supporters').eq('status', 'active').order('created_at', { ascending: false })
    ),
    rows<UpdateRow>(
      supabase.from('diary_updates').select('id,person_id,kind,title,content,image_url,audio_url,created_at').order('created_at', { ascending: false }).limit(200)
    ),
    rows<MilestoneRow>(
      supabase.from('milestones').select('person_id,title,description,completed,completed_at,sort_order').order('sort_order')
    ),
    rows<TeaserRow>(supabase.rpc('update_teasers')),
  ])
  const updates = await signMedia(readable)
  const readableIds = new Set(updates.map((u) => u.id))

  const toTeaser = (t: TeaserRow): Teaser => ({ id: t.id, kind: t.kind ?? 'text', title: t.title, when: timeAgo(t.created_at), createdAt: t.created_at })

  const toUpdate = (u: UpdateRow): Update => ({
    id: u.id,
    kind: u.kind ?? 'text',
    title: u.title,
    content: u.content,
    when: timeAgo(u.created_at),
    imageUrl: u.image_url,
    audioUrl: u.audio_url,
    createdAt: u.created_at,
  })

  const people: Person[] = peopleRows.map((p) => ({
    id: p.id,
    isExample: false,
    name: p.name,
    neighbourhood: p.city.replace(/^Toronto\s*·\s*/, '') || 'Toronto',
    headline: firstSentence(p.story),
    story: p.story,
    supporters: p.current_supporters,
    colors: paletteFor(p.id),
    milestones: milestones
      .filter((m) => m.person_id === p.id)
      .map<Milestone>((m) => ({
        title: m.title,
        description: m.description ?? '',
        completed: m.completed,
        when: m.completed_at
          ? new Date(m.completed_at).toLocaleDateString('en-US', { month: 'long' })
          : undefined,
      })),
    updates: updates.filter((u) => u.person_id === p.id).map(toUpdate),
    locked: teaserRows.filter((t) => t.person_id === p.id && !readableIds.has(t.id)).map(toTeaser),
  }))

  const activeIds = new Set(people.map((p) => p.id))
  const latest = teaserRows
    .filter((t) => activeIds.has(t.person_id))
    .slice(0, 30)
    .map((t) => ({ ...toTeaser(t), personId: t.person_id }))

  return { people, latest }
}

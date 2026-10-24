import type { Milestone, Person, Update } from './data'

// Reads public data from the same Supabase project as washomeless.com.
// Uses the public anon key over the REST API — the same access any website visitor has.

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

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

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY!, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}`)
  return res.json() as Promise<T>
}

export type LiveData = { people: Person[]; latest: (Update & { personId: string; id: string; createdAt: string })[] }

export async function fetchLive(): Promise<LiveData> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase is not configured')

  const [rows, updates, milestones] = await Promise.all([
    get<PersonRow[]>('sponsored_people?status=eq.active&select=id,name,city,story,current_supporters&order=created_at.desc'),
    get<UpdateRow[]>('diary_updates?select=id,person_id,kind,title,content,image_url,audio_url,created_at&order=created_at.desc&limit=200'),
    get<MilestoneRow[]>('milestones?select=person_id,title,description,completed,completed_at,sort_order&order=sort_order'),
  ])

  const toUpdate = (u: UpdateRow): Update => ({
    kind: u.kind ?? 'text',
    title: u.title,
    content: u.content,
    when: timeAgo(u.created_at),
    imageUrl: u.image_url,
    audioUrl: u.audio_url,
    createdAt: u.created_at,
  })

  const people: Person[] = rows.map((p) => ({
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
  }))

  const activeIds = new Set(people.map((p) => p.id))
  const latest = updates
    .filter((u) => activeIds.has(u.person_id))
    .slice(0, 30)
    .map((u) => ({ ...toUpdate(u), id: u.id, personId: u.person_id, createdAt: u.created_at }))

  return { people, latest }
}

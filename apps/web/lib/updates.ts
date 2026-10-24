import type { DiaryUpdate } from '@/types/database'

// How often sponsored people are asked to post. Any kind counts: text, photo or voice.
export const UPDATES_PER_WEEK = 2

export const UPDATE_PROMPTS = [
  'What went well this week?',
  'What are you working on next?',
  'Anything you’re proud of?',
  'What would you like your supporters to know?',
]

export function startOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Monday = 0
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d
}

export function updatesThisWeek(updates: Pick<DiaryUpdate, 'created_at'>[]) {
  const start = startOfWeek().getTime()
  return updates.filter((u) => new Date(u.created_at).getTime() >= start).length
}

export function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
}

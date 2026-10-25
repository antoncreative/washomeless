import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AppState } from 'react-native'
import { people as examplePeople, type Person } from './data'
import { fetchLive, type LiveData } from './live'
import { useAuth } from './auth'

export type Activity = { id: string; icon: string; title: string; body: string; when: string; personId?: string }

const REFRESH_MS = 15_000
const MIN_REAL_PEOPLE = 3

const exampleActivity: Activity[] = [
  { id: 'a1', icon: '🎉', title: 'Milestone reached', body: 'Marcus landed a trial shift at a bistro on Queen East.', when: '2d', personId: 'marcus' },
  { id: 'a2', icon: '📘', title: 'New diary update', body: 'Amina was accepted into the pharmacy technician bridging program.', when: '5d', personId: 'amina' },
  { id: 'a3', icon: '⚡️', title: 'New diary update', body: 'Daniel finished his first week of the electrician pre-apprenticeship.', when: '1d', personId: 'daniel' },
  { id: 'a4', icon: '💚', title: 'Circle complete', body: 'Linda’s circle reached 100 supporters. Fully funded!', when: '1w', personId: 'linda' },
]

const kindIcon = { text: '📘', photo: '📸', voice: '🎙' }
const kindTitle = { text: 'New diary update', photo: 'New photo', voice: 'New voice note' }

type Store = {
  people: Person[]
  isLive: boolean
  refreshing: boolean
  supporting: string[]
  activity: Activity[]
  refresh: () => Promise<void>
  support: (id: string) => void
  isSupporting: (id: string) => boolean
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<LiveData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [supporting, setSupporting] = useState<string[]>([])
  const [joined, setJoined] = useState<Activity[]>([])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      setLive(await fetchLive())
    } catch {
      // Offline or not configured — keep showing whatever we had (or the examples).
    } finally {
      setRefreshing(false)
    }
  }, [])

  // What you can read depends on who's logged in, so reload when that changes.
  const { session } = useAuth()
  const userId = session?.user.id
  useEffect(() => {
    refresh()
  }, [userId, refresh])

  // Load on start, every few seconds, and whenever the app comes back to the foreground.
  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, REFRESH_MS)
    const sub = AppState.addEventListener('change', (state) => state === 'active' && refresh())
    return () => {
      clearInterval(timer)
      sub.remove()
    }
  }, [refresh])

  const isLive = !!live && live.people.length > 0
  // Keep examples alongside real people until there are enough of them (same rule as the website).
  const basePeople = isLive
    ? live.people.length >= MIN_REAL_PEOPLE
      ? live.people
      : [...live.people, ...examplePeople]
    : examplePeople

  // Joining a circle is still a demo action: bump the count locally.
  const people = useMemo(
    () => basePeople.map((p) => (supporting.includes(p.id) ? { ...p, supporters: Math.min(100, p.supporters + 1) } : p)),
    [basePeople, supporting]
  )

  const activity = useMemo<Activity[]>(() => {
    if (!isLive) return [...joined, ...exampleActivity]
    const names = new Map(live.people.map((p) => [p.id, p.name.split(' ')[0]]))
    const fromUpdates = live.latest.map((u) => ({
      id: u.id,
      icon: kindIcon[u.kind],
      title: kindTitle[u.kind],
      body: `${names.get(u.personId)}: ${u.title}`,
      when: u.when,
      personId: u.personId,
    }))
    const examples = live.people.length < MIN_REAL_PEOPLE ? exampleActivity : []
    return [...joined, ...fromUpdates, ...examples]
  }, [isLive, live, joined])

  const support = useCallback(
    (id: string) => {
      if (supporting.includes(id)) return
      setSupporting((s) => [...s, id])
      const person = basePeople.find((p) => p.id === id)
      if (person) {
        setJoined((a) => [
          { id: `join-${id}-${Date.now()}`, icon: '🤝', title: 'You joined a circle', body: `You’re now one of ${person.name.split(' ')[0]}’s supporters. Welcome!`, when: 'now', personId: id },
          ...a,
        ])
      }
    },
    [supporting, basePeople]
  )

  const value = useMemo(
    () => ({ people, isLive, refreshing, supporting, activity, refresh, support, isSupporting: (id: string) => supporting.includes(id) }),
    [people, isLive, refreshing, supporting, activity, refresh, support]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

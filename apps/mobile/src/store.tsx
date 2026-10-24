import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { people as seedPeople, type Person } from './data'

export type Activity = { id: string; icon: string; title: string; body: string; when: string; personId?: string }

const seedActivity: Activity[] = [
  { id: 'a1', icon: '🎉', title: 'Milestone reached', body: 'Marcus landed a trial shift at a bistro on Queen East.', when: '2d', personId: 'marcus' },
  { id: 'a2', icon: '📘', title: 'New diary update', body: 'Amina was accepted into the pharmacy technician bridging program.', when: '5d', personId: 'amina' },
  { id: 'a3', icon: '⚡️', title: 'New diary update', body: 'Daniel finished his first week of the electrician pre-apprenticeship.', when: '1d', personId: 'daniel' },
  { id: 'a4', icon: '💚', title: 'Circle complete', body: 'Linda’s circle reached 100 supporters. Fully funded!', when: '1w', personId: 'linda' },
]

type Store = {
  people: Person[]
  supporting: string[]
  activity: Activity[]
  support: (id: string) => void
  isSupporting: (id: string) => boolean
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState(seedPeople)
  const [supporting, setSupporting] = useState<string[]>([])
  const [activity, setActivity] = useState(seedActivity)

  const support = useCallback((id: string) => {
    setSupporting((s) => (s.includes(id) ? s : [...s, id]))
    setPeople((ps) => ps.map((p) => (p.id === id ? { ...p, supporters: Math.min(100, p.supporters + 1) } : p)))
    const person = seedPeople.find((p) => p.id === id)
    if (person) {
      setActivity((a) => [
        { id: `join-${id}-${Date.now()}`, icon: '🤝', title: 'You joined a circle', body: `You’re now one of ${person.name.split(' ')[0]}’s supporters. Welcome!`, when: 'now', personId: id },
        ...a,
      ])
    }
  }, [])

  const value = useMemo(
    () => ({ people, supporting, activity, support, isSupporting: (id: string) => supporting.includes(id) }),
    [people, supporting, activity, support]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

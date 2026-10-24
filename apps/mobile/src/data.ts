// Example profiles — these are not real people. Shown when the live database
// has no approved people yet, or when the phone is offline.
// Mirrors apps/web/lib/demo-data.ts so the app and site tell the same story.

export type Milestone = { title: string; description: string; completed: boolean; when?: string }
export type Update = {
  kind: 'text' | 'photo' | 'voice'
  title: string
  content: string
  when: string
  imageUrl?: string | null
  audioUrl?: string | null
  createdAt?: string
}

export type Person = {
  id: string
  isExample: boolean
  name: string
  age?: number
  neighbourhood: string
  headline: string
  story: string
  supporters: number
  colors: [string, string]
  milestones: Milestone[]
  updates: Update[]
}

const steps = [
  { title: 'Secure stable housing', description: 'A safe, private room or apartment' },
  { title: 'Health & documents', description: 'Doctor, counselling, ID, bank account' },
  { title: 'Training or job search', description: 'Enroll in a program or start applying' },
  { title: 'Steady income', description: 'Reliable income for 3+ months' },
  { title: 'Fully independent', description: 'Paying own rent — journey complete' },
]

const months = ['June', 'July', 'August', 'September']

function milestones(done: number): Milestone[] {
  return steps.map((s, i) => ({ ...s, completed: i < done, when: i < done ? months[i] : undefined }))
}

export const people: Person[] = [
  {
    id: 'marcus',
    isExample: true,
    name: 'Marcus T.',
    age: 41,
    neighbourhood: 'Moss Park',
    headline: 'Line cook getting back into the kitchen',
    story:
      'I was a line cook for eleven years until the restaurant closed during a rent spike. I lost my apartment three months later and have been moving between shelters since. I still have my food handler certificate and I still love cooking. With a stable room and a few months of support, I can get back into a kitchen — and one day run my own.',
    supporters: 87,
    colors: ['#34d399', '#0d9488'],
    milestones: milestones(3),
    updates: [
      { kind: 'voice', title: 'Trial shift went great', content: 'Did a trial shift at a bistro on Queen East today. Chef said my knife work is still sharp. They want me back Friday.', when: '2 days ago' },
      { kind: 'text', title: 'Got my keys', content: 'Moved into a room near Broadview. Slept eight hours straight for the first time since I can remember. Thank you, all of you.', when: '2 months ago' },
    ],
  },
  {
    id: 'amina',
    isExample: true,
    name: 'Amina K.',
    age: 34,
    neighbourhood: 'Scarborough',
    headline: 'Mom of two, future pharmacy technician',
    story:
      'I came to Canada with my two kids after leaving an unsafe situation. We have been in a family shelter for eight months. I was a pharmacy assistant back home and I want to get my credentials recognized here. A safe apartment near the kids’ school would let me focus on the bridging program.',
    supporters: 64,
    colors: ['#fbbf24', '#f97316'],
    milestones: milestones(2),
    updates: [
      { kind: 'text', title: 'Bridging program accepted', content: 'I was accepted into the pharmacy technician bridging program starting in January. The kids made me a card.', when: '5 days ago' },
    ],
  },
  {
    id: 'daniel',
    isExample: true,
    name: 'Daniel R.',
    age: 22,
    neighbourhood: 'Parkdale',
    headline: 'Aged out of foster care, training as an electrician',
    story:
      'I aged out of foster care at 18 with nowhere to go. I’ve been couch-surfing and sleeping in my car. I just got accepted into an electrician pre-apprenticeship. I need a stable place to sleep so I can show up every morning and finish it.',
    supporters: 41,
    colors: ['#60a5fa', '#6366f1'],
    milestones: milestones(1),
    updates: [
      { kind: 'voice', title: 'First week done', content: 'Five days, five on-time arrivals. Learned conduit bending today. My hands hurt but it’s the good kind of tired.', when: 'Yesterday' },
    ],
  },
  {
    id: 'linda',
    isExample: true,
    name: 'Linda P.',
    age: 58,
    neighbourhood: 'Downtown East',
    headline: 'Bookkeeper rebuilding after loss',
    story:
      'After my husband passed, the medical bills took everything, including the house. I’m 58 and I worked in bookkeeping for 30 years. I want to get back on my feet and do part-time bookkeeping for small businesses.',
    supporters: 100,
    colors: ['#f472b6', '#a855f7'],
    milestones: milestones(4),
    updates: [
      { kind: 'text', title: 'Three clients now', content: 'A bakery, a hair salon, and a small moving company. Month 10 and I can see the finish line.', when: '10 days ago' },
    ],
  },
]

export const budget = [
  { label: 'Housing', amount: 1400, color: '#059669' },
  { label: 'Food & essentials', amount: 450, color: '#34d399' },
  { label: 'Counselling & health', amount: 350, color: '#14b8a6' },
  { label: 'Training', amount: 350, color: '#06b6d4' },
  { label: 'Caseworker', amount: 250, color: '#0ea5e9' },
  { label: 'Transit & phone', amount: 200, color: '#818cf8' },
]

// Sponsored people are asked for this many updates a week — text, photo or voice.
export const UPDATES_PER_WEEK = 2

export const MAX_SUPPORTERS = 100
export const MONTHLY = 30

export const WEBSITE_URL = 'https://washomeless.com'

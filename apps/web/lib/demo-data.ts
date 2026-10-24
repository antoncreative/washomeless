import type { SponsoredPerson, Milestone, DiaryUpdate } from '@/types/database'

// Example profiles shown when the database has no active people yet.
// They are always labelled "Example" in the UI — these are not real people.

export const DEMO_ID_PREFIX = 'example-'

export function isDemoId(id: string) {
  return id.startsWith(DEMO_ID_PREFIX)
}

const now = new Date('2026-10-01T12:00:00Z').getTime()
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString()

export const demoPeople: SponsoredPerson[] = [
  {
    id: 'example-marcus',
    user_id: null,
    name: 'Marcus T.',
    city: 'Toronto · Moss Park',
    story:
      'I was a line cook for eleven years until the restaurant closed during a rent spike. I lost my apartment three months later and have been moving between shelters since. I still have my food handler certificate and I still love cooking. With a stable room and a few months of support, I can get back into a kitchen — and one day run my own.',
    goal_amount: 3000,
    current_supporters: 87,
    max_supporters: 100,
    status: 'active',
    avatar_url: null,
    created_at: daysAgo(120),
    updated_at: daysAgo(2),
  },
  {
    id: 'example-amina',
    user_id: null,
    name: 'Amina K.',
    city: 'Toronto · Scarborough',
    story:
      'I came to Canada with my two kids after leaving an unsafe situation. We have been in a family shelter for eight months. I was a pharmacy assistant back home and I want to get my credentials recognized here. A safe apartment near the kids’ school would let me focus on the bridging program.',
    goal_amount: 3000,
    current_supporters: 64,
    max_supporters: 100,
    status: 'active',
    avatar_url: null,
    created_at: daysAgo(90),
    updated_at: daysAgo(5),
  },
  {
    id: 'example-daniel',
    user_id: null,
    name: 'Daniel R.',
    city: 'Toronto · Parkdale',
    story:
      'I aged out of foster care at 18 with nowhere to go. I’m 22 now and I’ve been couch-surfing and sleeping in my car. I just got accepted into an electrician pre-apprenticeship at George Brown. I need a stable place to sleep so I can actually show up every morning and finish it.',
    goal_amount: 3000,
    current_supporters: 41,
    max_supporters: 100,
    status: 'active',
    avatar_url: null,
    created_at: daysAgo(45),
    updated_at: daysAgo(1),
  },
  {
    id: 'example-linda',
    user_id: null,
    name: 'Linda P.',
    city: 'Toronto · Downtown East',
    story:
      'After my husband passed, the medical bills took everything, including the house. I’m 58 and I worked in bookkeeping for 30 years. Nobody expects someone like me to end up in a shelter, but here I am. I want to get back on my feet and do part-time bookkeeping for small businesses.',
    goal_amount: 3000,
    current_supporters: 100,
    max_supporters: 100,
    status: 'active',
    avatar_url: null,
    created_at: daysAgo(200),
    updated_at: daysAgo(10),
  },
]

const milestoneTemplate = [
  { title: 'Secure stable housing', description: 'Move into a safe, private room or apartment' },
  { title: 'Health & wellbeing check', description: 'Doctor visit, counselling, ID and documents in order' },
  { title: 'Start training or job search', description: 'Enroll in a program or begin applying for work' },
  { title: 'Land steady income', description: 'Hold a job or reliable income for 3+ months' },
  { title: 'Fully independent', description: 'Paying own rent — journey complete' },
]

const progressByPerson: Record<string, number> = {
  'example-marcus': 3,
  'example-amina': 2,
  'example-daniel': 1,
  'example-linda': 4,
}

export function getDemoMilestones(personId: string): Milestone[] {
  const done = progressByPerson[personId] ?? 0
  return milestoneTemplate.map((m, i) => ({
    id: `${personId}-m${i}`,
    person_id: personId,
    title: m.title,
    description: m.description,
    completed: i < done,
    completed_at: i < done ? daysAgo(110 - i * 30) : null,
    sort_order: i,
    created_at: daysAgo(120),
  }))
}

const updatesByPerson: Record<string, { title: string; content: string; days: number }[]> = {
  'example-marcus': [
    {
      title: 'Trial shift went great',
      content:
        'Did a trial shift at a bistro on Queen East today. Chef said my knife work is still sharp. They want me back Friday. I haven’t felt this good in two years.',
      days: 2,
    },
    {
      title: 'Got my keys',
      content:
        'Moved into a room in a shared house near Broadview. Slept eight hours straight for the first time since I can remember. Thank you to every one of you.',
      days: 60,
    },
  ],
  'example-amina': [
    {
      title: 'Bridging program accepted',
      content:
        'I was accepted into the pharmacy technician bridging program starting in January. The kids made me a card. We are counting the days.',
      days: 5,
    },
  ],
  'example-daniel': [
    {
      title: 'First week of the pre-apprenticeship',
      content:
        'Five days, five on-time arrivals. Learned conduit bending today. My hands hurt but it’s the good kind of tired.',
      days: 1,
    },
  ],
  'example-linda': [
    {
      title: 'Three clients now',
      content:
        'A bakery, a hair salon, and a small moving company. I’m doing their books from the library and now from my own kitchen table. Month 10 and I can see the finish line.',
      days: 10,
    },
  ],
}

export function getDemoUpdates(personId: string): DiaryUpdate[] {
  return (updatesByPerson[personId] ?? []).map((u, i) => ({
    id: `${personId}-u${i}`,
    person_id: personId,
    title: u.title,
    content: u.content,
    image_url: null,
    created_at: daysAgo(u.days),
  }))
}

export function getDemoPerson(id: string) {
  return demoPeople.find((p) => p.id === id) ?? null
}

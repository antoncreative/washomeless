import { createClient } from '@/lib/supabase/server'
import type { SponsoredPerson, Milestone, DiaryUpdate as DiaryUpdateRow, UpdateTeaser } from '@/types/database'
import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SupporterProgress from '@/components/SupporterProgress'
import SubscribeButton from '@/components/SubscribeButton'
import DiaryUpdate from '@/components/DiaryUpdate'
import MilestoneTimeline from '@/components/MilestoneTimeline'
import LockedUpdate from '@/components/LockedUpdate'
import { withSignedMedia } from '@/lib/media'
import { timeAgo } from '@/lib/updates'
import { isDemoId, getDemoPerson, getDemoMilestones, getDemoUpdates } from '@/lib/demo-data'

export const revalidate = 30

interface Props {
  params: { id: string }
}

export default async function PersonProfilePage({ params }: Props) {
  if (isDemoId(params.id)) {
    const person = getDemoPerson(params.id)
    if (!person) notFound()
    return (
      <ProfileView
        person={person}
        updates={getDemoUpdates(person.id)}
        milestones={getDemoMilestones(person.id)}
        isExample
      />
    )
  }

  const supabase = await createClient()

  const [
    { data: person },
    { data: updates },
    { data: milestones },
    { data: { user } },
    { data: teasers },
  ] = await Promise.all([
    supabase
      .from('sponsored_people')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'active')
      .single(),
    supabase
      .from('diary_updates')
      .select('*')
      .eq('person_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('milestones')
      .select('*')
      .eq('person_id', params.id)
      .order('sort_order'),
    supabase.auth.getUser(),
    // Everyone sees what was posted and when; full updates are only readable by the circle (RLS).
    supabase.rpc('update_teasers', { p_person_id: params.id }),
  ])

  if (!person) notFound()

  // Check if already supporting
  let alreadySupporting = false
  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('person_id', person.id)
      .eq('status', 'active')
      .maybeSingle()
    alreadySupporting = !!sub
  }

  return (
    <ProfileView
      person={person}
      updates={await withSignedMedia(supabase, updates ?? [])}
      teasers={teasers ?? []}
      milestones={milestones ?? []}
      alreadySupporting={alreadySupporting}
      isAuthenticated={!!user}
    />
  )
}

function ProfileView({
  person,
  updates,
  teasers = [],
  milestones,
  alreadySupporting = false,
  isAuthenticated = false,
  isExample = false,
}: {
  person: SponsoredPerson
  updates: DiaryUpdateRow[]
  teasers?: UpdateTeaser[]
  milestones: Milestone[]
  alreadySupporting?: boolean
  isAuthenticated?: boolean
  isExample?: boolean
}) {
  const isFull = person.current_supporters >= person.max_supporters
  const readable = new Set(updates.map((u) => u.id))
  const locked = teasers.filter((t) => !readable.has(t.id))
  const totalUpdates = updates.length + locked.length
  const lastPostedAt = [updates[0]?.created_at, locked[0]?.created_at].filter(Boolean).sort().pop()
  const firstName = person.name.split(' ')[0]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {isExample && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This is an example profile showing how Washomeless works — not a real person.
            </div>
          )}

          {/* Profile header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={person.avatar_url ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-600 text-white text-2xl font-bold">
                {person.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{person.name}</h1>
              <p className="text-gray-500">{person.city}</p>
              {lastPostedAt && (
                <p className="text-xs text-emerald-700 mt-1">
                  Last update {timeAgo(lastPostedAt)} · {totalUpdates} update{totalUpdates === 1 ? '' : 's'}
                </p>
              )}
            </div>
          </div>

          {/* Story */}
          <div>
            <h2 className="text-lg font-semibold mb-3">My story</h2>
            <p className="text-gray-700 leading-relaxed">{person.story}</p>
          </div>

          {/* Milestones */}
          {milestones && milestones.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Journey milestones</h2>
              <MilestoneTimeline milestones={milestones} />
            </div>
          )}

          {/* Diary updates */}
          {totalUpdates > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Updates</h2>
              {locked.length > 0 && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  🔒 {firstName}&apos;s photos, voice notes and diary are shared only with their circle of supporters.
                  {isAuthenticated ? ` Join ${firstName}'s circle to see them.` : ' Join the circle (or log in) to see them.'}
                </div>
              )}
              <div className="space-y-4">
                {updates.map((update) => (
                  <DiaryUpdate key={update.id} update={update} />
                ))}
                {locked.map((teaser) => (
                  <LockedUpdate key={teaser.id} teaser={teaser} />
                ))}
              </div>
            </div>
          )}

          {totalUpdates === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              No updates yet — check back soon.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6 space-y-5 sticky top-24">
            <SupporterProgress person={person} />

            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Monthly goal</span>
                <span className="font-medium">${person.goal_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Your contribution</span>
                <span className="font-medium">$30/month</span>
              </div>
              <div className="flex justify-between">
                <span>Program length</span>
                <span className="font-medium">12 months</span>
              </div>
            </div>

            {isExample ? (
              <div className="text-center py-3 px-4 bg-amber-50 rounded-lg text-sm text-amber-800">
                Example profile — support opens when real profiles launch.
              </div>
            ) : alreadySupporting ? (
              <div className="text-center py-3 px-4 bg-emerald-50 rounded-lg text-sm text-emerald-700 font-medium">
                You are supporting {person.name}
              </div>
            ) : (
              <SubscribeButton
                personId={person.id}
                isFull={isFull}
                isAuthenticated={isAuthenticated}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

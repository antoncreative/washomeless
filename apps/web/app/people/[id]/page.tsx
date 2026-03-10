import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SupporterProgress from '@/components/SupporterProgress'
import SubscribeButton from '@/components/SubscribeButton'
import DiaryUpdate from '@/components/DiaryUpdate'
import MilestoneTimeline from '@/components/MilestoneTimeline'

export const revalidate = 30

interface Props {
  params: { id: string }
}

export default async function PersonProfilePage({ params }: Props) {
  const supabase = await createClient()

  const [
    { data: person },
    { data: updates },
    { data: milestones },
    { data: { user } },
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
  ])

  if (!person) notFound()

  const isFull = person.current_supporters >= person.max_supporters

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
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={person.avatar_url ?? undefined} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
                {person.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{person.name}</h1>
              <p className="text-gray-500">{person.city}</p>
            </div>
          </div>

          {/* Story */}
          <div>
            <h2 className="text-lg font-semibold mb-3">My story</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{person.story}</p>
          </div>

          {/* Milestones */}
          {milestones && milestones.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Journey milestones</h2>
              <MilestoneTimeline milestones={milestones} />
            </div>
          )}

          {/* Diary updates */}
          {updates && updates.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Updates</h2>
              <div className="space-y-4">
                {updates.map((update) => (
                  <DiaryUpdate key={update.id} update={update} />
                ))}
              </div>
            </div>
          )}

          {(!updates || updates.length === 0) && (
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

            {alreadySupporting ? (
              <div className="text-center py-3 px-4 bg-emerald-50 rounded-lg text-sm text-emerald-700 font-medium">
                You are supporting {person.name}
              </div>
            ) : (
              <SubscribeButton
                personId={person.id}
                isFull={isFull}
                isAuthenticated={!!user}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

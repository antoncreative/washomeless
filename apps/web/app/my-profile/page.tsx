import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SupporterProgress from '@/components/SupporterProgress'
import DiaryUpdate from '@/components/DiaryUpdate'
import MilestoneTimeline from '@/components/MilestoneTimeline'
import { UPDATES_PER_WEEK, updatesThisWeek } from '@/lib/updates'

export default async function MyProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'sponsored') redirect('/dashboard')

  const { data: person } = await supabase
    .from('sponsored_people')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!person) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">No profile found</h1>
        <p className="text-gray-600">Your sponsored profile hasn't been set up yet. Please contact support.</p>
      </div>
    )
  }

  const [{ data: updates }, { data: milestones }] = await Promise.all([
    supabase
      .from('diary_updates')
      .select('*')
      .eq('person_id', person.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('milestones')
      .select('*')
      .eq('person_id', person.id)
      .order('sort_order'),
  ])

  const postedThisWeek = updatesThisWeek(updates ?? [])
  const weeklyDone = postedThisWeek >= UPDATES_PER_WEEK

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={person.avatar_url ?? undefined} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl font-bold">
              {person.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{person.name}</h1>
            <p className="text-gray-500">{person.city}</p>
            <Badge className={`mt-1 ${statusColors[person.status]}`}>
              {person.status}
            </Badge>
          </div>
        </div>
        {person.status === 'active' && (
          <Link href="/my-profile/updates/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Post an update</Button>
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Story */}
          <div>
            <h2 className="text-lg font-semibold mb-2">My story</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{person.story}</p>
          </div>

          {/* Updates */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              My updates{' '}
              <span className="text-sm font-normal text-gray-500">({updates?.length ?? 0})</span>
            </h2>
            {updates && updates.length > 0 ? (
              <div className="space-y-4">
                {updates.map((u) => <DiaryUpdate key={u.id} update={u} />)}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">You haven't posted any updates yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Weekly update goal */}
          {person.status === 'active' && (
            <div className={`border rounded-xl p-5 ${weeklyDone ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
              <h3 className="font-semibold mb-1">This week&apos;s updates</h3>
              <p className="text-sm text-gray-500 mb-4">
                Goal: {UPDATES_PER_WEEK} per week — text, photo or voice all count.
              </p>
              <div className="flex gap-2 mb-3">
                {Array.from({ length: UPDATES_PER_WEEK }, (_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${i < postedThisWeek ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-800">
                {weeklyDone
                  ? `Done for this week 🎉 ${postedThisWeek} posted`
                  : `${postedThisWeek} of ${UPDATES_PER_WEEK} posted`}
              </p>
              {!weeklyDone && (
                <Link href="/my-profile/updates/new" className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline">
                  Post a quick update →
                </Link>
              )}
            </div>
          )}

          {/* Progress */}
          {person.status === 'active' && (
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold mb-4">Support progress</h3>
              <SupporterProgress person={person} />
            </div>
          )}

          {/* Milestones */}
          {milestones && milestones.length > 0 && (
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold mb-4">Milestones</h3>
              <MilestoneTimeline milestones={milestones} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

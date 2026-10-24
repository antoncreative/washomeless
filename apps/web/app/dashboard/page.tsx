import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import DiaryUpdate from '@/components/DiaryUpdate'
import { withSignedMedia } from '@/lib/media'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch active subscriptions with person info
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(`
      *,
      sponsored_people (
        id, name, city, current_supporters, max_supporters, avatar_url, status
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch recent diary updates from supported people
  const personIds = subscriptions
    ?.filter((s) => s.status === 'active')
    .map((s) => s.person_id) ?? []

  const { data: rawUpdates } = personIds.length > 0
    ? await supabase
        .from('diary_updates')
        .select('*')
        .in('person_id', personIds)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const recentUpdates = await withSignedMedia(supabase, rawUpdates ?? [])

  const activeCount = subscriptions?.filter((s) => s.status === 'active').length ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-1">
          You are supporting <strong>{activeCount}</strong> {activeCount === 1 ? 'person' : 'people'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Subscriptions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-gray-900">My subscriptions</h2>

          {!subscriptions || subscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <p>You haven't supported anyone yet.</p>
              <Link href="/people" className="text-emerald-700 hover:underline mt-2 block">
                Browse people →
              </Link>
            </div>
          ) : (
            subscriptions.map((sub) => {
              const person = (sub as unknown as {
                sponsored_people: {
                  id: string; name: string; city: string;
                  current_supporters: number; max_supporters: number; status: string
                } | null
              }).sponsored_people
              if (!person) return null
              const pct = Math.round((person.current_supporters / person.max_supporters) * 100)

              return (
                <Card key={sub.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/people/${person.id}`}
                        className="font-medium hover:underline text-sm"
                      >
                        {person.name}
                      </Link>
                      <Badge
                        variant={sub.status === 'active' ? 'default' : 'secondary'}
                        className={sub.status === 'active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : ''}
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{person.city}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{person.current_supporters}/{person.max_supporters} supporters</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      $30/month · Since {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Updates feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-900">Recent updates from people you support</h2>

          {!recentUpdates || recentUpdates.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No updates yet — they'll appear here as the people you support share their journey.
            </div>
          ) : (
            recentUpdates.map((update) => (
              <DiaryUpdate key={update.id} update={update} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

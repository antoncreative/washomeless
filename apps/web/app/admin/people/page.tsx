import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import ApproveRejectButtons from './ApproveRejectButtons'

export const revalidate = 0

export default async function AdminPeoplePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const { data: people } = await supabase
    .from('sponsored_people')
    .select('*')
    .order('created_at', { ascending: false })

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Manage people</h1>

      <div className="space-y-4">
        {!people || people.length === 0 ? (
          <p className="text-gray-500">No sponsored people yet.</p>
        ) : (
          people.map((person) => (
            <div key={person.id} className="border rounded-xl p-5 bg-white">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={person.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                    {person.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{person.name}</h3>
                    <span className="text-sm text-gray-500">{person.city}</span>
                    <Badge className={statusColors[person.status]}>{person.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{person.story}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {person.current_supporters}/{person.max_supporters} supporters ·{' '}
                    Applied {new Date(person.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ApproveRejectButtons person={person} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

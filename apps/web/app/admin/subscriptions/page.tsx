import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export const revalidate = 0

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(`
      *,
      sponsored_people ( name, city ),
      profiles!subscriptions_user_id_fkey ( name )
    `)
    .order('created_at', { ascending: false })

  const active = subscriptions?.filter((s) => s.status === 'active') ?? []
  const monthly = active.length * 30

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-gray-100 text-gray-600',
    past_due: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">Monthly revenue</p>
          <p className="text-2xl font-bold text-emerald-700">${monthly.toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Donor</th>
              <th className="pb-3 font-medium">Person supported</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!subscriptions || subscriptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">No subscriptions yet</td>
              </tr>
            ) : (
              subscriptions.map((sub) => {
                const subRaw = sub as unknown as {
                  id: string; user_id: string; amount: number; status: string; created_at: string;
                  sponsored_people: { name: string; city: string } | null;
                  profiles: { name: string } | null;
                }
                const person = subRaw.sponsored_people
                const donor = subRaw.profiles
                return (
                  <tr key={subRaw.id} className="hover:bg-gray-50">
                    <td className="py-3">{donor?.name ?? subRaw.user_id.slice(0, 8)}</td>
                    <td className="py-3">{person?.name ?? '—'}</td>
                    <td className="py-3">${(subRaw.amount / 100).toFixed(2)}/mo</td>
                    <td className="py-3">
                      <Badge className={statusColors[subRaw.status]}>{subRaw.status}</Badge>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(subRaw.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

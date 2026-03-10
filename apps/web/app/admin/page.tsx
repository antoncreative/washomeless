import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const [
    { count: totalPeople },
    { count: activePeople },
    { count: pendingPeople },
    { count: activeSubscriptions },
  ] = await Promise.all([
    supabase.from('sponsored_people').select('*', { count: 'exact', head: true }),
    supabase.from('sponsored_people').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('sponsored_people').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  const monthlyRevenue = (activeSubscriptions ?? 0) * 30

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total people</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPeople ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{activePeople ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingPeople ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Monthly revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${monthlyRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/people">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Manage people</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Approve, reject, or review sponsored people profiles.</p>
              {(pendingPeople ?? 0) > 0 && (
                <p className="mt-2 text-sm font-medium text-yellow-700">
                  {pendingPeople} pending approval
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/subscriptions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">View all active and historical subscriptions.</p>
              <p className="mt-2 text-sm font-medium text-emerald-700">
                {activeSubscriptions ?? 0} active subscriptions
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

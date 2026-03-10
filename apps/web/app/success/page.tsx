import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

interface Props {
  searchParams: { session_id?: string }
}

export default async function SuccessPage({ searchParams }: Props) {
  let personName: string | null = null

  if (searchParams.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id)
      const personId = session.metadata?.person_id

      if (personId) {
        const supabase = await createClient()
        const { data } = await supabase
          .from('sponsored_people')
          .select('name')
          .eq('id', personId)
          .single()
        personName = data?.name ?? null
      }
    } catch {
      // Silently fail — show generic success
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">You're making a difference!</h1>
        <p className="text-gray-600">
          {personName
            ? `Thank you for supporting ${personName}. Your $30/month subscription is active.`
            : 'Thank you for your support. Your $30/month subscription is active.'}
          {' '}You'll receive updates as they hit their milestones.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button className="bg-emerald-600 hover:bg-emerald-700">View my dashboard</Button>
          </Link>
          <Link href="/people">
            <Button variant="outline">Browse more people</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

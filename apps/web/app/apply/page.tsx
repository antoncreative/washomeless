import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import ApplyForm from './ApplyForm'

const statusCopy: Record<string, { title: string; text: string; tone: string }> = {
  pending: {
    title: 'Your application is being reviewed',
    text: 'Thank you for applying. Our team will review your story and get back to you soon.',
    tone: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  active: {
    title: 'You’re approved!',
    text: 'Your profile is live. Post your first update so supporters can get to know you.',
    tone: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  },
  completed: {
    title: 'Program complete',
    text: 'You finished the 12-month program. We’re proud of you.',
    tone: 'bg-blue-50 border-blue-200 text-blue-900',
  },
  rejected: {
    title: 'Application not approved',
    text: 'We weren’t able to approve this application. Please contact us if you have questions.',
    tone: 'bg-gray-50 border-gray-200 text-gray-800',
  },
}

export default async function ApplyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: application } = user
    ? await supabase.from('sponsored_people').select('id, status').eq('user_id', user.id).maybeSingle()
    : { data: null }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-2">Apply for support</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tell us your story</h1>
      <p className="text-gray-600 mb-8">
        If you&apos;re experiencing homelessness in Toronto and ready to work toward stable housing and a job,
        you can apply for a 12-month program funded by 100 supporters at $30/month. Every application is
        reviewed by our team before anything is shown publicly.
      </p>

      {!user ? (
        <div className="rounded-2xl border p-6 space-y-4">
          <p className="text-gray-700">First, create a free account or log in. Then come back to this page to apply.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/signup">
              <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 rounded-full px-6">Create account</Button>
            </Link>
            <Link href="/auth/login?redirectTo=/apply">
              <Button variant="outline" className="w-full sm:w-auto rounded-full px-6">Log in</Button>
            </Link>
          </div>
        </div>
      ) : application ? (
        <div className={`rounded-2xl border p-6 ${statusCopy[application.status].tone}`}>
          <h2 className="text-lg font-semibold mb-1">{statusCopy[application.status].title}</h2>
          <p className="text-sm">{statusCopy[application.status].text}</p>
          {application.status === 'active' && (
            <Link href="/my-profile" className="inline-block mt-4 text-sm font-medium underline">
              Go to my profile →
            </Link>
          )}
        </div>
      ) : (
        <ApplyForm userId={user.id} />
      )}
    </div>
  )
}

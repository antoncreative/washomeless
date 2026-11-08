import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Coming soon — Washomeless' }

export default function PausedPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Coming soon</h1>
      <p className="text-gray-600 mb-8">
        Accounts, applications and monthly support are not open yet. In the meantime, take a look at
        the example profiles to see how Washomeless works.
      </p>
      <Link href="/people">
        <Button size="lg" className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-8">
          See example profiles
        </Button>
      </Link>
    </div>
  )
}

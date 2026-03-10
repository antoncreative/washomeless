import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import PersonCard from '@/components/PersonCard'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredPeople } = await supabase
    .from('sponsored_people')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-100 py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
            100 people. $30/month. <span className="text-emerald-700">One life changed.</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Washomeless connects donors with people experiencing homelessness. Together,
            100 donors contribute $30/month — that's $3,000 a month to fund one person's
            12-month journey to stable housing, employment, and independence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/people">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                Browse people to support
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Apply for support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-14 text-gray-900">How it works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-700 mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose someone to support</h3>
              <p className="text-gray-600">
                Browse verified profiles of people working to rebuild their lives. Read their stories and decide who you want to champion.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-700 mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Give $30/month</h3>
              <p className="text-gray-600">
                Your $30/month joins up to 99 other donors to create $3,000/month — enough to fund housing, therapy, job training, and more.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-700 mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Follow their journey</h3>
              <p className="text-gray-600">
                Get diary updates and milestone notifications as the person you're supporting makes real progress — no middlemen, no ambiguity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-emerald-700 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl sm:text-4xl font-bold mb-1">$3,000</div>
            <div className="text-emerald-200 text-xs sm:text-base">per person/month</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-bold mb-1">100</div>
            <div className="text-emerald-200 text-xs sm:text-base">donors per person</div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-bold mb-1">12</div>
            <div className="text-emerald-200 text-xs sm:text-base">month program</div>
          </div>
        </div>
      </section>

      {/* Featured People */}
      {featuredPeople && featuredPeople.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">People to support</h2>
              <Link href="/people" className="text-emerald-700 font-medium hover:underline">
                See all →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPeople.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Ready to make a difference?</h2>
          <p className="text-gray-600 mb-8">
            For the price of a coffee a week, you can be part of someone's transformational journey.
          </p>
          <Link href="/people">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Find someone to support
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

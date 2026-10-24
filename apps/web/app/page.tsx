import Link from 'next/link'
import {
  Home,
  HeartPulse,
  GraduationCap,
  Briefcase,
  KeyRound,
  ShieldCheck,
  Eye,
  MapPin,
  Smartphone,
  Bell,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import PersonCard from '@/components/PersonCard'
import DonorGrid from '@/components/landing/DonorGrid'
import ImpactCalculator from '@/components/landing/ImpactCalculator'
import { demoPeople } from '@/lib/demo-data'

// Example monthly budget for one person — 100 donors × $30
const budget = [
  { label: 'Housing (private room + utilities)', amount: 1400, color: 'bg-emerald-600' },
  { label: 'Food & essentials', amount: 450, color: 'bg-emerald-400' },
  { label: 'Counselling & health', amount: 350, color: 'bg-teal-500' },
  { label: 'Job training & certifications', amount: 350, color: 'bg-cyan-500' },
  { label: 'Caseworker support', amount: 250, color: 'bg-sky-500' },
  { label: 'Transit pass & phone', amount: 200, color: 'bg-indigo-400' },
]

const journey = [
  { month: 'Month 1', title: 'Keys in hand', text: 'Move into a safe, private room. Sleep. Breathe.', icon: KeyRound },
  { month: 'Month 2', title: 'Health & documents', text: 'Doctor, counselling, ID, bank account, phone.', icon: HeartPulse },
  { month: 'Months 3–5', title: 'Training', text: 'Certifications, bridging programs, or job search.', icon: GraduationCap },
  { month: 'Months 6–9', title: 'Steady income', text: 'A real job and a growing savings cushion.', icon: Briefcase },
  { month: 'Month 12', title: 'Independent', text: 'Paying their own rent. Journey complete.', icon: Home },
]

const faqs = [
  {
    q: 'Where exactly does my $30 go?',
    a: 'Into one person’s 12-month program: housing, food, health, training and caseworker support. We publish how the money is spent so donors always know.',
  },
  {
    q: 'Why exactly 100 donors?',
    a: '100 × $30 = $3,000/month — enough to cover a full month of stability in Toronto. Capping at 100 keeps every donor meaningful and lets us move on to the next person.',
  },
  {
    q: 'How are people verified?',
    a: 'Every applicant is reviewed and approved by our team before their profile goes live. Nobody appears on Washomeless without approval.',
  },
  {
    q: 'Can I cancel?',
    a: 'Anytime, in one click. Payments are handled securely by Stripe.',
  },
  {
    q: 'What happens after 12 months?',
    a: 'The person graduates, their supporters get a final update, and you can choose to support someone new.',
  },
]

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredPeople } = await supabase
    .from('sponsored_people')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(3)

  const showingExamples = !featuredPeople || featuredPeople.length === 0
  const people = showingExamples ? demoPeople.slice(0, 3) : featuredPeople

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 text-white px-4 py-16 sm:py-24">
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs sm:text-sm text-emerald-100 mb-6">
              <MapPin className="h-3.5 w-3.5" /> Launching in Toronto
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              100 people.<br />
              $30 a month.<br />
              <span className="bg-gradient-to-r from-emerald-200 to-teal-100 bg-clip-text text-transparent">
                One life rebuilt.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-emerald-50/90 mb-8 max-w-xl">
              Washomeless turns 100 neighbours into a circle of support. Together you fund one
              person&apos;s 12-month journey from shelter to a home, a job, and independence — and you
              watch it happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/people">
                <Button size="lg" className="w-full sm:w-auto rounded-full bg-white text-emerald-900 hover:bg-emerald-50 text-base px-8 h-12">
                  Meet the people <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/apply">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white text-base px-8 h-12">
                  Apply for support
                </Button>
              </Link>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:200ms] lg:animate-float">
            <DonorGrid />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b bg-white px-4 py-5">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-600">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified profiles</span>
          <span className="flex items-center gap-2"><Eye className="h-4 w-4 text-emerald-600" /> Transparent budgets</span>
          <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-600" /> Real diary updates</span>
          <span className="flex items-center gap-2"><Bell className="h-4 w-4 text-emerald-600" /> Cancel anytime</span>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-2">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14 text-gray-900">Three steps. Zero middlemen.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '1', title: 'Choose someone', text: 'Read real stories from people in Toronto working to rebuild their lives. Pick who you want to champion.' },
              { n: '2', title: 'Give $30/month', text: 'Join up to 99 others. Together that’s $3,000 every month for housing, health, and training.' },
              { n: '3', title: 'Watch them rise', text: 'Get diary updates and milestone alerts as they get keys, start training, and land a job.' },
            ].map((step) => (
              <div key={step.n} className="rounded-3xl border bg-gradient-to-b from-white to-emerald-50/50 p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold mb-4">
                  {step.n}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Budget breakdown */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-2">Full transparency</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Where $3,000 a month goes</h2>
            <p className="text-gray-600 mb-6">
              An example monthly budget for one person in Toronto. Every dollar has a job.
            </p>
            <div className="flex h-4 w-full overflow-hidden rounded-full">
              {budget.map((b) => (
                <div key={b.label} className={b.color} style={{ width: `${(b.amount / 3000) * 100}%` }} />
              ))}
            </div>
          </div>
          <ul className="space-y-3">
            {budget.map((b) => (
              <li key={b.label} className="flex items-center justify-between rounded-2xl bg-white border px-4 py-3">
                <span className="flex items-center gap-3 text-sm text-gray-700">
                  <span className={`h-3 w-3 rounded-full ${b.color}`} />
                  {b.label}
                </span>
                <span className="font-semibold text-gray-900 tabular-nums">${b.amount.toLocaleString()}</span>
              </li>
            ))}
            <li className="flex items-center justify-between px-4 pt-2 text-sm">
              <span className="font-semibold text-gray-900">Total per month</span>
              <span className="font-bold text-emerald-700 text-lg">$3,000</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 12-month journey */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-2">The journey</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-14">12 months, step by step</h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {journey.map((step, i) => (
              <li key={step.title} className="relative rounded-3xl border p-5 bg-white hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400">0{i + 1}</span>
                </div>
                <p className="text-xs font-semibold text-emerald-600 mb-1">{step.month}</p>
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Featured People */}
      <section className="py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                {showingExamples ? 'Example profiles' : 'People to support'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Meet the people</h2>
              {showingExamples && (
                <p className="text-gray-600 mt-2 text-sm">
                  Illustrative examples of how profiles look — real, verified profiles are coming soon.
                </p>
              )}
            </div>
            <Link href="/people" className="text-emerald-700 font-medium hover:underline shrink-0">
              See all →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </div>
      </section>

      {/* Calculator + Toronto */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-2">Why Toronto, why now</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Over 15,000 people in Toronto are experiencing homelessness.
            </h2>
            <p className="text-gray-600 mb-4">
              Shelters are full and rent keeps rising. Many people are one stable address away from
              getting back to work. Washomeless gives them that address — funded by neighbours, not bureaucracy.
            </p>
            <p className="text-xs text-gray-400">Source: City of Toronto Street Needs Assessment, 2024.</p>
          </div>
          <ImpactCalculator />
        </div>
      </section>

      {/* iOS app teaser */}
      <section className="py-20 px-4 bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-200 mb-5">
              <Smartphone className="h-3.5 w-3.5" /> Coming soon to iPhone
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Their progress, in your pocket.</h2>
            <p className="text-gray-300 mb-6">
              Get a notification the moment the person you support gets their keys, finishes a course,
              or lands a job. Support someone new in two taps.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><Bell className="h-4 w-4 text-emerald-400" /> Milestone notifications</li>
              <li className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-emerald-400" /> Diary updates feed</li>
              <li className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-emerald-400" /> Apple Pay support in seconds</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <div className="w-64 rounded-[2.5rem] border-[10px] border-gray-800 bg-white text-gray-900 shadow-2xl overflow-hidden animate-float">
              <div className="h-6 bg-white flex justify-center items-end">
                <div className="h-4 w-20 rounded-full bg-gray-900" />
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-gray-400">Good morning</p>
                <p className="font-bold text-lg leading-tight">Your circle is growing</p>
                <div className="rounded-2xl bg-emerald-600 text-white p-3">
                  <p className="text-xs opacity-80">🎉 Milestone</p>
                  <p className="text-sm font-semibold">Marcus landed a trial shift!</p>
                </div>
                <div className="rounded-2xl border p-3">
                  <p className="text-xs text-gray-400 mb-1">Amina K. · 64/100</p>
                  <div className="h-1.5 rounded-full bg-gray-100"><div className="h-full w-[64%] rounded-full bg-emerald-500" /></div>
                </div>
                <div className="rounded-2xl border p-3">
                  <p className="text-xs text-gray-400 mb-1">Daniel R. · 41/100</p>
                  <div className="h-1.5 rounded-full bg-gray-100"><div className="h-full w-[41%] rounded-full bg-emerald-500" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-10">Questions</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border px-5 py-4 open:bg-emerald-50/50">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-900">
                  {f.q}
                  <span className="ml-4 text-emerald-600 transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-4">
        <div className="max-w-5xl mx-auto rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-center px-6 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Be one of the 100.</h2>
          <p className="text-emerald-50/90 mb-8 max-w-xl mx-auto">
            For about the price of a coffee a week, you become part of someone&apos;s comeback story.
          </p>
          <Link href="/people">
            <Button size="lg" className="rounded-full bg-white text-emerald-900 hover:bg-emerald-50 px-8 h-12 text-base">
              Find someone to support
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

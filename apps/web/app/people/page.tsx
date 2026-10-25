import { createClient } from '@/lib/supabase/server'
import PersonCard from '@/components/PersonCard'
import { demoPeople, isDemoId, withExamples } from '@/lib/demo-data'

export const revalidate = 60

export default async function PeoplePage() {
  const supabase = await createClient()

  const { data: people } = await supabase
    .from('sponsored_people')
    .select('*')
    .eq('status', 'active')
    .order('current_supporters', { ascending: false })

  const list = withExamples(people ?? [], demoPeople)
  const showingExamples = list.some((p) => isDemoId(p.id))

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">People to support</h1>
        <p className="text-gray-600 mt-2">
          Each person below is working toward stability. $30/month, up to 100 donors, 12-month program.
        </p>
      </div>

      {showingExamples && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Profiles marked &ldquo;Example profile&rdquo; are illustrations showing how Washomeless works — not real people.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  )
}

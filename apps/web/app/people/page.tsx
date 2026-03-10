import { createClient } from '@/lib/supabase/server'
import PersonCard from '@/components/PersonCard'

export const revalidate = 60

export default async function PeoplePage() {
  const supabase = await createClient()

  const { data: people } = await supabase
    .from('sponsored_people')
    .select('*')
    .eq('status', 'active')
    .order('current_supporters', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">People to support</h1>
        <p className="text-gray-600 mt-2">
          Each person below is working toward stability. $30/month, up to 100 donors, 12-month program.
        </p>
      </div>

      {!people || people.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No active profiles yet — check back soon!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  )
}

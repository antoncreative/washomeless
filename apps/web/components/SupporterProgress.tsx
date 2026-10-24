'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'
import type { SponsoredPerson } from '@/types/database'
import { isDemoId } from '@/lib/demo-data'

interface Props {
  person: SponsoredPerson
}

export default function SupporterProgress({ person }: Props) {
  const [current, setCurrent] = useState(person.current_supporters)
  const max = person.max_supporters
  const pct = Math.round((current / max) * 100)
  const spotsLeft = max - current

  useEffect(() => {
    if (isDemoId(person.id)) return

    const supabase = createClient()

    const channel = supabase
      .channel(`person-${person.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sponsored_people',
          filter: `id=eq.${person.id}`,
        },
        (payload) => {
          const updated = payload.new as SponsoredPerson
          setCurrent(updated.current_supporters)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [person.id])

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>{current} of {max} supporters</span>
        <span className="text-emerald-700">{pct}% funded</span>
      </div>
      <Progress value={pct} className="h-3" />
      <p className="text-sm text-gray-500">
        {spotsLeft === 0
          ? 'This person is fully supported!'
          : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} remaining`}
      </p>
    </div>
  )
}

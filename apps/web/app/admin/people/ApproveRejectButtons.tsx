'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { SponsoredPerson } from '@/types/database'

export default function ApproveRejectButtons({ person }: { person: SponsoredPerson }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function updateStatus(status: 'active' | 'rejected') {
    setLoading(status === 'active' ? 'approve' : 'reject')

    await supabase
      .from('sponsored_people')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', person.id)

    setLoading(null)
    router.refresh()
  }

  if (person.status === 'pending') {
    return (
      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => updateStatus('active')}
          disabled={loading !== null}
        >
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => updateStatus('rejected')}
          disabled={loading !== null}
        >
          {loading === 'reject' ? 'Rejecting…' : 'Reject'}
        </Button>
      </div>
    )
  }

  if (person.status === 'active') {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-200 hover:bg-red-50 shrink-0"
        onClick={() => updateStatus('rejected')}
        disabled={loading !== null}
      >
        {loading === 'reject' ? 'Revoking…' : 'Revoke'}
      </Button>
    )
  }

  return null
}

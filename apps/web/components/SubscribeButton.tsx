'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  personId: string
  isFull: boolean
  isAuthenticated: boolean
}

export default function SubscribeButton({ personId, isFull, isAuthenticated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSupport() {
    if (!isAuthenticated) {
      window.location.href = `/auth/login?redirectTo=/people/${personId}`
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  if (isFull) {
    return (
      <div className="text-center py-3 px-4 bg-gray-100 rounded-lg text-sm text-gray-600">
        This person is fully supported — check back if a spot opens up.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSupport}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-base py-6"
      >
        {loading ? 'Redirecting to checkout…' : 'Support this person — $30/mo'}
      </Button>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <p className="text-xs text-gray-500 text-center">
        Secure payment via Stripe. Cancel anytime.
      </p>
    </div>
  )
}

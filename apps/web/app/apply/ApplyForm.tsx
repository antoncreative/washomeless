'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const MIN_STORY_LENGTH = 100

export default function ApplyForm({ userId }: { userId: string }) {
  const [name, setName] = useState('')
  const [neighbourhood, setNeighbourhood] = useState('')
  const [story, setStory] = useState('')
  const [goal, setGoal] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (story.trim().length < MIN_STORY_LENGTH) {
      setError(`Please write at least ${MIN_STORY_LENGTH} characters about your situation.`)
      return
    }

    setLoading(true)

    const fullStory = goal.trim()
      ? `${story.trim()}\n\nWhat I want to achieve in 12 months: ${goal.trim()}`
      : story.trim()

    const { error: insertError } = await supabase.from('sponsored_people').insert({
      user_id: userId,
      name: name.trim(),
      city: neighbourhood.trim() ? `Toronto · ${neighbourhood.trim()}` : 'Toronto',
      story: fullStory,
    })

    if (insertError) {
      setError(insertError.code === '23505' ? 'You have already applied.' : insertError.message)
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border p-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name shown on your profile</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name and last initial, e.g. Marcus T."
          required
          maxLength={60}
        />
        <p className="text-xs text-gray-500">You don&apos;t have to use your full name.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="neighbourhood">Neighbourhood <span className="text-gray-400 font-normal">(optional)</span></Label>
        <Input
          id="neighbourhood"
          value={neighbourhood}
          onChange={(e) => setNeighbourhood(e.target.value)}
          placeholder="e.g. Parkdale, Scarborough, Downtown East"
          maxLength={60}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="story">Your story</Label>
        <Textarea
          id="story"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="What led to your situation, what you're good at, and what you need to get back on your feet."
          rows={7}
          required
        />
        <p className="text-xs text-gray-500">{story.trim().length} / {MIN_STORY_LENGTH} characters minimum</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal">What do you want to achieve in 12 months? <span className="text-gray-400 font-normal">(optional)</span></Label>
        <Input
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Finish my electrician pre-apprenticeship and rent my own place"
          maxLength={200}
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 accent-emerald-600"
          required
        />
        <span>
          I understand my story will be shown publicly once approved, and I agree to share short updates
          (text, photo or voice) about twice a week with my supporters.
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={loading || !agreed} className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-8">
        {loading ? 'Submitting…' : 'Submit application'}
      </Button>
    </form>
  )
}

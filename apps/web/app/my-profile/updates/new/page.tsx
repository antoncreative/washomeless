'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewUpdatePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Get the person_id for this user
    const { data: person } = await supabase
      .from('sponsored_people')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (!person || person.status !== 'active') {
      setError('Your profile is not active.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('diary_updates').insert({
      person_id: person.id,
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl.trim() || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/my-profile')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Post an update</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Got my first job interview!"
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Update</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share how things are going…"
                rows={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Posting…' : 'Post update'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/my-profile')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

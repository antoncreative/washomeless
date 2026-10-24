'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Type, Camera, Mic, Square, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UPDATE_PROMPTS } from '@/lib/updates'

type Kind = 'text' | 'photo' | 'voice'

const MAX_RECORDING_SECONDS = 120
const MAX_FILE_BYTES = 15 * 1024 * 1024

const kinds: { id: Kind; label: string; icon: typeof Type }[] = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'photo', label: 'Photo', icon: Camera },
  { id: 'voice', label: 'Voice', icon: Mic },
]

const defaultTitles: Record<Kind, string> = {
  text: 'Update',
  photo: 'Photo update',
  voice: 'Voice note',
}

function pickAudioMimeType() {
  if (typeof MediaRecorder === 'undefined') return ''
  // AAC in MP4 first: it plays everywhere, including the iOS app. WebM is a last resort.
  for (const type of ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/webm', 'audio/ogg']) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

export default function NewUpdatePage() {
  const [kind, setKind] = useState<Kind>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [audio, setAudio] = useState<Blob | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const recorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (recording && seconds >= MAX_RECORDING_SECONDS) stopRecording()
  }, [recording, seconds])

  function choosePhoto(file: File | undefined) {
    setError('')
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      setError('That photo is too large (max 15 MB).')
      return
    }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = pickAudioMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
        setAudio(blob)
        setAudioPreview(URL.createObjectURL(blob))
      }

      recorderRef.current = recorder
      recorder.start()
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setError('Could not access the microphone. Please allow microphone access and try again.')
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    setRecording(false)
  }

  function resetRecording() {
    setAudio(null)
    setAudioPreview(null)
    setSeconds(0)
  }

  async function upload(userId: string, file: Blob, ext: string) {
    const path = `${userId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('diary-media')
      .upload(path, file, { contentType: file.type.split(';')[0] })
    if (uploadError) throw uploadError
    return supabase.storage.from('diary-media').getPublicUrl(path).data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (kind === 'text' && !content.trim()) return setError('Write a few words first.')
    if (kind === 'photo' && !photo) return setError('Choose a photo first.')
    if (kind === 'voice' && !audio) return setError('Record a voice note first.')

    setLoading(true)

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

    try {
      let imageUrl: string | null = null
      let audioUrl: string | null = null

      if (kind === 'photo' && photo) {
        const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
        imageUrl = await upload(user.id, photo, ext)
      }
      if (kind === 'voice' && audio) {
        const ext = audio.type.includes('mp4') ? 'm4a' : audio.type.includes('ogg') ? 'ogg' : 'webm'
        audioUrl = await upload(user.id, audio, ext)
      }

      const { error: insertError } = await supabase.from('diary_updates').insert({
        person_id: person.id,
        kind,
        title: title.trim() || defaultTitles[kind],
        content: content.trim(),
        image_url: imageUrl,
        audio_url: audioUrl,
      })
      if (insertError) throw insertError

      router.push('/my-profile')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.')
      setLoading(false)
    }
  }

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Post an update</CardTitle>
          <p className="text-sm text-gray-500">
            A sentence, a photo, or a quick voice note — whatever is easiest. Your supporters love hearing from you.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-100 p-1">
              {kinds.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                    kind === k.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <k.icon className="h-4 w-4" /> {k.label}
                </button>
              ))}
            </div>

            {kind === 'photo' && (
              <div className="space-y-2">
                <Label htmlFor="photo">Photo</Label>
                {photoPreview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="" className="w-full max-h-80 object-cover rounded-xl" />
                    <Button type="button" size="sm" variant="outline" className="absolute top-2 right-2 bg-white" onClick={() => { setPhoto(null); setPhotoPreview(null) }}>
                      Change
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="photo" className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-12 text-gray-500 cursor-pointer hover:border-emerald-400 hover:text-emerald-700">
                    <Camera className="h-8 w-8" />
                    <span className="text-sm">Take or choose a photo</span>
                  </label>
                )}
                <input id="photo" type="file" accept="image/*" className="hidden" onChange={(e) => choosePhoto(e.target.files?.[0])} />
              </div>
            )}

            {kind === 'voice' && (
              <div className="rounded-xl border p-6 flex flex-col items-center gap-4">
                {audioPreview ? (
                  <>
                    <audio src={audioPreview} controls className="w-full" />
                    <Button type="button" variant="outline" size="sm" onClick={resetRecording}>
                      <RotateCcw className="h-4 w-4 mr-1" /> Record again
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={recording ? stopRecording : startRecording}
                      className={`h-20 w-20 rounded-full flex items-center justify-center text-white transition-colors ${
                        recording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                      aria-label={recording ? 'Stop recording' : 'Start recording'}
                    >
                      {recording ? <Square className="h-7 w-7" /> : <Mic className="h-8 w-8" />}
                    </button>
                    <p className="text-sm text-gray-500 tabular-nums">
                      {recording ? `Recording… ${mmss} / 2:00` : 'Tap to record (up to 2 minutes)'}
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Headline {kind !== 'text' && <span className="text-gray-400 font-normal">(optional)</span>}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Got my first job interview!"
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                {kind === 'text' ? 'Update' : 'Caption'} {kind !== 'text' && <span className="text-gray-400 font-normal">(optional)</span>}
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share how things are going…"
                rows={kind === 'text' ? 6 : 3}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {UPDATE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setContent((c) => (c ? `${c}\n\n${p} ` : `${p} `))}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800 hover:bg-emerald-100"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || recording}
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

'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const SIZE = 512

// Center-crops to a square and shrinks to 512px JPEG, so uploads stay small and look sharp everywhere.
async function toSquareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  canvas.getContext('2d')!.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    SIZE,
    SIZE
  )
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', 0.85)
  )
}

export default function AvatarUpload({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  async function upload(file: File | undefined) {
    if (!file) return
    setError('')
    setBusy(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please log in again.')

      const blob = await toSquareJpeg(file)
      const path = `${user.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg' })
      if (uploadError) throw uploadError

      const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
      const { error: saveError } = await supabase.rpc('set_my_avatar', { p_url: url })
      if (saveError) throw saveError
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed — please try again.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function remove() {
    setError('')
    setBusy(true)
    const { error: saveError } = await supabase.rpc('set_my_avatar', { p_url: null })
    if (saveError) setError(saveError.message)
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="group relative rounded-full"
        aria-label="Change profile photo"
      >
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatarUrl ?? undefined} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-600 text-white text-2xl font-bold">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
          {busy ? <span className="text-xs">Saving…</span> : <Camera className="h-6 w-6" />}
        </span>
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white">
          <Camera className="h-3.5 w-3.5" />
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      {avatarUrl && (
        <button type="button" onClick={remove} disabled={busy} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600">
          <Trash2 className="h-3 w-3" /> Remove photo
        </button>
      )}
      {error && <p className="text-xs text-red-600 max-w-[16rem]">{error}</p>}
    </div>
  )
}

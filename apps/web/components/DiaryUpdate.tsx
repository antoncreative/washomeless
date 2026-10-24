import { Type, Camera, Mic } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import VoicePlayer from '@/components/VoicePlayer'
import type { DiaryUpdate as DiaryUpdateType } from '@/types/database'

const kindMeta = {
  text: { label: 'Update', icon: Type },
  photo: { label: 'Photo', icon: Camera },
  voice: { label: 'Voice note', icon: Mic },
}

export default function DiaryUpdate({ update }: { update: DiaryUpdateType }) {
  const date = new Date(update.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const meta = kindMeta[update.kind ?? 'text']

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              <meta.icon className="h-3 w-3" /> {meta.label}
            </span>
            <CardTitle className="text-base">{update.title}</CardTitle>
          </div>
          <span className="text-xs text-gray-400 shrink-0">{date}</span>
        </div>
      </CardHeader>
      <CardContent>
        {update.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={update.image_url}
            alt=""
            className="w-full rounded-md mb-3 object-cover max-h-96"
          />
        )}
        {update.audio_url && (
          <div className="mb-3">
            <VoicePlayer src={update.audio_url} seed={update.id} />
          </div>
        )}
        {update.kind === 'voice' && !update.audio_url && (
          <div className="mb-3 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-4 text-white">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/90 text-teal-700">
              <Mic className="h-5 w-5" />
            </span>
            <div className="flex flex-1 items-center gap-[2px] h-9" aria-hidden>
              {Array.from({ length: 48 }, (_, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-full bg-white/45"
                  style={{ height: `${20 + Math.abs(Math.sin(i * 1.7) * Math.sin((Math.PI * (i + 1)) / 49)) * 80}%` }}
                />
              ))}
            </div>
            <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">Example</span>
          </div>
        )}
        {update.content && (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {update.kind === 'voice' && !update.audio_url && <span className="text-gray-400">Transcript: </span>}
            {update.content}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

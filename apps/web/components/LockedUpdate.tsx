import { Type, Camera, Mic, Lock } from 'lucide-react'
import type { UpdateTeaser } from '@/types/database'

const kindMeta = {
  text: { label: 'Update', icon: Type },
  photo: { label: 'Photo', icon: Camera },
  voice: { label: 'Voice note', icon: Mic },
}

// What visitors see instead of an update: type, headline and date — the content stays private.
export default function LockedUpdate({ teaser }: { teaser: UpdateTeaser }) {
  const meta = kindMeta[teaser.kind ?? 'text']
  const date = new Date(teaser.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            <meta.icon className="h-3 w-3" /> {meta.label}
          </span>
          <p className="font-semibold text-gray-900">{teaser.title}</p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{date}</span>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
        <Lock className="h-4 w-4 shrink-0" />
        <span>Only supporters can see this {meta.label.toLowerCase()}.</span>
      </div>
    </div>
  )
}

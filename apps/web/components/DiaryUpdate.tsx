import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DiaryUpdate as DiaryUpdateType } from '@/types/database'

export default function DiaryUpdate({ update }: { update: DiaryUpdateType }) {
  const date = new Date(update.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{update.title}</CardTitle>
          <span className="text-xs text-gray-400 shrink-0">{date}</span>
        </div>
      </CardHeader>
      <CardContent>
        {update.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={update.image_url}
            alt=""
            className="w-full rounded-md mb-3 object-cover max-h-64"
          />
        )}
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{update.content}</p>
      </CardContent>
    </Card>
  )
}

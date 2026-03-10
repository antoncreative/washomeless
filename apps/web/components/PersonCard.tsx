import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import type { SponsoredPerson } from '@/types/database'

export default function PersonCard({ person }: { person: SponsoredPerson }) {
  const pct = Math.round((person.current_supporters / person.max_supporters) * 100)
  const spotsLeft = person.max_supporters - person.current_supporters
  const isFull = spotsLeft === 0

  return (
    <Link href={`/people/${person.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Avatar>
            <AvatarImage src={person.avatar_url ?? undefined} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
              {person.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{person.name}</p>
            <p className="text-sm text-gray-500">{person.city}</p>
          </div>
          {isFull ? (
            <Badge variant="secondary">Full</Badge>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              {spotsLeft} left
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">{person.story}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{person.current_supporters} supporters</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

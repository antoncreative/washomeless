import type { Milestone } from '@/types/database'

export default function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  const sorted = [...milestones].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <ol className="relative border-l border-gray-200 space-y-6 ml-3">
      {sorted.map((m) => (
        <li key={m.id} className="ml-6">
          <span
            className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${
              m.completed ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            {m.completed ? (
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span className="h-2 w-2 rounded-full bg-gray-400" />
            )}
          </span>
          <div>
            <p className={`font-medium text-sm ${m.completed ? 'text-emerald-700' : 'text-gray-700'}`}>
              {m.title}
            </p>
            {m.description && (
              <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
            )}
            {m.completed && m.completed_at && (
              <p className="text-xs text-emerald-600 mt-0.5">
                Completed {new Date(m.completed_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

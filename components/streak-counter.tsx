import { Flame } from "lucide-react"

export function StreakCounter({ streak }: { streak: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5">
      <Flame className="h-4 w-4 text-primary" aria-hidden="true" />
      <span className="text-sm font-semibold">
        {streak} day streak
      </span>
    </div>
  )
}

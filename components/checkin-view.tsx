"use client"

import type React from "react"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MOODS = [
  { value: "great", label: "Great" },
  { value: "good", label: "Good" },
  { value: "okay", label: "Okay" },
  { value: "low", label: "Low" },
]

export function CheckinView({
  onCheckIn,
  checkedInToday,
}: {
  onCheckIn: () => void
  checkedInToday: boolean
}) {
  const [mood, setMood] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mood) return
    onCheckIn()
    setSubmitted(true)
  }

  return (
    <section aria-labelledby="checkin-heading" className="flex flex-col gap-6">
      <div>
        <h1 id="checkin-heading" className="text-2xl font-semibold tracking-tight">
          Daily Check-in
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reflect on your day and keep your streak alive.
        </p>
      </div>

      {submitted || checkedInToday ? (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-8 text-center">
          <p className="text-lg font-semibold text-foreground">You&apos;re checked in for today</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Come back tomorrow to keep the momentum going.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium">How are you feeling today?</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  aria-pressed={mood === m.value}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                    mood === m.value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor="checkin-note" className="text-sm font-medium">
              Anything on your mind?
            </label>
            <Textarea
              id="checkin-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a short reflection (optional)..."
              className="min-h-28 resize-none bg-card"
            />
          </div>

          <Button type="submit" disabled={!mood} className="h-11">
            Complete check-in
          </Button>
        </form>
      )}
    </section>
  )
}

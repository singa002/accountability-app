"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export type Task = {
  id: string
  title: string
  done: boolean
}

export function TasksView({
  tasks,
  onAdd,
  onToggle,
  onDelete,
}: {
  tasks: Task[]
  onAdd: (title: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [value, setValue] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue("")
  }

  const remaining = tasks.filter((t) => !t.done).length

  return (
    <section aria-labelledby="tasks-heading" className="flex flex-col gap-6">
      <div>
        <h1 id="tasks-heading" className="text-2xl font-semibold tracking-tight">
          Tasks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {remaining === 0 ? "All done for today. Nice work." : `${remaining} task${remaining > 1 ? "s" : ""} left to do`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a new task..."
          aria-label="New task"
          className="h-11 bg-card"
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label="Add task">
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      <ul className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <li className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
            No tasks yet. Add your first one above.
          </li>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
          >
            <Checkbox
              id={`task-${task.id}`}
              checked={task.done}
              onCheckedChange={() => onToggle(task.id)}
              className="h-5 w-5"
            />
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                "flex-1 cursor-pointer text-sm leading-relaxed",
                task.done && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              aria-label={`Delete task: ${task.title}`}
              className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}

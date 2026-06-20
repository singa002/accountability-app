"use client"

import { CheckSquare, Repeat, ClipboardCheck, Flame, Wind } from "lucide-react"
import { cn } from "@/lib/utils"

export type View = "tasks" | "habits" | "checkin" | "vents"

const navItems: { id: View; label: string; icon: typeof CheckSquare }[] = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "habits", label: "Habits", icon: Repeat },
  { id: "checkin", label: "Check-in", icon: ClipboardCheck },
  { id: "vents", label: "Vents", icon: Wind },
]

export function AppSidebar({
  active,
  onChange,
}: {
  active: View
  onChange: (view: View) => void
}) {
  return (
    <>
      {/* Desktop: left rail */}
      <aside className="sticky top-0 hidden h-dvh w-20 flex-col items-center gap-2 border-r border-border bg-sidebar py-4 md:flex">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Flame className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Forge</span>
        </div>

        <nav className="flex flex-col items-center gap-2" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground transition-colors",
                  "hover:bg-secondary hover:text-foreground",
                  isActive && "bg-primary/15 text-primary hover:bg-primary/15 hover:text-primary",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Mobile: bottom navigation bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Main navigation"
      >
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-muted-foreground transition-colors",
                "hover:text-foreground",
                isActive && "text-primary",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-medium leading-none">{label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

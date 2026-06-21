"use client";

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Habit = {
  id: string;
  name: string;
  week: boolean[];
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function HabitsView({
  habits,
  onAdd,
  onToggleDay,
  onDelete,
}: {
  habits: Habit[];
  onAdd: (name: string) => void;
  onToggleDay: (id: string, dayIndex: number) => void;
  onDelete: (id: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  };

  return (
    <section aria-labelledby="habits-heading" className="flex flex-col gap-6">
      <div>
        <h1
          id="habits-heading"
          className="text-2xl font-semibold tracking-tight"
        >
          Habits
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your daily habits across the week.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a new habit..."
          aria-label="New habit"
          className="h-11 bg-card"
        />
        <Button
          type="button"
          size="icon"
          className="h-11 w-11 shrink-0 cursor-pointer"
          aria-label="Add habit"
          onClick={handleAdd}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <ul className="flex flex-col gap-2">
        {habits.length === 0 && (
          <li className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
            No habits yet. Add one to start building momentum.
          </li>
        )}
        {habits.map((habit) => {
          const completedThisWeek = habit.week.filter(Boolean).length;
          return (
            <li
              key={habit.id}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center justify-between gap-3 sm:flex-1">
                <div>
                  <p className="text-sm font-medium leading-relaxed">
                    {habit.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {completedThisWeek}/7 this week
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(habit.id)}
                  aria-label={`Delete habit: ${habit.name}`}
                  className="h-8 w-8 cursor-pointer text-muted-foreground transition-opacity hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1.5">
                {habit.week.map((done, i) => {
                  const today = new Date();
                  const d = new Date(today);
                  d.setDate(today.getDate() - (6 - i));
                  const todayDate = new Date();
                  const isToday = d.toDateString() === todayDate.toDateString();
                  const isFuture = d > todayDate;
                  const dayLabel = d.toLocaleDateString("en-US", {
                    weekday: "narrow",
                  });
                  const dateLabel = d.getDate();

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => !isFuture && onToggleDay(habit.id, i)}
                      disabled={isFuture}
                      aria-pressed={done}
                      className={cn(
                        "flex h-11 w-9 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border text-[10px] font-medium transition-colors",
                        isFuture &&
                          "cursor-not-allowed opacity-25 border-border bg-transparent",
                        !isFuture &&
                          done &&
                          "border-primary bg-primary text-primary-foreground",
                        !isFuture &&
                          !done &&
                          "border-border bg-secondary/40 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                        isToday &&
                          !done &&
                          "border-primary/50 ring-1 ring-primary/30",
                      )}
                    >
                      <span className="text-[9px] opacity-70">{dayLabel}</span>
                      <span>
                        {done ? <Check className="h-3 w-3" /> : dateLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

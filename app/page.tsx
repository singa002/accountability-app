"use client"

import { useState, useEffect } from "react"
import { AppSidebar, type View } from "@/components/app-sidebar"
import { StreakCounter } from "@/components/streak-counter"
import { TasksView, type Task } from "@/components/tasks-view"
import { HabitsView, type Habit } from "@/components/habits-view"
import { CheckinView } from "@/components/checkin-view"
import { VentsView, type Vent } from "@/components/vents-view"
import { createClient } from "@/lib/supabase"

export default function Page() {
  const supabase = createClient()
  const [view, setView] = useState<View>("tasks")
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [vents, setVents] = useState<Vent[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [streak, setStreak] = useState(0)
  const [checkedInToday, setCheckedInToday] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchTasks()
        fetchVents()
        fetchHabits()
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchTasks()
        fetchVents()
        fetchHabits()
      }
    })
  }, [])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      setTasks(data.map(t => ({ id: t.id, title: t.title, done: t.is_completed })))
    }
  }

  const fetchVents = async () => {
    const { data } = await supabase
      .from('vents')
      .select('*')
      .neq('status', 'burned')
      .order('created_at', { ascending: false })
    if (data) setVents(data)
  }

  const fetchHabits = async () => {
    const { data: habitData } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true })

    if (!habitData) return

    const today = new Date()
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })

    const { data: completions } = await supabase
      .from('habit_completions')
      .select('*')
      .in('completed_on', days)

    const mapped = habitData.map(h => ({
      id: h.id,
      name: h.name,
      week: days.map(day =>
        completions?.some(c => c.habit_id === h.id && c.completed_on === day) ?? false
      )
    }))

    setHabits(mapped)
  }

  const addTask = async (title: string) => {
    if (!user) return
    await supabase.from('tasks').insert({ title, user_id: user.id })
    fetchTasks()
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    await supabase.from('tasks').update({ is_completed: !task.done }).eq('id', id)
    fetchTasks()
  }

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  const addVent = async (content: string) => {
    if (!user) return
    await supabase.from('vents').insert({ content, user_id: user.id })
    fetchVents()
  }

  const burnVent = async (id: string) => {
    await supabase.from('vents').update({ status: 'burned' }).eq('id', id)
    fetchVents()
  }

  const lockVent = async (id: string) => {
    await supabase.from('vents').update({ status: 'locked' }).eq('id', id)
    fetchVents()
  }

  const unlockVent = async (id: string) => {
    await supabase.from('vents').update({ status: 'active' }).eq('id', id)
    fetchVents()
  }

  const addHabit = async (name: string) => {
    if (!user) return
    await supabase.from('habits').insert({ name, user_id: user.id })
    fetchHabits()
  }

  const toggleHabitDay = async (id: string, dayIndex: number) => {
    const today = new Date()
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - dayIndex))
    const dateStr = d.toISOString().split('T')[0]

    const habit = habits.find(h => h.id === id)
    if (!habit) return

    const isDone = habit.week[dayIndex]

    if (isDone) {
      await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', id)
        .eq('completed_on', dateStr)
    } else {
      await supabase
        .from('habit_completions')
        .insert({ habit_id: id, user_id: user.id, completed_on: dateStr })
    }

    fetchHabits()
  }

  const deleteHabit = async (id: string) => {
    await supabase.from('habits').delete().eq('id', id)
    fetchHabits()
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTasks([])
    setVents([])
    setHabits([])
  }

  const handleCheckIn = () => {
    if (checkedInToday) return
    setCheckedInToday(true)
    setStreak(s => s + 1)
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Forge</h1>
          <p className="text-muted-foreground mb-8">Build yourself. Burn what doesn't serve you.</p>
          <button
            onClick={signInWithGoogle}
            className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <AppSidebar active={view} onChange={setView} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-8 pb-28 sm:px-8 sm:py-12 md:pb-12">
          <header className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
            <div className="flex items-center gap-4">
              <StreakCounter streak={streak} />
              <button
                onClick={signOut}
                className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </header>

          {view === "tasks" && (
            <TasksView
              tasks={tasks}
              onAdd={addTask}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          )}
          {view === "habits" && (
            <HabitsView
              habits={habits}
              onAdd={addHabit}
              onToggleDay={toggleHabitDay}
              onDelete={deleteHabit}
            />
          )}
          {view === "checkin" && (
            <CheckinView
              onCheckIn={handleCheckIn}
              checkedInToday={checkedInToday}
            />
          )}
          {view === "vents" && (
            <VentsView
              vents={vents}
              onAdd={addVent}
              onBurn={burnVent}
              onLock={lockVent}
              onUnlock={unlockVent}
            />
          )}
        </div>
      </main>
    </div>
  )
}

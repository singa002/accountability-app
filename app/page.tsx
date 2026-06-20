"use client"

import { useState, useEffect } from "react"
import { AppSidebar, type View } from "@/components/app-sidebar"
import { StreakCounter } from "@/components/streak-counter"
import { TasksView, type Task } from "@/components/tasks-view"
import { HabitsView, type Habit } from "@/components/habits-view"
import { CheckinView } from "@/components/checkin-view"
import { VentsView, type Vent } from "@/components/vents-view"
import { createClient } from "@/lib/supabase"

const initialHabits: Habit[] = [
  { id: "1", name: "Morning workout", week: [true, true, false, true, true, false, false] },
  { id: "2", name: "Read 10 pages", week: [true, true, true, true, false, false, false] },
  { id: "3", name: "No screens after 10pm", week: [false, true, true, false, true, false, false] },
]

export default function Page() {
  const supabase = createClient()
  const [view, setView] = useState<View>("tasks")
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [vents, setVents] = useState<Vent[]>([])
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [streak, setStreak] = useState(5)
  const [checkedInToday, setCheckedInToday] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchTasks()
        fetchVents()
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchTasks()
        fetchVents()
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
  }

  let idCounter = 100
  const nextId = () => String(idCounter++)
  const addHabit = (name: string) =>
    setHabits((prev) => [...prev, { id: nextId(), name, week: Array(7).fill(false) }])
  const toggleHabitDay = (id: string, dayIndex: number) =>
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, week: h.week.map((d, i) => (i === dayIndex ? !d : d)) } : h,
      ),
    )
  const deleteHabit = (id: string) => setHabits((prev) => prev.filter((h) => h.id !== id))

  const handleCheckIn = () => {
    if (checkedInToday) return
    setCheckedInToday(true)
    setStreak((s) => s + 1)
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
              <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Sign out
              </button>
            </div>
          </header>

          {view === "tasks" && (
            <TasksView tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} />
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
            <CheckinView onCheckIn={handleCheckIn} checkedInToday={checkedInToday} />
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

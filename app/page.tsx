'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchTasks()
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchTasks()
    })
  }, [])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    setTasks(data || [])
  }

  const addTask = async () => {
    if (!newTask.trim()) return
    await supabase.from('tasks').insert({ title: newTask, user_id: user.id })
    setNewTask('')
    fetchTasks()
  }

  const toggleTask = async (task: any) => {
    await supabase
      .from('tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', task.id)
    fetchTasks()
  }

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Accountability App</h1>
          <p className="text-gray-400 mb-8">Sign in to get started</p>
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
    <div className="min-h-screen bg-gray-950 text-white p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <button onClick={signOut} className="text-gray-400 hover:text-white text-sm cursor-pointer">
          Sign out
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a new task..."
          className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTask}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold cursor-pointer"
        >
          Add
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 bg-gray-800 px-4 py-3 rounded-lg">
            <input
              type="checkbox"
              checked={task.is_completed}
              onChange={() => toggleTask(task)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className={`flex-1 ${task.is_completed ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-gray-500 hover:text-red-400 text-sm cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-gray-500 text-center py-8">No tasks yet. Add one above!</p>
        )}
      </div>
    </div>
  )
}

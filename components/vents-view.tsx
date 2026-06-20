"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Flame, Lock, Wind } from "lucide-react"

export type Vent = {
  id: string
  content: string
  status: "active" | "locked" | "burned"
  created_at: string
}

function AshParticles({ active, triggerAt }: { active: boolean; triggerAt: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return

    const delay = setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      const particles: {
        x: number
        y: number
        vx: number
        vy: number
        life: number
        maxLife: number
        size: number
        rotation: number
        rotSpeed: number
      }[] = []

      // Spawn ash particles across the middle of the card
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height * 0.3 + Math.random() * canvas.height * 0.5,
          vx: (Math.random() - 0.5) * 3,
          vy: -(Math.random() * 3 + 1),
          life: 0,
          maxLife: Math.random() * 60 + 40,
          size: Math.random() * 5 + 2,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.2,
        })
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx + Math.sin(p.life * 0.1) * 0.5
          p.y += p.vy
          p.vy *= 0.98
          p.rotation += p.rotSpeed
          p.life++

          const progress = p.life / p.maxLife
          const alpha = 1 - progress

          ctx.save()
          ctx.globalAlpha = alpha
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation)

          // Ash flake shape
          const gray = Math.floor(80 + Math.random() * 60)
          ctx.fillStyle = `rgb(${gray},${gray},${gray})`
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2)
          ctx.fill()

          ctx.restore()

          if (p.life >= p.maxLife) particles.splice(i, 1)
        }

        if (particles.length > 0) {
          animRef.current = requestAnimationFrame(animate)
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }, triggerAt)

    return () => {
      clearTimeout(delay)
      cancelAnimationFrame(animRef.current)
    }
  }, [active, triggerAt])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-xl z-20"
    />
  )
}

export function VentsView({
  vents,
  onAdd,
  onBurn,
  onLock,
}: {
  vents: Vent[]
  onAdd: (content: string) => void
  onBurn: (id: string) => void
  onLock: (id: string) => void
}) {
  const [value, setValue] = useState("")
  const [burningId, setBurningId] = useState<string | null>(null)

  const handleBurn = (id: string) => {
    setBurningId(id)
    setTimeout(() => {
      onBurn(id)
      setBurningId(null)
    }, 3500)
  }

  const activeVents = vents.filter(v => v.status === "active")
  const lockedVents = vents.filter(v => v.status === "locked")

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write it. Burn it. Lock it away. Let it go.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What's on your mind? Get it out..."
          className="min-h-[120px] w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={() => {
            if (!value.trim()) return
            onAdd(value.trim())
            setValue("")
          }}
          className="self-end rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          Release it
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {activeVents.map((vent) => {
            const isBurning = burningId === vent.id

            return (
              <motion.div
                key={vent.id}
                layout
                initial={{ opacity: 1 }}
                animate={isBurning ? { opacity: [1, 1, 1, 0] } : { opacity: 1 }}
                transition={isBurning ? { duration: 3.5, times: [0, 0.5, 0.85, 1] } : {}}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="relative overflow-hidden rounded-xl border bg-card px-4 py-3 min-h-[80px]"
                style={isBurning ? {
                  borderColor: "rgba(255,100,0,0.6)",
                  boxShadow: "0 0 30px rgba(255,80,0,0.25)"
                } : {}}
              >
                {/* Fire video centered over card */}
                {isBurning && (
                  <video
                    src="/fire.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-xl z-10"
                    style={{ mixBlendMode: "screen", objectPosition: "center" }}
                  />
                )}

                {/* Ash particles after fire */}
                <AshParticles active={isBurning} triggerAt={1500} />

                <motion.p
                  className="text-sm leading-relaxed pr-20 relative z-0"
                  animate={isBurning ? {
                    opacity: [1, 1, 0.6, 0],
                    color: ["#ffffff", "#ffcc00", "#ff4400", "transparent"],
                    textShadow: [
                      "none",
                      "0 0 8px #ffcc00",
                      "0 0 16px #ff4400",
                      "none"
                    ]
                  } : { opacity: 1, color: "#ffffff" }}
                  transition={isBurning ? { duration: 2.5, times: [0, 0.3, 0.7, 1] } : {}}
                >
                  {vent.content}
                </motion.p>

                {!isBurning && (
                  <div className="absolute right-3 top-3 flex gap-2">
                    <button
                      onClick={() => onLock(vent.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                      title="Lock away"
                    >
                      <Lock className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleBurn(vent.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-orange-500/20 hover:text-orange-400 cursor-pointer"
                      title="Burn it"
                    >
                      <Flame className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {activeVents.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
            <Wind className="mx-auto mb-2 h-6 w-6 opacity-40" />
            Nothing to vent. You're good.
          </div>
        )}
      </div>

      {lockedVents.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Lock className="h-4 w-4" /> Locked Away
          </h2>
          {lockedVents.map((vent) => (
            <div
              key={vent.id}
              className="rounded-xl border border-border bg-card/30 px-4 py-3 blur-[3px] hover:blur-none transition-all duration-500 cursor-pointer"
            >
              <p className="text-sm leading-relaxed text-muted-foreground">{vent.content}</p>
              <button
                onClick={() => handleBurn(vent.id)}
                className="mt-2 flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 cursor-pointer"
              >
                <Flame className="h-3 w-3" /> Burn when ready
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

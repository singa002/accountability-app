"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Flame, Lock, Wind, LockOpen } from "lucide-react"

export type Vent = {
  id: string
  content: string
  status: "active" | "locked" | "burned"
  created_at: string
}

function BurnEffect({ active, width, height, onComplete }: {
  active: boolean
  width: number
  height: number
  onComplete: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = width
    canvas.height = height

    const duration = 2800
    const start = performance.now()
    let completed = false

    type Particle = {
      x: number
      y: number
      vx: number
      vy: number
      life: number
      maxLife: number
      size: number
      color: string
    }

    const particles: Particle[] = []
    const ashParticles: Particle[] = []

    const fireColors = [
      "#ff2200", "#ff4400", "#ff6600",
      "#ff8800", "#ffaa00", "#ffcc00", "#fff200"
    ]
    const ashColors = ["#333", "#444", "#555", "#666", "#777"]

    const draw = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)

      ctx.clearRect(0, 0, width, height)

      // Burn line moves bottom to top
      const burnY = height - (height + 20) * progress

      // Spawn fire particles along burn line
      if (progress < 0.98) {
        const spread = width * 0.8
        const spawnX = (width - spread) / 2
        for (let i = 0; i < 12; i++) {
          particles.push({
            x: spawnX + Math.random() * spread,
            y: burnY + Math.random() * 15,
            vx: (Math.random() - 0.5) * 2.5,
            vy: -(Math.random() * 4 + 1.5),
            life: 0,
            maxLife: Math.random() * 25 + 15,
            size: Math.random() * 3 + 1,
            color: fireColors[Math.floor(Math.random() * fireColors.length)]
          })
        }

        // Spawn ash particles from burned area
        if (Math.random() > 0.4) {
          for (let i = 0; i < 3; i++) {
            ashParticles.push({
              x: Math.random() * width,
              y: burnY + Math.random() * (height - burnY),
              vx: (Math.random() - 0.5) * 1.5,
              vy: -(Math.random() * 1.2 + 0.3),
              life: 0,
              maxLife: Math.random() * 60 + 40,
              size: Math.random() * 3 + 1,
              color: ashColors[Math.floor(Math.random() * ashColors.length)]
            })
          }
        }
      }

      // Draw char overlay on burned area
      if (burnY < height) {
        const charGrad = ctx.createLinearGradient(0, burnY - 10, 0, height)
        charGrad.addColorStop(0, "rgba(0,0,0,0)")
        charGrad.addColorStop(0.08, "rgba(10,5,0,0.6)")
        charGrad.addColorStop(0.25, "rgba(5,2,0,0.85)")
        charGrad.addColorStop(1, "rgba(0,0,0,0.97)")
        ctx.fillStyle = charGrad
        ctx.fillRect(0, burnY, width, height - burnY)
      }

      // Draw fire particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx + Math.sin(p.life * 0.4) * 0.6
        p.y += p.vy
        p.vy *= 0.96
        p.life++

        const t = p.life / p.maxLife
        const alpha = 1 - t
        const size = p.size * (1 - t * 0.5)

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.shadowBlur = 6
        ctx.shadowColor = p.color
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        if (p.life >= p.maxLife) particles.splice(i, 1)
      }

      // Draw ash particles
      for (let i = ashParticles.length - 1; i >= 0; i--) {
        const p = ashParticles[i]
        p.x += p.vx + Math.sin(p.life * 0.15) * 0.3
        p.y += p.vy
        p.life++

        const t = p.life / p.maxLife
        const alpha = (1 - t) * 0.8

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.4, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        if (p.life >= p.maxLife) ashParticles.splice(i, 1)
      }

      // Glow at burn line
      if (progress < 0.98 && burnY < height) {
        const glowGrad = ctx.createLinearGradient(0, burnY - 25, 0, burnY + 15)
        glowGrad.addColorStop(0, "rgba(255,120,0,0)")
        glowGrad.addColorStop(0.5, "rgba(255,160,0,0.35)")
        glowGrad.addColorStop(1, "rgba(255,60,0,0)")
        ctx.fillStyle = glowGrad
        ctx.fillRect(0, burnY - 25, width, 40)
      }

      if (progress < 1 || particles.length > 0 || ashParticles.length > 0) {
        animRef.current = requestAnimationFrame(draw)
      } else if (!completed) {
        completed = true
        onComplete()
      }
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [active, width, height, onComplete])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none rounded-xl z-10"
      style={{ width, height }}
    />
  )
}

export function VentsView({
  vents,
  onAdd,
  onBurn,
  onLock,
  onUnlock,
}: {
  vents: Vent[]
  onAdd: (content: string) => void
  onBurn: (id: string) => void
  onLock: (id: string) => void
  onUnlock: (id: string) => void
}) {
  const [value, setValue] = useState("")
  const [burningId, setBurningId] = useState<string | null>(null)
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const handleBurn = (id: string) => {
    setBurningId(id)
  }

  const handleBurnComplete = (id: string) => {
    onBurn(id)
    setBurningId(null)
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
            const cardEl = cardRefs.current[vent.id]
            const cardWidth = cardEl?.offsetWidth || 600
            const cardHeight = cardEl?.offsetHeight || 80

            return (
              <motion.div
                key={vent.id}
                ref={(el) => { cardRefs.current[vent.id] = el }}
                layout
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                className="relative overflow-hidden rounded-xl border bg-card px-4 py-3 min-h-[80px]"
                style={isBurning ? {
                  borderColor: "rgba(255,100,0,0.5)",
                  boxShadow: "0 0 20px rgba(255,80,0,0.2)"
                } : {}}
              >
                <BurnEffect
                  active={isBurning}
                  width={cardWidth}
                  height={cardHeight}
                  onComplete={() => handleBurnComplete(vent.id)}
                />

                <motion.p
                  className="text-sm leading-relaxed pr-20 relative z-0"
                  animate={isBurning ? {
                    opacity: [1, 1, 0.5, 0],
                    color: ["#ffffff", "#ffcc00", "#ff4400", "transparent"]
                  } : { opacity: 1 }}
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
              ref={(el) => { cardRefs.current[vent.id] = el }}
              className="rounded-xl border border-border bg-card/30 px-4 py-4 blur-[3px] hover:blur-none transition-all duration-500"
            >
              <p className="text-sm leading-relaxed text-muted-foreground pr-20">
                {vent.content}
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => onUnlock(vent.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <LockOpen className="h-3 w-3" /> Unlock
                </button>
                <button
                  onClick={() => handleBurn(vent.id)}
                  className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 cursor-pointer"
                >
                  <Flame className="h-3 w-3" /> Burn it
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

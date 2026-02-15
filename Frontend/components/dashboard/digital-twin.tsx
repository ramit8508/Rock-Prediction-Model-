"use client"

import { useEffect, useRef, useState } from "react"
import { Maximize2, Layers, Eye, MapPin } from "lucide-react"
import type { LocationData } from "./location-selector"

interface DigitalTwinProps {
  location: LocationData
}

const SECTORS = [
  { id: "A1", x: 20, y: 25, risk: 0.87, label: "North Wall" },
  { id: "A2", x: 45, y: 40, risk: 0.34, label: "East Bench" },
  { id: "B1", x: 65, y: 55, risk: 0.62, label: "South Face" },
  { id: "B2", x: 30, y: 65, risk: 0.15, label: "West Ramp" },
  { id: "C1", x: 75, y: 30, risk: 0.91, label: "Crest Zone" },
  { id: "C2", x: 55, y: 70, risk: 0.48, label: "Haul Road" },
]

function getRiskColor(risk: number): string {
  if (risk >= 0.8) return "hsl(0 72% 51%)"
  if (risk >= 0.6) return "hsl(38 92% 50%)"
  if (risk >= 0.4) return "hsl(38 92% 70%)"
  return "hsl(152 69% 41%)"
}

function getRiskLabel(risk: number): string {
  if (risk >= 0.8) return "CRITICAL"
  if (risk >= 0.6) return "HIGH"
  if (risk >= 0.4) return "MODERATE"
  return "LOW"
}

export function DigitalTwin({ location }: DigitalTwinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredSector, setHoveredSector] = useState<string | null>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }
    resize()

    const draw = () => {
      const rect = container.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      timeRef.current += 0.01

      ctx.clearRect(0, 0, w, h)

      // Background gradient (mine pit shape)
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.6)
      bgGrad.addColorStop(0, "hsl(215 20% 10%)")
      bgGrad.addColorStop(0.5, "hsl(222 47% 8%)")
      bgGrad.addColorStop(1, "hsl(222 47% 5%)")
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      // Draw topographic contour lines
      ctx.strokeStyle = "hsla(215, 20%, 24%, 0.3)"
      ctx.lineWidth = 0.5
      for (let i = 0; i < 12; i++) {
        const centerX = w * 0.5 + Math.sin(i * 0.8) * 20
        const centerY = h * 0.5 + Math.cos(i * 0.6) * 15
        const radiusX = (w * 0.08) * (i + 1)
        const radiusY = (h * 0.06) * (i + 1)
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, radiusX, radiusY, -0.2, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw grid lines
      ctx.strokeStyle = "hsla(215, 20%, 20%, 0.15)"
      ctx.lineWidth = 0.5
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Draw heatmap zones for each sector
      SECTORS.forEach((sector) => {
        const sx = (sector.x / 100) * w
        const sy = (sector.y / 100) * h
        const radius = 40 + sector.risk * 40
        const pulseRadius = radius + Math.sin(timeRef.current * 2 + sector.risk * 5) * 8

        // Heatmap glow
        const heatGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, pulseRadius)
        const color = getRiskColor(sector.risk)
        heatGrad.addColorStop(0, color.replace(")", " / 0.25)").replace("hsl(", "hsla("))
        heatGrad.addColorStop(0.5, color.replace(")", " / 0.08)").replace("hsl(", "hsla("))
        heatGrad.addColorStop(1, "transparent")
        ctx.fillStyle = heatGrad
        ctx.beginPath()
        ctx.arc(sx, sy, pulseRadius, 0, Math.PI * 2)
        ctx.fill()

        // Sector point
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(sx, sy, 4, 0, Math.PI * 2)
        ctx.fill()

        // Sector ring
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(sx, sy, 8 + Math.sin(timeRef.current * 3) * 2, 0, Math.PI * 2)
        ctx.stroke()

        // Label
        ctx.fillStyle = "hsl(210 40% 80%)"
        ctx.font = "10px var(--font-jetbrains-mono), monospace"
        ctx.textAlign = "center"
        ctx.fillText(sector.id, sx, sy - 14)
      })

      // Scan line effect
      const scanY = ((timeRef.current * 30) % h)
      const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20)
      scanGrad.addColorStop(0, "transparent")
      scanGrad.addColorStop(0.5, "hsla(174, 72%, 46%, 0.06)")
      scanGrad.addColorStop(1, "transparent")
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanY - 20, w, 40)

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animationRef.current)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs font-medium text-foreground">
            AI RISK PREDICTION MAP
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            MODEL OUTPUT VISUALIZATION
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Toggle layers">
            <Layers className="h-3.5 w-3.5" />
          </button>
          <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Toggle heatmap">
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Fullscreen">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* Sector Overlay Tooltips */}
        {SECTORS.map((sector) => (
          <div
            key={sector.id}
            className="group absolute cursor-pointer"
            style={{
              left: `${sector.x}%`,
              top: `${sector.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => setHoveredSector(sector.id)}
            onMouseLeave={() => setHoveredSector(null)}
          >
            <div className="h-6 w-6" />
            {hoveredSector === sector.id && (
              <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded border border-border bg-popover px-2 py-1.5 shadow-lg">
                <p className="font-mono text-xs font-semibold text-foreground">
                  {sector.label}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Sector {sector.id}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: getRiskColor(sector.risk) }}
                  />
                  <span
                    className="font-mono text-[10px] font-bold"
                    style={{ color: getRiskColor(sector.risk) }}
                  >
                    {getRiskLabel(sector.risk)} ({(sector.risk * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 rounded border border-border bg-card/90 px-2 py-1.5 backdrop-blur-sm">
          <p className="mb-1 font-mono text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            Risk Level
          </p>
          <div className="flex items-center gap-3">
            {[
              { label: "Low", color: "hsl(152 69% 41%)" },
              { label: "Mod", color: "hsl(38 92% 70%)" },
              { label: "High", color: "hsl(38 92% 50%)" },
              { label: "Crit", color: "hsl(0 72% 51%)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-mono text-[9px] text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Coordinates Display */}
        <div className="absolute bottom-2 right-2 rounded border border-border bg-card/90 px-2 py-1 backdrop-blur-sm">
          <span className="font-mono text-[9px] text-muted-foreground">
            LAT {location.lat.toFixed(4)} LON {location.lon.toFixed(4)} ALT {location.elevation}
          </span>
        </div>
      </div>
    </div>
  )
}

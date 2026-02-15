"use client"

import { useState, useRef, useEffect } from "react"
import {
  Mountain,
  MapPin,
  Search,
  ChevronRight,
  Globe,
  Layers,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface LocationData {
  city: string
  state: string
  country: string
  lat: number
  lon: number
  elevation: string
  riskZone: string
  geologicalProfile: string
}

const PRESET_LOCATIONS: LocationData[] = [
  {
    city: "Uttarkashi",
    state: "Uttarakhand",
    country: "India",
    lat: 30.7268,
    lon: 78.4354,
    elevation: "1,158m",
    riskZone: "High Seismic Zone V",
    geologicalProfile: "Himalayan Metamorphic Belt",
  },
  {
    city: "Shimla",
    state: "Himachal Pradesh",
    country: "India",
    lat: 31.1048,
    lon: 77.1734,
    elevation: "2,276m",
    riskZone: "Seismic Zone IV",
    geologicalProfile: "Lesser Himalayan Sequence",
  },
  {
    city: "Gangtok",
    state: "Sikkim",
    country: "India",
    lat: 27.3389,
    lon: 88.6065,
    elevation: "1,650m",
    riskZone: "High Seismic Zone IV",
    geologicalProfile: "Eastern Himalayan Gneiss",
  },
  {
    city: "Aizawl",
    state: "Mizoram",
    country: "India",
    lat: 23.7271,
    lon: 92.7176,
    elevation: "1,132m",
    riskZone: "Seismic Zone V",
    geologicalProfile: "Indo-Burman Ranges",
  },
  {
    city: "Munnar",
    state: "Kerala",
    country: "India",
    lat: 10.0889,
    lon: 77.0595,
    elevation: "1,532m",
    riskZone: "Western Ghats Landslide Belt",
    geologicalProfile: "Precambrian Crystalline",
  },
  {
    city: "Darjeeling",
    state: "West Bengal",
    country: "India",
    lat: 27.0360,
    lon: 88.2627,
    elevation: "2,042m",
    riskZone: "Seismic Zone IV",
    geologicalProfile: "Darjeeling Gneiss Complex",
  },
  {
    city: "Nainital",
    state: "Uttarakhand",
    country: "India",
    lat: 29.3919,
    lon: 79.4542,
    elevation: "1,938m",
    riskZone: "Seismic Zone IV",
    geologicalProfile: "Kumaun Lesser Himalaya",
  },
  {
    city: "Ooty",
    state: "Tamil Nadu",
    country: "India",
    lat: 11.4102,
    lon: 76.6950,
    elevation: "2,240m",
    riskZone: "Nilgiri Landslide Zone",
    geologicalProfile: "Charnockite Massif",
  },
]

interface LocationSelectorProps {
  onSelect: (location: LocationData) => void
}

export function LocationSelector({ onSelect }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [customCity, setCustomCity] = useState("")
  const [customState, setCustomState] = useState("")
  const [showCustom, setShowCustom] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  const filteredLocations = PRESET_LOCATIONS.filter(
    (loc) =>
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Animated background canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resize()
    window.addEventListener("resize", resize)

    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.3 + 0.1,
      })
    }

    const draw = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      timeRef.current += 0.005

      ctx.clearRect(0, 0, w, h)

      // Draw topographic contour lines
      ctx.strokeStyle = "hsla(215, 20%, 20%, 0.08)"
      ctx.lineWidth = 0.5
      for (let i = 0; i < 15; i++) {
        const cx = w * 0.3 + Math.sin(timeRef.current + i * 0.5) * 30
        const cy = h * 0.5 + Math.cos(timeRef.current * 0.7 + i * 0.3) * 20
        const rx = (w * 0.04) * (i + 1)
        const ry = (h * 0.03) * (i + 1)
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, -0.15, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw grid
      ctx.strokeStyle = "hsla(215, 20%, 18%, 0.05)"
      ctx.lineWidth = 0.5
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.fillStyle = `hsla(38, 92%, 50%, ${p.o})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      })

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.strokeStyle = `hsla(38, 92%, 50%, ${0.03 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const handleCustomSubmit = () => {
    if (!customCity.trim() || !customState.trim()) return
    onSelect({
      city: customCity.trim(),
      state: customState.trim(),
      country: "India",
      lat: 20.5937 + (Math.random() - 0.5) * 10,
      lon: 78.9629 + (Math.random() - 0.5) * 10,
      elevation: `${Math.floor(Math.random() * 2000 + 500)}m`,
      riskZone: "Analysis Pending",
      geologicalProfile: "To be determined by model",
    })
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-background">
      {/* Animated Background */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Main Content */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-8 px-6">
        {/* Logo + Title */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
            <Mountain className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-wide text-foreground">
              ROCKGUARD<span className="text-primary"> AI</span>
            </h1>
            <p className="mt-1 font-mono text-xs tracking-widest text-muted-foreground">
              ROCKFALL PREDICTION SYSTEM
            </p>
          </div>
          <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground">
            Select a location to generate AI-powered rockfall risk predictions
            based on geological, topographical, and historical data.
          </p>
        </div>

        {/* Search / Selection Card */}
        <div className="w-full overflow-hidden rounded-lg border border-border bg-card/80 backdrop-blur-sm">
          {/* Search Bar */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search city or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={() => setShowCustom(!showCustom)}
              className={cn(
                "rounded-md px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-wider transition-colors",
                showCustom
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              Custom
            </button>
          </div>

          {/* Custom Input */}
          {showCustom && (
            <div className="border-b border-border bg-secondary/30 p-4">
              <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Enter Custom Location
              </p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="custom-city" className="sr-only">City</label>
                  <input
                    id="custom-city"
                    type="text"
                    placeholder="City"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="custom-state" className="sr-only">State</label>
                  <input
                    id="custom-state"
                    type="text"
                    placeholder="State"
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customCity.trim() || !customState.trim()}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Predict
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Preset Location List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredLocations.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8">
                <Globe className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No matching locations found
                </p>
                <button
                  onClick={() => setShowCustom(true)}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  Enter a custom location instead
                </button>
              </div>
            ) : (
              filteredLocations.map((loc, index) => (
                <button
                  key={`${loc.city}-${loc.state}`}
                  onClick={() => onSelect(loc)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={cn(
                    "group flex w-full items-center gap-4 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0",
                    hoveredIndex === index
                      ? "bg-primary/5"
                      : "hover:bg-secondary/50"
                  )}
                >
                  {/* Pin Icon */}
                  <div
                    className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border transition-colors",
                      hoveredIndex === index
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground"
                    )}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>

                  {/* Location Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {loc.city}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {loc.state}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {loc.elevation}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {loc.riskZone}
                      </span>
                    </div>
                  </div>

                  {/* Geological Profile Badge */}
                  <div className="hidden items-center gap-2 sm:flex">
                    <div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
                      <Layers className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {loc.geologicalProfile}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-all",
                      hoveredIndex === index
                        ? "translate-x-0.5 text-primary"
                        : "text-muted-foreground/50"
                    )}
                  />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground/60">
          AI MODEL v4.2.1 &mdash; DATASET: 184,329 SAMPLES &mdash; LAST TRAINED: FEB 2026
        </p>
      </div>
    </div>
  )
}

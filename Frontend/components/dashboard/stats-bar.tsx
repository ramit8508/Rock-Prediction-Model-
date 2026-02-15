"use client"

import { useEffect, useState } from "react"
import {
  Cpu,
  Database,
  BrainCircuit,
  Zap,
  Layers,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LocationData } from "./location-selector"

interface Stat {
  icon: React.ElementType
  label: string
  value: string
  suffix?: string
  status: "normal" | "warning" | "critical"
}

interface StatsBarProps {
  location: LocationData
}

export function StatsBar({ location }: StatsBarProps) {
  const [stats, setStats] = useState<Stat[]>([
    { icon: MapPin, label: "Location", value: location.city, suffix: `, ${location.state}`, status: "normal" },
    { icon: BrainCircuit, label: "Active Model", value: "v4.2.1", status: "normal" },
    { icon: Cpu, label: "GPU Load", value: "78", suffix: "%", status: "normal" },
    { icon: Zap, label: "Inference", value: "12", suffix: "ms", status: "normal" },
    { icon: Database, label: "Datasets", value: "12", suffix: "loaded", status: "normal" },
    { icon: Layers, label: "Elevation", value: location.elevation, status: "normal" },
  ])

  useEffect(() => {
    setStats((prev) =>
      prev.map((stat) => {
        if (stat.label === "Location") return { ...stat, value: location.city, suffix: `, ${location.state}` }
        if (stat.label === "Elevation") return { ...stat, value: location.elevation }
        return stat
      })
    )
  }, [location])

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => {
          if (stat.label === "GPU Load") {
            const v = 70 + Math.floor(Math.random() * 20)
            return {
              ...stat,
              value: String(v),
              status: v > 85 ? "warning" : "normal",
            }
          }
          if (stat.label === "Inference") {
            const v = 8 + Math.floor(Math.random() * 12)
            return { ...stat, value: String(v) }
          }
          return stat
        })
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-px border-b border-border bg-card">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-1 items-center justify-center gap-2 border-r border-border px-3 py-1.5 last:border-r-0"
        >
          <stat.icon
            className={cn(
              "h-3.5 w-3.5",
              stat.status === "normal" && "text-muted-foreground",
              stat.status === "warning" && "text-warning",
              stat.status === "critical" && "text-critical",
              stat.label === "Location" && "text-primary"
            )}
          />
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-[10px] text-muted-foreground">
              {stat.label}
            </span>
            <span
              className={cn(
                "font-mono text-xs font-bold",
                stat.status === "normal" && "text-foreground",
                stat.status === "warning" && "text-warning",
                stat.status === "critical" && "text-critical"
              )}
            >
              {stat.value}
              {stat.suffix && (
                <span className="text-[10px] font-normal text-muted-foreground">
                  {stat.suffix}
                </span>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

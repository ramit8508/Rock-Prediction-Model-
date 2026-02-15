"use client"

import { useEffect, useState } from "react"
import { Bell, Circle, MapPin, Search, Wifi } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { LocationData } from "./location-selector"

interface DashboardHeaderProps {
  location: LocationData
  onChangeLocation: () => void
}

export function DashboardHeader({ location, onChangeLocation }: DashboardHeaderProps) {
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      )
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold tracking-wide text-foreground">
          ROCKGUARD<span className="text-primary"> AI</span>
        </h1>
        <div className="h-4 w-px bg-border" />

        {/* Location Badge */}
        <button
          onClick={onChangeLocation}
          className="flex items-center gap-2 rounded-md border border-border bg-secondary px-2.5 py-1 transition-colors hover:bg-muted"
        >
          <MapPin className="h-3 w-3 text-primary" />
          <span className="font-mono text-xs font-medium text-foreground">
            {location.city}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {location.state}
          </span>
          <span className="font-mono text-[10px] text-primary">Change</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <button className="flex h-7 items-center gap-2 rounded-md border border-border bg-secondary px-3 text-xs text-muted-foreground transition-colors hover:bg-muted" aria-label="Search">
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search datasets...</span>
          <kbd className="hidden rounded bg-background px-1 font-mono text-[10px] sm:inline">/</kbd>
        </button>

        {/* System Status */}
        <div className="flex items-center gap-2">
          <Wifi className="h-3.5 w-3.5 text-success" />
          <span className="font-mono text-xs text-success">ONLINE</span>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Alerts Badge */}
        <button className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <Badge className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[10px] font-bold text-critical-foreground">
            3
          </Badge>
        </button>

        <div className="h-4 w-px bg-border" />

        {/* Time Display */}
        <div className="flex items-center gap-2">
          <Circle className="h-1.5 w-1.5 animate-pulse fill-primary text-primary" />
          <div className="text-right">
            <p className="font-mono text-xs font-medium text-foreground">{time}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{date}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

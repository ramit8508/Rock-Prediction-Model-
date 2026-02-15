"use client"

import { useState } from "react"
import {
  Mountain,
  LayoutDashboard,
  BrainCircuit,
  Database,
  Settings,
  FlaskConical,
  Radio,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BrainCircuit, label: "Predictive Models", active: false },
  { icon: Database, label: "Datasets", active: false },
  { icon: FlaskConical, label: "Model Training", active: false },
  { icon: Settings, label: "Settings", active: false },
]

export function SidebarNav() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex h-full w-14 flex-col items-center border-r border-border bg-card py-4">
        {/* Logo */}
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
          <Mountain className="h-5 w-5 text-primary" />
        </div>

        {/* Nav Items */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {navItems.map((item, index) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md transition-all",
                    activeIndex === index
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  aria-label={item.label}
                  aria-current={activeIndex === index ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Live Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-10 w-10 items-center justify-center">
              <Radio className="h-4 w-4 animate-pulse-glow text-success" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
            System Online
          </TooltipContent>
        </Tooltip>
      </aside>
    </TooltipProvider>
  )
}

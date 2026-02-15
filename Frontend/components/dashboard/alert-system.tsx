"use client"

import { useState, useEffect, useCallback } from "react"
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  Clock,
  Shield,
  X,
  Radio,
  Siren,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { LocationData } from "./location-selector"

interface AlertSystemProps {
  location: LocationData
}

interface Alert {
  id: string
  timestamp: string
  type: "critical" | "warning" | "info"
  sector: string
  message: string
  acknowledged: boolean
}

const INITIAL_ALERTS: Alert[] = [
  {
    id: "ALT-001",
    timestamp: "14:32:08",
    type: "critical",
    sector: "C1",
    message: "AI model predicts 91% rockfall probability - Crest Zone. Feature: slope angle + weathering grade",
    acknowledged: false,
  },
  {
    id: "ALT-002",
    timestamp: "14:28:45",
    type: "critical",
    sector: "A1",
    message: "Prediction confidence spike - North Wall. RockNet-v4 output: 87% risk, validated by ensemble",
    acknowledged: false,
  },
  {
    id: "ALT-003",
    timestamp: "14:15:22",
    type: "warning",
    sector: "B1",
    message: "Risk trend increasing - South Face. Model predicts escalation within 48hr window",
    acknowledged: true,
  },
  {
    id: "ALT-004",
    timestamp: "13:58:11",
    type: "warning",
    sector: "C2",
    message: "Historical rainfall pattern match detected - Haul Road. Similar to 2019 incident dataset",
    acknowledged: true,
  },
  {
    id: "ALT-005",
    timestamp: "13:42:33",
    type: "info",
    sector: "A2",
    message: "Model retraining complete - East Bench sector. Accuracy improved: 93.1% to 94.7%",
    acknowledged: true,
  },
  {
    id: "ALT-006",
    timestamp: "13:30:05",
    type: "warning",
    sector: "A1",
    message: "Anomaly detected in input features - North Wall. Data quality check recommended",
    acknowledged: true,
  },
  {
    id: "ALT-007",
    timestamp: "12:55:18",
    type: "info",
    sector: "B2",
    message: "New dataset batch ingested - West Ramp. 2,847 samples added to training pipeline",
    acknowledged: true,
  },
]

function AlertIcon({ type }: { type: Alert["type"] }) {
  switch (type) {
    case "critical":
      return <Siren className="h-3.5 w-3.5 text-critical" />
    case "warning":
      return <AlertTriangle className="h-3.5 w-3.5 text-warning" />
    case "info":
      return <Bell className="h-3.5 w-3.5 text-info" />
  }
}

function EvacuationModal({ onClose, location }: { onClose: () => void; location: LocationData }) {
  const [countdown, setCountdown] = useState(120)
  const [broadcasting, setBroadcasting] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border-2 border-critical bg-card shadow-2xl shadow-critical/20">
        {/* Flashing Header */}
        <div className="animate-pulse-glow bg-critical px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-critical-foreground" />
              <div>
                <h2 className="text-lg font-bold text-critical-foreground">
                  EVACUATION RECOMMENDED
                </h2>
                <p className="text-xs text-critical-foreground/80">
                  AI Confidence: 94.7% | {location.city}, {location.state}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-critical-foreground/80 transition-colors hover:bg-critical-foreground/10 hover:text-critical-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Countdown */}
          <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-secondary p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Recommended Evacuation Window
            </p>
            <div className="font-mono text-4xl font-bold text-critical tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on AI model prediction confidence and historical pattern analysis
            </p>
          </div>

          {/* Risk Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="font-mono text-xs text-muted-foreground">
                Primary Threat
              </span>
              <span className="font-mono text-xs font-bold text-critical">
                ROCKFALL - GRADE IV
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="font-mono text-xs text-muted-foreground">
                Affected Zones
              </span>
              <span className="font-mono text-xs text-foreground">
                North Wall, Crest Zone
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="font-mono text-xs text-muted-foreground">
                Personnel at Risk
              </span>
              <span className="font-mono text-xs font-bold text-warning">
                12 WORKERS
              </span>
            </div>
          </div>

          {/* Broadcast Button */}
          <button
            onClick={() => setBroadcasting(true)}
            disabled={broadcasting}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all",
              broadcasting
                ? "bg-success text-success-foreground"
                : "bg-critical text-critical-foreground hover:bg-critical/90 active:scale-[0.98]"
            )}
          >
            {broadcasting ? (
              <>
                <Radio className="h-4 w-4 animate-pulse" />
                ALERT BROADCASTING...
              </>
            ) : (
              <>
                <Siren className="h-4 w-4" />
                BROADCAST EVACUATION ALERT
              </>
            )}
          </button>

          {broadcasting && (
            <p className="text-center font-mono text-[10px] text-success">
              Alert sent to all radios and PA systems in affected sectors
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function AlertSystem({ location }: AlertSystemProps) {
  const [alerts] = useState(INITIAL_ALERTS)
  const [showEvacModal, setShowEvacModal] = useState(false)

  const criticalCount = alerts.filter(
    (a) => a.type === "critical" && !a.acknowledged
  ).length

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
          <div className="flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-warning" />
            <span className="font-mono text-xs font-medium text-foreground">
              ALERT HISTORY
            </span>
            {criticalCount > 0 && (
              <Badge className="bg-critical px-1.5 py-0 font-mono text-[10px] font-bold text-critical-foreground">
                {criticalCount} CRITICAL
              </Badge>
            )}
          </div>
          <button className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground">
            VIEW ALL
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Critical Banner */}
        {criticalCount > 0 && (
          <button
            onClick={() => setShowEvacModal(true)}
            className="flex items-center gap-2 border-b border-critical/30 bg-critical/10 px-3 py-2 text-left transition-colors hover:bg-critical/15"
          >
            <Shield className="h-4 w-4 animate-pulse text-critical" />
            <div className="flex-1">
              <p className="font-mono text-xs font-bold text-critical">
                EVACUATION ADVISORY ACTIVE
              </p>
              <p className="font-mono text-[10px] text-critical/80">
                Click to review evacuation protocol
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-critical" />
          </button>
        )}

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-2 border-b border-border px-3 py-2 transition-colors hover:bg-secondary/50",
                !alert.acknowledged &&
                  alert.type === "critical" &&
                  "bg-critical/5"
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                <AlertIcon type={alert.type} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {alert.id}
                  </span>
                  <Badge
                    className={cn(
                      "px-1 py-0 font-mono text-[9px] font-medium uppercase",
                      alert.type === "critical" &&
                        "bg-critical/15 text-critical hover:bg-critical/15",
                      alert.type === "warning" &&
                        "bg-warning/15 text-warning hover:bg-warning/15",
                      alert.type === "info" &&
                        "bg-info/15 text-info hover:bg-info/15"
                    )}
                  >
                    {alert.type}
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    SEC-{alert.sector}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-foreground">
                  {alert.message}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {alert.timestamp}
                  </span>
                  {!alert.acknowledged && (
                    <span className="ml-2 font-mono text-[9px] font-bold text-warning">
                      UNACKNOWLEDGED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evacuation Modal */}
      {showEvacModal && (
        <EvacuationModal onClose={() => setShowEvacModal(false)} location={location} />
      )}
    </>
  )
}

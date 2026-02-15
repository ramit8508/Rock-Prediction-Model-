"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  Clock,
  Shield,
  X,
  Radio,
  Siren,
  Mail,
  Plus,
  Trash2,
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
  const [emails, setEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [emailsSent, setEmailsSent] = useState(0)
  const [lastSentTime, setLastSentTime] = useState<string>("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const sirenAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Initialize siren audio on mount
  useEffect(() => {
    sirenAudioRef.current = new Audio()
    sirenAudioRef.current.loop = true
    sirenAudioRef.current.volume = 0.7
    
    // Generate siren sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator1 = audioContext.createOscillator()
    const oscillator2 = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator1.type = 'sine'
    oscillator2.type = 'sine'
    
    // Create siren effect by oscillating between two frequencies
    oscillator1.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime)
    
    // Modulate frequency for siren effect
    const lfo = audioContext.createOscillator()
    lfo.frequency.value = 2 // 2Hz oscillation
    const lfoGain = audioContext.createGain()
    lfoGain.gain.value = 200 // Frequency modulation depth
    
    lfo.connect(lfoGain)
    lfoGain.connect(oscillator1.frequency)
    lfoGain.connect(oscillator2.frequency)
    
    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    gainNode.connect(audioContext.destination)
    gainNode.gain.value = 0
    
    // Store audio context for cleanup
    const audioData = { audioContext, oscillator1, oscillator2, lfo, gainNode }
    sirenAudioRef.current = audioData as any
    
    return () => {
      if (audioData.audioContext.state !== 'closed') {
        try {
          audioData.oscillator1.stop()
          audioData.oscillator2.stop()
          audioData.lfo.stop()
          audioData.audioContext.close()
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    }
  }, [])

  const playSiren = () => {
    const audioData = sirenAudioRef.current as any
    if (audioData && audioData.audioContext) {
      try {
        audioData.oscillator1.start()
        audioData.oscillator2.start()
        audioData.lfo.start()
        audioData.gainNode.gain.setValueAtTime(0.3, audioData.audioContext.currentTime)
      } catch (e) {
        // Already started or error
      }
    }
  }

  const stopSiren = () => {
    const audioData = sirenAudioRef.current as any
    if (audioData && audioData.gainNode) {
      try {
        audioData.gainNode.gain.setValueAtTime(0, audioData.audioContext.currentTime)
      } catch (e) {
        // Ignore
      }
    }
  }

  // Email sending interval - every 15 seconds when broadcasting
  useEffect(() => {
    if (broadcasting && emails.length > 0) {
      // Send immediately when broadcast starts
      sendEvacuationEmails()
      
      // Then send every 15 seconds
      intervalRef.current = setInterval(() => {
        sendEvacuationEmails()
      }, 15000)
    } else {
      // Stop siren when broadcasting stops
      stopSiren()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [broadcasting, emails])

  const sendEvacuationEmails = async () => {
    if (emails.length === 0) return

    try {
      const response = await fetch('/api/send-evacuation-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          location: {
            city: location.city,
            state: location.state,
          },
          alertDetails: {
            confidence: "94.7%",
            threat: "ROCKFALL - GRADE IV",
            affectedZones: "North Wall, Crest Zone",
            personnelAtRisk: "12 WORKERS",
          },
        }),
      })

      if (response.ok) {
        setEmailsSent(prev => prev + 1)
        const now = new Date()
        setLastSentTime(now.toLocaleTimeString())
      }
    } catch (error) {
      console.error('Failed to send emails:', error)
    }
  }

  const addEmail = () => {
    if (emailInput.trim() && emailInput.includes('@')) {
      if (!emails.includes(emailInput.trim())) {
        setEmails([...emails, emailInput.trim()])
        setEmailInput("")
      }
    }
  }

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addEmail()
    }
  }

  const startBroadcast = () => {
    playSiren()
    setBroadcasting(true)
  }

  const handleClose = () => {
    stopSiren()
    onClose()
  }

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border-2 border-critical bg-card shadow-2xl shadow-critical/20 max-h-[90vh] overflow-y-auto">
        {/* Flashing Header */}
        <div className="animate-pulse-glow bg-critical px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={cn(
                "h-6 w-6 text-critical-foreground",
                broadcasting && "animate-pulse"
              )} />
              <div>
                <h2 className="text-lg font-bold text-critical-foreground">
                  EVACUATION RECOMMENDED
                  {broadcasting && (
                    <span className="ml-2 inline-flex items-center gap-1 text-sm">
                      🚨 <span className="animate-pulse">SIREN ACTIVE</span>
                    </span>
                  )}
                </h2>
                <p className="text-xs text-critical-foreground/80">
                  AI Confidence: 94.7% | {location.city}, {location.state}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
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

          {/* Email Notification Section */}
          <div className="space-y-2 rounded-md border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs font-medium text-foreground">
                EMAIL NOTIFICATIONS
              </span>
            </div>
            
            {/* Email Input */}
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email address..."
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={addEmail}
                disabled={!emailInput.trim() || !emailInput.includes('@')}
                className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>

            {/* Email List */}
            {emails.length > 0 && (
              <div className="mt-2 space-y-1">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between rounded-md border border-border bg-background px-2 py-1.5"
                  >
                    <span className="font-mono text-xs text-foreground">{email}</span>
                    <button
                      onClick={() => removeEmail(email)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Email Status */}
            {broadcasting && emails.length > 0 && (
              <div className="mt-2 rounded-md border border-success/30 bg-success/10 px-3 py-2">
                <p className="font-mono text-xs text-success">
                  📧 Emails sent: {emailsSent} | Last sent: {lastSentTime}
                </p>
                <p className="font-mono text-[10px] text-success/80 mt-1">
                  Auto-resending every 15 seconds to {emails.length} recipient(s)
                </p>
              </div>
            )}
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
            onClick={startBroadcast}
            disabled={broadcasting || emails.length === 0}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all",
              broadcasting
                ? "bg-success text-success-foreground"
                : emails.length === 0
                ? "bg-muted text-muted-foreground cursor-not-allowed"
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

          {emails.length === 0 && !broadcasting && (
            <p className="text-center font-mono text-[10px] text-warning">
              ⚠️ Add at least one email address to enable broadcast
            </p>
          )}

          {broadcasting && (
            <>
              <p className="text-center font-mono text-[10px] text-success">
                Alert sent to all radios, PA systems, and email recipients
              </p>
              <button
                onClick={stopSiren}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-foreground transition-colors hover:bg-secondary/80"
              >
                🔇 Mute Siren (emails continue)
              </button>
            </>
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

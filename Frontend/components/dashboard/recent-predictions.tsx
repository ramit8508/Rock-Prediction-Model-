"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Card } from "@/components/ui/card"
import { Activity, AlertTriangle, CheckCircle, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface Prediction {
  timestamp: string
  location: string
  prediction: string
  probability: number
  rainfall_7day: number
  temperature: number
}

export function RecentPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const data = await apiClient.getRecentPredictions(10)
        setPredictions(data.predictions)
      } catch (error) {
        console.error('Failed to fetch predictions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
    const interval = setInterval(fetchPredictions, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <h3 className="font-mono text-sm font-semibold">Recent Predictions</h3>
        </div>
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">Loading predictions...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-sm font-semibold">Recent Predictions</h3>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {predictions.length} predictions
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {predictions.map((pred, idx) => {
          const isDangerous = pred.prediction === "DANGEROUS"
          const risk = pred.probability > 75 ? 'CRITICAL' : pred.probability > 50 ? 'HIGH' : pred.probability > 25 ? 'MEDIUM' : 'LOW'

          return (
            <div
              key={idx}
              className={cn(
                "rounded border p-3 transition-all hover:shadow-md",
                isDangerous
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-success/30 bg-success/5"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isDangerous ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                  <div>
                    <p className={cn(
                      "font-mono text-xs font-bold",
                      isDangerous ? "text-destructive" : "text-success"
                    )}>
                      {pred.prediction}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="font-mono text-[10px] text-muted-foreground">{pred.location}</p>
                    </div>
                  </div>
                </div>

                {/* Risk Badge */}
                <div className={cn(
                  "rounded px-2 py-1",
                  risk === 'CRITICAL' && "bg-destructive/20 text-destructive",
                  risk === 'HIGH' && "bg-orange-500/20 text-orange-500",
                  risk === 'MEDIUM' && "bg-yellow-500/20 text-yellow-500",
                  risk === 'LOW' && "bg-success/20 text-success"
                )}>
                  <p className="font-mono text-[10px] font-bold">{risk}</p>
                </div>
              </div>

              {/* Probability Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-mono text-[9px] text-muted-foreground">Probability</p>
                  <p className="font-mono text-xs font-bold">{pred.probability.toFixed(1)}%</p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isDangerous ? "bg-destructive" : "bg-success"
                    )}
                    style={{ width: `${pred.probability}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-background/50 px-2 py-1">
                  <p className="font-mono text-[9px] text-muted-foreground">Rainfall (7d)</p>
                  <p className="font-mono text-xs font-bold">{pred.rainfall_7day.toFixed(1)} mm</p>
                </div>
                <div className="rounded bg-background/50 px-2 py-1">
                  <p className="font-mono text-[9px] text-muted-foreground">Temperature</p>
                  <p className="font-mono text-xs font-bold">{pred.temperature.toFixed(1)}°C</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

"use client"

import { useEffect, useState, useCallback } from "react"
import { Activity, ArrowDown, ArrowUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts"

interface MetricConfig {
  id: string
  label: string
  unit: string
  color: string
  min: number
  max: number
  threshold: number
  baseValue: number
  frequency: number
  lowerIsBetter?: boolean
}

const METRICS: MetricConfig[] = [
  {
    id: "loss",
    label: "Training Loss",
    unit: "",
    color: "hsl(38 92% 50%)",
    min: 0,
    max: 1,
    threshold: 0.15,
    baseValue: 0.12,
    frequency: 0.3,
    lowerIsBetter: true,
  },
  {
    id: "accuracy",
    label: "Validation Accuracy",
    unit: "%",
    color: "hsl(152 69% 41%)",
    min: 80,
    max: 100,
    threshold: 95,
    baseValue: 94.5,
    frequency: 0.15,
  },
  {
    id: "auc",
    label: "ROC-AUC Score",
    unit: "",
    color: "hsl(174 72% 46%)",
    min: 0.8,
    max: 1,
    threshold: 0.95,
    baseValue: 0.937,
    frequency: 0.1,
  },
]

function generateData(metric: MetricConfig, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const t = Date.now() - (count - i) * 3000
    const range = metric.max - metric.min
    const noise = Math.random() * (range * 0.04)
    const wave = Math.sin(i * metric.frequency) * (range * 0.03)
    const val = Math.max(
      metric.min,
      Math.min(metric.max, metric.baseValue + wave + noise)
    )
    return {
      time: `E${(i + 1).toString().padStart(3, "0")}`,
      value: parseFloat(val.toFixed(metric.id === "accuracy" ? 1 : 4)),
    }
  })
}

function MetricChart({ metric }: { metric: MetricConfig }) {
  const [data, setData] = useState(() => generateData(metric, 30))
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable")

  const updateData = useCallback(() => {
    setData((prev) => {
      const lastVal = prev[prev.length - 1].value
      const range = metric.max - metric.min
      const noise = (Math.random() - 0.45) * (range * 0.03)
      const newVal = Math.max(
        metric.min,
        Math.min(metric.max, lastVal + noise)
      )
      const newPoint = {
        time: `E${(prev.length + 1).toString().padStart(3, "0")}`,
        value: parseFloat(newVal.toFixed(metric.id === "accuracy" ? 1 : 4)),
      }

      const updated = [...prev.slice(1), newPoint]

      const recent = updated.slice(-5)
      const avg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length
      const older = updated.slice(-10, -5)
      const olderAvg =
        older.length > 0
          ? older.reduce((sum, d) => sum + d.value, 0) / older.length
          : avg

      const diff = range * 0.005
      if (avg > olderAvg + diff) setTrend("up")
      else if (avg < olderAvg - diff) setTrend("down")
      else setTrend("stable")

      return updated
    })
  }, [metric])

  useEffect(() => {
    const interval = setInterval(updateData, 2500)
    return () => clearInterval(interval)
  }, [updateData])

  const latestValue = data[data.length - 1].value
  const isGood = metric.lowerIsBetter
    ? latestValue <= metric.threshold
    : latestValue >= metric.threshold

  return (
    <div className="flex flex-col rounded-md border border-border bg-card">
      {/* Chart Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: metric.color }}
          />
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-foreground">
            {metric.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Trend */}
          <div className="flex items-center gap-1">
            {trend === "up" && (
              <ArrowUp
                className={cn(
                  "h-3 w-3",
                  metric.lowerIsBetter ? "text-warning" : "text-success"
                )}
              />
            )}
            {trend === "down" && (
              <ArrowDown
                className={cn(
                  "h-3 w-3",
                  metric.lowerIsBetter ? "text-success" : "text-warning"
                )}
              />
            )}
            {trend === "stable" && (
              <Minus className="h-3 w-3 text-muted-foreground" />
            )}
          </div>

          {/* Current Value */}
          <span
            className={cn(
              "font-mono text-sm font-bold",
              !isGood ? "animate-pulse" : ""
            )}
            style={{ color: isGood ? metric.color : "hsl(38 92% 50%)" }}
          >
            {latestValue}
          </span>
          {metric.unit && (
            <span className="font-mono text-[10px] text-muted-foreground">
              {metric.unit}
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-24 px-1 py-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={`grad-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsla(215, 20%, 20%, 0.3)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 8, fill: "hsl(215 16% 42%)", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[metric.min, metric.max]}
              tick={{ fontSize: 8, fill: "hsl(215 16% 42%)", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "hsl(222 47% 8%)",
                border: "1px solid hsl(215 20% 16%)",
                borderRadius: "4px",
                fontSize: "10px",
                fontFamily: "monospace",
                color: "hsl(210 40% 93%)",
              }}
              formatter={(value: number) => [
                `${value}${metric.unit}`,
                metric.label,
              ]}
              labelFormatter={(label) => `Epoch: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={1.5}
              fill={`url(#grad-${metric.id})`}
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Threshold Bar */}
      <div className="flex items-center justify-between border-t border-border px-3 py-1">
        <span className="font-mono text-[9px] text-muted-foreground">
          TARGET: {metric.threshold}{metric.unit}
        </span>
        <div className="flex items-center gap-1">
          <div className="h-1 w-16 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, ((latestValue - metric.min) / (metric.max - metric.min)) * 100)}%`,
                backgroundColor: isGood ? metric.color : "hsl(38 92% 50%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TrainingMetrics() {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-md border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-info" />
          <span className="font-mono text-xs font-medium text-foreground">
            TRAINING METRICS
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            EPOCH 247 / 500
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          RockNet-v5 TRAINING
        </span>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-3 gap-px bg-border">
        {METRICS.map((metric) => (
          <MetricChart key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  )
}

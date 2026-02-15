"use client"

import { useEffect, useState } from "react"
import { BrainCircuit, TrendingUp, Layers, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Bar,
  BarChart,
  Cell,
} from "recharts"

interface ModelVersion {
  id: string
  name: string
  version: string
  accuracy: number
  f1Score: number
  status: "active" | "training" | "archived"
  lossHistory: { t: number; v: number }[]
  featureImportance: { name: string; value: number }[]
}

const INITIAL_MODELS: ModelVersion[] = [
  {
    id: "MDL-01",
    name: "RockNet-v4",
    version: "4.2.1",
    accuracy: 94.7,
    f1Score: 0.923,
    status: "active",
    lossHistory: Array.from({ length: 20 }, (_, i) => ({
      t: i,
      v: Math.max(0.05, 0.8 - i * 0.035 + Math.random() * 0.05),
    })),
    featureImportance: [
      { name: "Slope Angle", value: 0.32 },
      { name: "Rock Mass", value: 0.24 },
      { name: "Weathering", value: 0.18 },
      { name: "Joint Spacing", value: 0.14 },
      { name: "Water Table", value: 0.12 },
    ],
  },
  {
    id: "MDL-02",
    name: "RockNet-v5",
    version: "5.0.0-beta",
    accuracy: 96.1,
    f1Score: 0.948,
    status: "training",
    lossHistory: Array.from({ length: 15 }, (_, i) => ({
      t: i,
      v: Math.max(0.08, 0.9 - i * 0.05 + Math.random() * 0.06),
    })),
    featureImportance: [
      { name: "Slope Angle", value: 0.28 },
      { name: "Rock Mass", value: 0.26 },
      { name: "Weathering", value: 0.2 },
      { name: "Rainfall Hist", value: 0.15 },
      { name: "Joint Spacing", value: 0.11 },
    ],
  },
  {
    id: "MDL-03",
    name: "RockNet-v3",
    version: "3.8.4",
    accuracy: 91.2,
    f1Score: 0.889,
    status: "archived",
    lossHistory: Array.from({ length: 20 }, (_, i) => ({
      t: i,
      v: Math.max(0.1, 0.85 - i * 0.03 + Math.random() * 0.04),
    })),
    featureImportance: [
      { name: "Slope Angle", value: 0.35 },
      { name: "Rock Mass", value: 0.22 },
      { name: "Weathering", value: 0.19 },
      { name: "Joint Spacing", value: 0.13 },
      { name: "Water Table", value: 0.11 },
    ],
  },
]

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 95) return "hsl(152 69% 41%)"
  if (accuracy >= 90) return "hsl(38 92% 50%)"
  return "hsl(0 72% 51%)"
}

const featureColors = [
  "hsl(38 92% 50%)",
  "hsl(174 72% 46%)",
  "hsl(152 69% 41%)",
  "hsl(215 16% 52%)",
  "hsl(0 72% 51%)",
]

export function ModelPerformance() {
  const [models, setModels] = useState(INITIAL_MODELS)
  const [selectedModel, setSelectedModel] = useState<string>("MDL-01")

  // Simulate training progress for MDL-02
  useEffect(() => {
    const interval = setInterval(() => {
      setModels((prev) =>
        prev.map((model) => {
          if (model.status === "training") {
            const lastLoss = model.lossHistory[model.lossHistory.length - 1].v
            const newLoss = Math.max(0.03, lastLoss - 0.005 + (Math.random() - 0.5) * 0.02)
            const newAcc = Math.min(99.9, model.accuracy + (Math.random() - 0.3) * 0.3)
            return {
              ...model,
              accuracy: parseFloat(newAcc.toFixed(1)),
              lossHistory: [
                ...model.lossHistory.slice(1),
                { t: model.lossHistory.length, v: parseFloat(newLoss.toFixed(4)) },
              ],
            }
          }
          return model
        })
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const activeModel = models.find((m) => m.id === selectedModel) || models[0]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs font-medium text-foreground">
            AI MODELS
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {models.filter((m) => m.status !== "archived").length} ACTIVE
          </span>
        </div>
      </div>

      {/* Model List */}
      <div className="flex-1 overflow-y-auto">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={cn(
              "w-full border-b border-border p-2 text-left transition-colors hover:bg-secondary/50",
              selectedModel === model.id && "bg-secondary/70"
            )}
          >
            <div className="flex gap-2">
              {/* Loss Curve Mini Chart */}
              <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded-sm border border-border bg-background">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={model.lossHistory} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                    <defs>
                      <linearGradient id={`loss-grad-${model.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={getAccuracyColor(model.accuracy)} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={getAccuracyColor(model.accuracy)} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={getAccuracyColor(model.accuracy)}
                      strokeWidth={1}
                      fill={`url(#loss-grad-${model.id})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                {/* Status badge */}
                <div className="absolute left-1 top-1 flex items-center gap-1 rounded bg-background/80 px-1 py-0.5">
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      model.status === "active" && "bg-success",
                      model.status === "training" && "bg-warning animate-pulse",
                      model.status === "archived" && "bg-muted-foreground"
                    )}
                  />
                  <span className="font-mono text-[8px] uppercase text-muted-foreground">
                    {model.status}
                  </span>
                </div>
              </div>

              {/* Model Info */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className="truncate text-xs font-medium text-foreground">
                    {model.name}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {model.version}
                  </p>
                </div>

                {/* Accuracy + F1 */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-2.5 w-2.5 text-muted-foreground" />
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: getAccuracyColor(model.accuracy) }}
                    >
                      {model.accuracy}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] text-muted-foreground">F1:</span>
                    <span className="font-mono text-[10px] font-bold text-foreground">
                      {model.f1Score.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}

        {/* Feature Importance of selected model */}
        <div className="border-b border-border p-3">
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Feature Importance - {activeModel.name}
            </span>
          </div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeModel.featureImportance} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
                <Bar dataKey="value" radius={[0, 2, 2, 0]} isAnimationActive={false}>
                  {activeModel.featureImportance.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={featureColors[index % featureColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            {activeModel.featureImportance.map((feat, i) => (
              <div key={feat.name} className="flex items-center gap-1">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: featureColors[i % featureColors.length] }}
                />
                <span className="font-mono text-[8px] text-muted-foreground">{feat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dataset Stats */}
        <div className="p-3">
          <div className="mb-2 flex items-center gap-2">
            <Layers className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Training Dataset
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Samples", value: "184,329" },
              { label: "Features", value: "47" },
              { label: "Train/Val", value: "80/20" },
              { label: "Augmented", value: "3.2x" },
            ].map((item) => (
              <div key={item.label} className="rounded border border-border bg-background px-2 py-1">
                <p className="font-mono text-[9px] text-muted-foreground">{item.label}</p>
                <p className="font-mono text-xs font-bold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

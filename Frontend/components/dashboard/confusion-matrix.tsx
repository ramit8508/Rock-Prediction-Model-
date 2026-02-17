"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Card } from "@/components/ui/card"
import { Brain, CheckCircle, XCircle } from "lucide-react"

interface ConfusionMatrixData {
  matrix: number[][]
  labels: string[]
  metrics: {
    true_negatives: number
    false_positives: number
    false_negatives: number
    true_positives: number
  }
}

export function ConfusionMatrixCard() {
  const [data, setData] = useState<ConfusionMatrixData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matrix = await apiClient.getConfusionMatrix()
        setData(matrix)
      } catch (error) {
        console.error('Failed to fetch confusion matrix:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 15000) // Refresh every 15s
    return () => clearInterval(interval)
  }, [])

  if (loading || !data) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-sm font-semibold">Confusion Matrix</h3>
        </div>
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </Card>
    )
  }

  const total = data.matrix.flat().reduce((a, b) => a + b, 0)
  const accuracy = ((data.metrics.true_positives + data.metrics.true_negatives) / total * 100).toFixed(1)

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-sm font-semibold">Confusion Matrix</h3>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-muted-foreground">Accuracy</p>
          <p className="font-mono text-lg font-bold text-success">{accuracy}%</p>
        </div>
      </div>

      {/* Confusion Matrix Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-1">
          {/* Header Row */}
          <div className=""></div>
          {data.labels.map((label) => (
            <div key={`pred-${label}`} className="text-center">
              <p className="font-mono text-[10px] text-muted-foreground">Pred {label}</p>
            </div>
          ))}

          {/* Matrix Rows */}
          {data.matrix.map((row, i) => (
            <div key={`row-${i}`} className="contents">
              <div className="flex items-center justify-end pr-2">
                <p className="font-mono text-[10px] text-muted-foreground">Actual {data.labels[i]}</p>
              </div>
              {row.map((value, j) => {
                const isCorrect = i === j
                const percentage = ((value / total) * 100).toFixed(1)
                return (
                  <div
                    key={`cell-${i}-${j}`}
                    className={`flex flex-col items-center justify-center rounded border p-2 ${
                      isCorrect
                        ? 'bg-success/10 border-success/30'
                        : 'bg-destructive/10 border-destructive/30'
                    }`}
                  >
                    <p className="font-mono text-lg font-bold">{value}</p>
                    <p className="font-mono text-[9px] text-muted-foreground">{percentage}%</p>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Metrics
 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-border bg-success/5 p-2">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="h-3 w-3 text-success" />
            <p className="font-mono text-[10px] text-muted-foreground">True Positives</p>
          </div>
          <p className="font-mono text-lg font-bold">{data.metrics.true_positives}</p>
        </div>

        <div className="rounded border border-border bg-success/5 p-2">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="h-3 w-3 text-success" />
            <p className="font-mono text-[10px] text-muted-foreground">True Negatives</p>
          </div>
          <p className="font-mono text-lg font-bold">{data.metrics.true_negatives}</p>
        </div>

        <div className="rounded border border-border bg-destructive/5 p-2">
          <div className="flex items-center gap-1 mb-1">
            <XCircle className="h-3 w-3 text-destructive" />
            <p className="font-mono text-[10px] text-muted-foreground">False Positives</p>
          </div>
          <p className="font-mono text-lg font-bold">{data.metrics.false_positives}</p>
        </div>

        <div className="rounded border border-border bg-destructive/5 p-2">
          <div className="flex items-center gap-1 mb-1">
            <XCircle className="h-3 w-3 text-destructive" />
            <p className="font-mono text-[10px] text-muted-foreground">False Negatives</p>
          </div>
          <p className="font-mono text-lg font-bold">{data.metrics.false_negatives}</p>
        </div>
      </div>

      {/* Precision & Recall */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="rounded border border-border bg-background p-2">
          <p className="font-mono text-[10px] text-muted-foreground">Precision</p>
          <p className="font-mono text-sm font-bold">
            {((data.metrics.true_positives / (data.metrics.true_positives + data.metrics.false_positives)) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="rounded border border-border bg-background p-2">
          <p className="font-mono text-[10px] text-muted-foreground">Recall</p>
          <p className="font-mono text-sm font-bold">
            {((data.metrics.true_positives / (data.metrics.true_positives + data.metrics.false_negatives)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </Card>
  )
}

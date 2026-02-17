"use client"

import { useState } from "react"
import { LocationSelector, type LocationData } from "@/components/dashboard/location-selector"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { DashboardHeader } from "@/components/dashboard/header"
import { StatsBar } from "@/components/dashboard/stats-bar"
import { DigitalTwin } from "@/components/dashboard/digital-twin"
import { ModelPerformance } from "@/components/dashboard/model-performance"
import { TrainingMetrics } from "@/components/dashboard/training-metrics"
import { AlertSystem } from "@/components/dashboard/alert-system"
import { ConfusionMatrixCard } from "@/components/dashboard/confusion-matrix"
import { RecentPredictions } from "@/components/dashboard/recent-predictions"

export default function Page() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)

  if (!selectedLocation) {
    return <LocationSelector onSelect={setSelectedLocation} />
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <DashboardHeader location={selectedLocation} onChangeLocation={() => setSelectedLocation(null)} />

        {/* Stats Bar */}
        <StatsBar location={selectedLocation} />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Digital Twin + Metrics */}
          <div className="flex flex-1 flex-col overflow-hidden p-2 gap-2">
            {/* Digital Twin - Takes most space */}
            <div className="flex-1 min-h-0">
              <DigitalTwin location={selectedLocation} />
            </div>

            {/* Bottom Row: Training Metrics + Confusion Matrix */}
            <div className="grid grid-cols-2 gap-2 flex-shrink-0">
              <TrainingMetrics />
              <ConfusionMatrixCard />
            </div>
          </div>

          {/* Right Sidebar: Model Performance + Recent Predictions + Alerts */}
          <div className="flex w-96 flex-col gap-2 overflow-hidden border-l border-border p-2">
            {/* Model Performance */}
            <div className="flex-shrink-0 overflow-hidden">
              <ModelPerformance />
            </div>

            {/* Recent Predictions */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <RecentPredictions />
            </div>

            {/* Alert History */}
            <div className="flex-shrink-0 overflow-hidden">
              <AlertSystem location={selectedLocation} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

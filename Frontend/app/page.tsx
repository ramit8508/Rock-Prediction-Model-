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
          {/* Left: Digital Twin + Telemetry */}
          <div className="flex flex-1 flex-col overflow-hidden p-2 gap-2">
            {/* Digital Twin - Takes most space */}
            <div className="flex-1 min-h-0">
              <DigitalTwin location={selectedLocation} />
            </div>

            {/* Bottom: Training Metrics */}
            <div className="flex-shrink-0">
              <TrainingMetrics />
            </div>
          </div>

          {/* Right Sidebar: Model Performance + Alerts */}
          <div className="flex w-80 flex-col gap-2 overflow-hidden border-l border-border p-2">
            {/* Model Performance */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ModelPerformance />
            </div>

            {/* Alert History */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <AlertSystem location={selectedLocation} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { format } from 'date-fns'
import { Calendar, RefreshCw } from 'lucide-react'
import type { DatasetKey, MetricsData } from '@/lib/types'
import { DatasetSelector } from './dataset-selector'

interface DashboardHeaderProps {
  data: MetricsData
  selectedDataset: DatasetKey
  onDatasetChange: (key: DatasetKey) => void
  latestDate: string
  onRefresh?: () => void
  isLoading?: boolean
}

export function DashboardHeader({
  data,
  selectedDataset,
  onDatasetChange,
  latestDate,
  onRefresh,
  isLoading,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Sales Dashboard</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Data through {latestDate ? format(new Date(latestDate), 'MMMM d, yyyy') : 'Loading...'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DatasetSelector
              data={data}
              selected={selectedDataset}
              onSelect={onDatasetChange}
            />
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="rounded-md p-2 hover:bg-secondary disabled:opacity-50"
                aria-label="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

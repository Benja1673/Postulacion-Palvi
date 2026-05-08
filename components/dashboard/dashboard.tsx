'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import type { MetricsData, DatasetKey, MetricKey } from '@/lib/types'
import { analyzeAllMetrics, getLatestData } from '@/lib/analytics'
import { DashboardHeader } from './header'
import { SalesAlertSection } from './sales-alert-section'
import { FunnelHealthSection } from './funnel-health-section'
import { SupportSection } from './support-section'
import { MetricDetail } from './metric-detail'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Dashboard() {
  const { data, error, isLoading, mutate } = useSWR<MetricsData>('/metrics.json', fetcher)
  const [selectedDataset, setSelectedDataset] = useState<DatasetKey>('A')
  const [expandedMetric, setExpandedMetric] = useState<MetricKey | null>(null)

  const handleMetricClick = useCallback((metricKey: MetricKey | string | null) => {
    setExpandedMetric(metricKey as MetricKey | null)
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <h2 className="font-semibold text-destructive">Failed to load data</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please check that metrics.json is available and try again.
          </p>
          <button
            onClick={() => mutate()}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const currentDataset = data[selectedDataset]
  const latestData = getLatestData(currentDataset)
  const analysisResults = analyzeAllMetrics(currentDataset)

  const expandedResult = expandedMetric
    ? analysisResults.find((r) => r.metric.key === expandedMetric)
    : null

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        data={data}
        selectedDataset={selectedDataset}
        onDatasetChange={setSelectedDataset}
        latestDate={latestData?.date || ''}
        onRefresh={() => mutate()}
        isLoading={isLoading}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Expanded Metric Detail Modal */}
          {expandedResult && (
            <MetricDetail
              result={expandedResult}
              dataset={currentDataset}
              onClose={() => setExpandedMetric(null)}
            />
          )}

          {/* Section 1: Sales Alerts - Critical action items */}
          <section>
            <SalesAlertSection
              results={analysisResults}
              dataset={currentDataset}
              onMetricClick={handleMetricClick}
            />
          </section>

          {/* Section 2: Funnel Health - Conversion visualization */}
          <section>
            <FunnelHealthSection
              results={analysisResults}
              dataset={currentDataset}
              onMetricClick={handleMetricClick}
            />
          </section>

          {/* Section 3: Support Health */}
          <section>
            <SupportSection
              results={analysisResults}
              dataset={currentDataset}
              onMetricClick={handleMetricClick}
            />
          </section>
        </div>
      </main>

      {/* Dataset Info Footer */}
      <footer className="mt-8 border-t border-border bg-card/30 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Dataset {selectedDataset}: {currentDataset.metadata.start_date} to{' '}
              {currentDataset.metadata.end_date}
            </span>
            <span>{currentDataset.days.length} days of data</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

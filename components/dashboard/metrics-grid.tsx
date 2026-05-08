'use client'

import type { AnomalyResult, Dataset, MetricKey } from '@/lib/types'
import { CATEGORIES, getMetricsByCategory } from '@/lib/metrics-config'
import { MetricCard } from './metric-card'
import { MetricDetail } from './metric-detail'

interface MetricsGridProps {
  results: AnomalyResult[]
  dataset: Dataset
  expandedMetric: MetricKey | null
  onMetricClick: (metricKey: MetricKey | null) => void
}

export function MetricsGrid({ results, dataset, expandedMetric, onMetricClick }: MetricsGridProps) {
  const getResultForMetric = (key: MetricKey) => {
    return results.find((r) => r.metric.key === key)
  }

  const expandedResult = expandedMetric ? getResultForMetric(expandedMetric) : null

  return (
    <div className="space-y-6">
      {expandedResult && (
        <MetricDetail
          result={expandedResult}
          dataset={dataset}
          onClose={() => onMetricClick(null)}
        />
      )}

      {CATEGORIES.map((category) => {
        const metrics = getMetricsByCategory(category.key)
        return (
          <div key={category.key}>
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">{category.label}</h3>
              <span className="text-xs text-muted-foreground">{category.description}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {metrics.map((metricConfig) => {
                const result = getResultForMetric(metricConfig.key)
                if (!result) return null
                return (
                  <MetricCard
                    key={metricConfig.key}
                    result={result}
                    dataset={dataset}
                    isExpanded={expandedMetric === metricConfig.key}
                    onClick={() =>
                      onMetricClick(
                        expandedMetric === metricConfig.key ? null : metricConfig.key
                      )
                    }
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

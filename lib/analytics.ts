import type { MetricKey, MetricConfig, AnomalyResult, Dataset, DayData } from './types'
import { METRICS_CONFIG } from './metrics-config'

const Z_SCORE_THRESHOLD = 1.5

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function calculateStdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2))
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length)
}

export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

export function getLatestData(dataset: Dataset): DayData | null {
  if (!dataset.days || dataset.days.length === 0) return null
  return dataset.days[dataset.days.length - 1]
}

export function getLast7Days(dataset: Dataset): DayData[] {
  if (!dataset.days) return []
  return dataset.days.slice(-8, -1) // Last 7 days excluding today
}

export function getLast14Days(dataset: Dataset): DayData[] {
  if (!dataset.days) return []
  return dataset.days.slice(-14)
}

export function getLast30Days(dataset: Dataset): DayData[] {
  if (!dataset.days) return []
  return dataset.days.slice(-30)
}

export function analyzeMetric(
  metric: MetricConfig,
  currentValue: number,
  historicalValues: number[]
): AnomalyResult {
  const mean = calculateMean(historicalValues)
  const stdDev = calculateStdDev(historicalValues, mean)
  const zScore = calculateZScore(currentValue, mean, stdDev)
  const absZScore = Math.abs(zScore)

  const percentChange = mean !== 0 ? ((currentValue - mean) / mean) * 100 : 0
  const trend: 'up' | 'down' = currentValue >= mean ? 'up' : 'down'

  // Determine if this is good or bad based on metric direction
  const isPositiveDeviation =
    (metric.higherIsBetter && trend === 'up') || (!metric.higherIsBetter && trend === 'down')

  // Severity based on z-score magnitude and whether it's a negative deviation
  let severity: AnomalyResult['severity'] = 'info'
  if (absZScore >= 2.5 && !isPositiveDeviation) {
    severity = 'critical'
  } else if (absZScore >= Z_SCORE_THRESHOLD && !isPositiveDeviation) {
    severity = 'warning'
  } else if (absZScore >= 2.5) {
    severity = 'info' // Large positive deviation
  }

  return {
    metric,
    currentValue,
    avgValue: mean,
    zScore,
    percentChange,
    trend,
    severity,
    isAnomaly: absZScore >= Z_SCORE_THRESHOLD,
  }
}

export function analyzeAllMetrics(dataset: Dataset): AnomalyResult[] {
  const latest = getLatestData(dataset)
  const last7Days = getLast7Days(dataset)

  if (!latest || last7Days.length === 0) return []

  return METRICS_CONFIG.map((metric) => {
    const currentValue = latest.metrics[metric.key]
    const historicalValues = last7Days.map((d) => d.metrics[metric.key])
    return analyzeMetric(metric, currentValue, historicalValues)
  })
}

export function getAnomalies(results: AnomalyResult[]): AnomalyResult[] {
  return results
    .filter((r) => r.isAnomaly)
    .sort((a, b) => {
      // Sort by severity first, then by absolute z-score
      const severityOrder = { critical: 0, warning: 1, info: 2 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity]
      }
      return Math.abs(b.zScore) - Math.abs(a.zScore)
    })
}

export function formatMetricValue(value: number, config: MetricConfig): string {
  switch (config.format) {
    case 'number':
      return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
    case 'decimal':
      return value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    case 'time':
      return `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })} min`
    case 'hours':
      return `${value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} hrs`
    default:
      return value.toString()
  }
}

export function formatChange(percentChange: number): string {
  const sign = percentChange >= 0 ? '+' : ''
  return `${sign}${percentChange.toFixed(1)}%`
}

export function getSparklineData(
  dataset: Dataset,
  metricKey: MetricKey,
  days: number = 14
): { date: string; value: number }[] {
  if (!dataset.days) return []
  const data = dataset.days.slice(-days)
  return data.map((d) => ({
    date: d.date,
    value: d.metrics[metricKey],
  }))
}

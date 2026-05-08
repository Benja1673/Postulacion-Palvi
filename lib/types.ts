// Actual metrics from the JSON file
export interface DayMetrics {
  traffic: number
  leads_created: number
  leads_qualified: number
  deals_created: number
  deals_won: number
  deals_lost: number
  avg_response_time_min: number
  avg_deal_cycle_days: number
  stale_deals: number
  support_tickets_opened: number
  support_avg_resolution_hours: number
}

export type MetricKey = keyof DayMetrics

export interface DayData {
  date: string
  metrics: DayMetrics
}

export interface MetricMetadata {
  key: MetricKey
  label: string
  unit: string
  direction: 'higher_is_better' | 'lower_is_better'
  description: string
}

export interface DatasetMetadata {
  start_date: string
  end_date: string
  days: number
  metrics: MetricMetadata[]
}

export interface Dataset {
  metadata: DatasetMetadata
  days: DayData[]
}

export interface MetricsData {
  A: Dataset
  B: Dataset
  C: Dataset
  D: Dataset
}

export type DatasetKey = keyof MetricsData

export interface MetricConfig {
  key: MetricKey
  label: string
  shortLabel: string
  unit: string
  format: 'number' | 'decimal' | 'time' | 'hours'
  category: 'funnel' | 'efficiency' | 'support'
  higherIsBetter: boolean
  description: string
}

export interface AnomalyResult {
  metric: MetricConfig
  currentValue: number
  avgValue: number
  zScore: number
  percentChange: number
  trend: 'up' | 'down'
  severity: 'critical' | 'warning' | 'info'
  isAnomaly: boolean
}

export interface DashboardState {
  selectedDataset: DatasetKey
  expandedMetric: MetricKey | null
}

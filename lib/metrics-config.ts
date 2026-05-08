import type { MetricConfig, MetricKey } from './types'

export const METRICS_CONFIG: MetricConfig[] = [
  // Funnel Metrics
  {
    key: 'traffic',
    label: 'Daily Visits',
    shortLabel: 'Traffic',
    unit: 'visits',
    format: 'number',
    category: 'funnel',
    higherIsBetter: true,
    description: 'Unique visits to the marketing site',
  },
  {
    key: 'leads_created',
    label: 'Leads Created',
    shortLabel: 'Leads',
    unit: 'leads',
    format: 'number',
    category: 'funnel',
    higherIsBetter: true,
    description: 'New leads captured today',
  },
  {
    key: 'leads_qualified',
    label: 'Leads Qualified',
    shortLabel: 'Qualified',
    unit: 'leads',
    format: 'number',
    category: 'funnel',
    higherIsBetter: true,
    description: 'Leads marked as qualified by sales',
  },
  {
    key: 'deals_created',
    label: 'Deals Created',
    shortLabel: 'New Deals',
    unit: 'deals',
    format: 'number',
    category: 'funnel',
    higherIsBetter: true,
    description: 'Sales opportunities opened today',
  },
  {
    key: 'deals_won',
    label: 'Deals Won',
    shortLabel: 'Won',
    unit: 'deals',
    format: 'number',
    category: 'funnel',
    higherIsBetter: true,
    description: 'Deals closed-won today',
  },
  {
    key: 'deals_lost',
    label: 'Deals Lost',
    shortLabel: 'Lost',
    unit: 'deals',
    format: 'number',
    category: 'funnel',
    higherIsBetter: false,
    description: 'Deals closed-lost today',
  },
  // Efficiency Metrics
  {
    key: 'avg_response_time_min',
    label: 'Avg Response Time',
    shortLabel: 'Response',
    unit: 'min',
    format: 'time',
    category: 'efficiency',
    higherIsBetter: false,
    description: 'Average time to first sales response',
  },
  {
    key: 'avg_deal_cycle_days',
    label: 'Avg Deal Cycle',
    shortLabel: 'Cycle',
    unit: 'days',
    format: 'decimal',
    category: 'efficiency',
    higherIsBetter: false,
    description: 'Average days from open to close',
  },
  {
    key: 'stale_deals',
    label: 'Stale Deals',
    shortLabel: 'Stale',
    unit: 'deals',
    format: 'number',
    category: 'efficiency',
    higherIsBetter: false,
    description: 'Open deals older than 60 days',
  },
  // Support Metrics
  {
    key: 'support_tickets_opened',
    label: 'Support Tickets',
    shortLabel: 'Tickets',
    unit: 'tickets',
    format: 'number',
    category: 'support',
    higherIsBetter: false,
    description: 'Support tickets opened today',
  },
  {
    key: 'support_avg_resolution_hours',
    label: 'Avg Resolution Time',
    shortLabel: 'Resolution',
    unit: 'hours',
    format: 'hours',
    category: 'support',
    higherIsBetter: false,
    description: 'Average ticket resolution time',
  },
]

export const CATEGORIES = [
  { key: 'funnel', label: 'Sales Funnel', description: 'Lead and deal progression' },
  { key: 'efficiency', label: 'Efficiency', description: 'Response and cycle times' },
  { key: 'support', label: 'Support', description: 'Customer support metrics' },
] as const

export function getMetricsByCategory(category: MetricConfig['category']): MetricConfig[] {
  return METRICS_CONFIG.filter((m) => m.category === category)
}

export function getMetricConfig(key: MetricKey): MetricConfig | undefined {
  return METRICS_CONFIG.find((m) => m.key === key)
}

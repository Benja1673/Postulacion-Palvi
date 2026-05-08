'use client'

import { AlertTriangle, Clock, Archive, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnomalyResult, Dataset } from '@/lib/types'
import { formatMetricValue, formatChange, getSparklineData } from '@/lib/analytics'
import { Sparkline } from './sparkline'

interface SalesAlertSectionProps {
  results: AnomalyResult[]
  dataset: Dataset
  onMetricClick: (metricKey: string) => void
}

export function SalesAlertSection({ results, dataset, onMetricClick }: SalesAlertSectionProps) {
  const responseTimeResult = results.find((r) => r.metric.key === 'avg_response_time_min')
  const staleDealsResult = results.find((r) => r.metric.key === 'stale_deals')

  if (!responseTimeResult || !staleDealsResult) return null

  const alerts = [
    {
      result: responseTimeResult,
      icon: Clock,
      title: 'Response Time',
      subtitle: 'Lead contact speed',
      sparklineData: getSparklineData(dataset, 'avg_response_time_min', 14),
    },
    {
      result: staleDealsResult,
      icon: Archive,
      title: 'Stale Deals',
      subtitle: '60+ days without movement',
      sparklineData: getSparklineData(dataset, 'stale_deals', 14),
    },
  ]

  const hasAnyAlert = alerts.some(
    (a) => a.result.severity === 'critical' || a.result.severity === 'warning'
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            hasAnyAlert ? 'bg-destructive/20' : 'bg-success/20'
          )}
        >
          <AlertTriangle
            className={cn('h-5 w-5', hasAnyAlert ? 'text-destructive' : 'text-success')}
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Sales Alerts</h2>
          <p className="text-sm text-muted-foreground">
            Critical metrics requiring immediate attention
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {alerts.map(({ result, icon: Icon, title, subtitle, sparklineData }) => {
          const isAboveAverage = result.currentValue > result.avgValue
          const isAlert =
            isAboveAverage &&
            (result.severity === 'critical' || result.severity === 'warning')

          return (
            <button
              key={result.metric.key}
              onClick={() => onMetricClick(result.metric.key)}
              className={cn(
                'group relative flex flex-col gap-4 rounded-xl border-2 p-5 text-left transition-all hover:shadow-lg',
                isAlert
                  ? 'border-destructive/60 bg-destructive/10 hover:border-destructive hover:bg-destructive/15'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
              )}
            >
              {/* Alert Badge */}
              {isAlert && (
                <div className="absolute -top-2 right-4 rounded-full bg-destructive px-3 py-0.5 text-xs font-semibold text-destructive-foreground">
                  NEEDS ATTENTION
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-lg',
                      isAlert ? 'bg-destructive/20' : 'bg-secondary'
                    )}
                  >
                    <Icon
                      className={cn('h-6 w-6', isAlert ? 'text-destructive' : 'text-foreground')}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                  </div>
                </div>

                {/* Trend Indicator */}
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                    isAboveAverage
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-success/20 text-success'
                  )}
                >
                  {isAboveAverage ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formatChange(result.percentChange)}
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <div
                    className={cn(
                      'text-3xl font-bold tabular-nums',
                      isAlert ? 'text-destructive' : 'text-foreground'
                    )}
                  >
                    {formatMetricValue(result.currentValue, result.metric)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    7-day avg:{' '}
                    <span className="font-medium">
                      {formatMetricValue(result.avgValue, result.metric)}
                    </span>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="h-12 w-24 shrink-0">
                  <Sparkline
                    data={sparklineData}
                    color={isAlert ? 'var(--destructive)' : 'var(--primary)'}
                    showDots={false}
                  />
                </div>
              </div>

              {/* Status Message */}
              <div
                className={cn(
                  'rounded-md px-3 py-2 text-sm',
                  isAlert ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                )}
              >
                {isAlert
                  ? result.metric.key === 'avg_response_time_min'
                    ? 'Leads are going cold. Push team to respond faster.'
                    : 'Deals are stalling. Review pipeline for stuck opportunities.'
                  : 'Within normal range. Keep monitoring.'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { AlertTriangle, TrendingDown, TrendingUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnomalyResult } from '@/lib/types'
import { formatMetricValue, formatChange } from '@/lib/analytics'

interface FocusAlertProps {
  anomalies: AnomalyResult[]
  onMetricClick: (metricKey: string) => void
}

export function FocusAlert({ anomalies, onMetricClick }: FocusAlertProps) {
  if (anomalies.length === 0) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
            <Sparkles className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-success">All Clear</h3>
            <p className="text-sm text-muted-foreground">
              No significant anomalies detected. All metrics within normal ranges.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const criticalCount = anomalies.filter((a) => a.severity === 'critical').length
  const warningCount = anomalies.filter((a) => a.severity === 'warning').length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="font-semibold">Focus Today</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {criticalCount > 0 && (
            <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-destructive">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="rounded-full bg-warning/20 px-2 py-0.5 text-warning">
              {warningCount} warning
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {anomalies.slice(0, 6).map((anomaly) => (
          <button
            key={anomaly.metric.key}
            onClick={() => onMetricClick(anomaly.metric.key)}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:bg-secondary/50',
              anomaly.severity === 'critical' && 'border-destructive/50 bg-destructive/5',
              anomaly.severity === 'warning' && 'border-warning/50 bg-warning/5',
              anomaly.severity === 'info' && 'border-primary/50 bg-primary/5'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                anomaly.severity === 'critical' && 'bg-destructive/20',
                anomaly.severity === 'warning' && 'bg-warning/20',
                anomaly.severity === 'info' && 'bg-primary/20'
              )}
            >
              {anomaly.trend === 'up' ? (
                <TrendingUp
                  className={cn(
                    'h-4 w-4',
                    anomaly.severity === 'critical' && 'text-destructive',
                    anomaly.severity === 'warning' && 'text-warning',
                    anomaly.severity === 'info' && 'text-primary'
                  )}
                />
              ) : (
                <TrendingDown
                  className={cn(
                    'h-4 w-4',
                    anomaly.severity === 'critical' && 'text-destructive',
                    anomaly.severity === 'warning' && 'text-warning',
                    anomaly.severity === 'info' && 'text-primary'
                  )}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{anomaly.metric.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold">
                  {formatMetricValue(anomaly.currentValue, anomaly.metric)}
                </span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    anomaly.severity === 'critical' && 'text-destructive',
                    anomaly.severity === 'warning' && 'text-warning',
                    anomaly.severity === 'info' && 'text-primary'
                  )}
                >
                  {formatChange(anomaly.percentChange)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                7d avg: {formatMetricValue(anomaly.avgValue, anomaly.metric)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

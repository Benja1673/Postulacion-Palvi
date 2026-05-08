'use client'

import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnomalyResult, Dataset } from '@/lib/types'
import { formatMetricValue, formatChange, getSparklineData } from '@/lib/analytics'
import { Sparkline } from './sparkline'

interface MetricCardProps {
  result: AnomalyResult
  dataset: Dataset
  isExpanded: boolean
  onClick: () => void
}

export function MetricCard({ result, dataset, isExpanded, onClick }: MetricCardProps) {
  const { metric, currentValue, avgValue, percentChange, trend, severity, isAnomaly } = result
  const sparklineData = getSparklineData(dataset, metric.key, 14)

  const getTrendIcon = () => {
    if (Math.abs(percentChange) < 1) {
      return <Minus className="h-3 w-3 text-muted-foreground" />
    }
    if (trend === 'up') {
      return <TrendingUp className={cn('h-3 w-3', isAnomaly ? 'text-current' : 'text-success')} />
    }
    return <TrendingDown className={cn('h-3 w-3', isAnomaly ? 'text-current' : 'text-destructive')} />
  }

  const getSparklineColor = () => {
    if (!isAnomaly) return 'hsl(var(--muted-foreground))'
    if (severity === 'critical') return 'hsl(var(--destructive))'
    if (severity === 'warning') return 'hsl(var(--warning))'
    return 'hsl(var(--primary))'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col rounded-lg border bg-card p-4 text-left transition-all hover:bg-secondary/30',
        isExpanded && 'ring-2 ring-primary',
        isAnomaly && severity === 'critical' && 'border-destructive/50',
        isAnomaly && severity === 'warning' && 'border-warning/50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm text-muted-foreground">{metric.shortLabel}</span>
            {isAnomaly && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                  severity === 'critical' && 'bg-destructive/20 text-destructive',
                  severity === 'warning' && 'bg-warning/20 text-warning',
                  severity === 'info' && 'bg-primary/20 text-primary'
                )}
              >
                {severity}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight">
              {formatMetricValue(currentValue, metric)}
            </span>
            <div
              className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                isAnomaly && severity === 'critical' && 'text-destructive',
                isAnomaly && severity === 'warning' && 'text-warning',
                !isAnomaly && percentChange >= 0 && 'text-success',
                !isAnomaly && percentChange < 0 && 'text-destructive'
              )}
            >
              {getTrendIcon()}
              {formatChange(percentChange)}
            </div>
          </div>
        </div>
        <ChevronRight
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isExpanded && 'rotate-90',
            'group-hover:text-foreground'
          )}
        />
      </div>

      <div className="mt-3 h-8">
        <Sparkline data={sparklineData} color={getSparklineColor()} />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>7d avg: {formatMetricValue(avgValue, metric)}</span>
        <span>{metric.unit}</span>
      </div>
    </button>
  )
}

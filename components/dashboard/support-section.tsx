'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Headphones, Clock, TicketIcon, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnomalyResult, Dataset } from '@/lib/types'
import { formatMetricValue, formatChange, getLast14Days, getLatestData, getLast7Days } from '@/lib/analytics'

interface SupportSectionProps {
  results: AnomalyResult[]
  dataset: Dataset
  onMetricClick: (metricKey: string) => void
}

export function SupportSection({ results, dataset, onMetricClick }: SupportSectionProps) {
  const resolutionResult = results.find((r) => r.metric.key === 'support_avg_resolution_hours')
  const ticketsResult = results.find((r) => r.metric.key === 'support_tickets_opened')

  const latestData = getLatestData(dataset)
  const last7Days = getLast7Days(dataset)

  // Get trend data for charts
  const resolutionTrendData = useMemo(() => {
    const data = getLast14Days(dataset)
    return data.map((d) => ({
      date: d.date.slice(5), // MM-DD format
      value: d.metrics.support_avg_resolution_hours,
    }))
  }, [dataset])

  const ticketsTrendData = useMemo(() => {
    const data = getLast14Days(dataset)
    return data.map((d) => ({
      date: d.date.slice(5),
      value: d.metrics.support_tickets_opened,
    }))
  }, [dataset])

  // Detect ticket volume spike
  const ticketSpike = useMemo(() => {
    if (!latestData || last7Days.length === 0) return null

    const currentTickets = latestData.metrics.support_tickets_opened
    const avgTickets =
      last7Days.reduce((sum, d) => sum + d.metrics.support_tickets_opened, 0) / last7Days.length
    const stdDev = Math.sqrt(
      last7Days.reduce((sum, d) => sum + Math.pow(d.metrics.support_tickets_opened - avgTickets, 2), 0) /
        last7Days.length
    )

    const zScore = stdDev > 0 ? (currentTickets - avgTickets) / stdDev : 0
    const isSpike = zScore > 1.5

    return {
      isSpike,
      currentTickets,
      avgTickets,
      percentAboveAvg: avgTickets > 0 ? ((currentTickets - avgTickets) / avgTickets) * 100 : 0,
    }
  }, [latestData, last7Days])

  if (!resolutionResult || !ticketsResult || !latestData) return null

  const isResolutionAlert =
    resolutionResult.currentValue > resolutionResult.avgValue &&
    (resolutionResult.severity === 'critical' || resolutionResult.severity === 'warning')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
          <Headphones className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Support Health</h2>
          <p className="text-sm text-muted-foreground">
            Customer satisfaction indicators
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Resolution Time Card */}
        <button
          onClick={() => onMetricClick('support_avg_resolution_hours')}
          className={cn(
            'group rounded-xl border-2 p-5 text-left transition-all hover:shadow-lg',
            isResolutionAlert
              ? 'border-destructive/60 bg-destructive/10 hover:border-destructive'
              : 'border-border bg-card hover:border-accent/50'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  isResolutionAlert ? 'bg-destructive/20' : 'bg-accent/20'
                )}
              >
                <Clock
                  className={cn('h-5 w-5', isResolutionAlert ? 'text-destructive' : 'text-accent')}
                />
              </div>
              <div>
                <h3 className="font-semibold">Avg Resolution Time</h3>
                <p className="text-xs text-muted-foreground">Time to resolve tickets</p>
              </div>
            </div>

            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                resolutionResult.trend === 'up'
                  ? 'bg-destructive/20 text-destructive'
                  : 'bg-success/20 text-success'
              )}
            >
              {resolutionResult.trend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatChange(resolutionResult.percentChange)}
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div
                className={cn(
                  'text-3xl font-bold tabular-nums',
                  isResolutionAlert ? 'text-destructive' : 'text-foreground'
                )}
              >
                {formatMetricValue(resolutionResult.currentValue, resolutionResult.metric)}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                7-day avg: {formatMetricValue(resolutionResult.avgValue, resolutionResult.metric)}
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="mt-4 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resolutionTrendData}>
                <defs>
                  <linearGradient id="resolutionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isResolutionAlert ? 'hsl(var(--destructive))' : 'hsl(var(--accent))'}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={isResolutionAlert ? 'hsl(var(--destructive))' : 'hsl(var(--accent))'}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} hrs`, 'Resolution']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={isResolutionAlert ? 'hsl(var(--destructive))' : 'hsl(var(--accent))'}
                  fill="url(#resolutionGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {isResolutionAlert && (
            <div className="mt-3 rounded-md bg-destructive/20 px-3 py-2 text-xs text-destructive">
              Support team may be overwhelmed. Customers waiting too long.
            </div>
          )}
        </button>

        {/* Tickets Opened Card */}
        <button
          onClick={() => onMetricClick('support_tickets_opened')}
          className={cn(
            'group rounded-xl border-2 p-5 text-left transition-all hover:shadow-lg',
            ticketSpike?.isSpike
              ? 'border-warning/60 bg-warning/10 hover:border-warning'
              : 'border-border bg-card hover:border-accent/50'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  ticketSpike?.isSpike ? 'bg-warning/20' : 'bg-accent/20'
                )}
              >
                <TicketIcon
                  className={cn('h-5 w-5', ticketSpike?.isSpike ? 'text-warning' : 'text-accent')}
                />
              </div>
              <div>
                <h3 className="font-semibold">Tickets Opened</h3>
                <p className="text-xs text-muted-foreground">New support requests</p>
              </div>
            </div>

            {ticketSpike && (
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  ticketSpike.percentAboveAvg > 0
                    ? 'bg-warning/20 text-warning'
                    : 'bg-success/20 text-success'
                )}
              >
                {ticketSpike.percentAboveAvg > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatChange(ticketSpike.percentAboveAvg)}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <div
                className={cn(
                  'text-3xl font-bold tabular-nums',
                  ticketSpike?.isSpike ? 'text-warning' : 'text-foreground'
                )}
              >
                {ticketsResult.currentValue.toLocaleString()}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                7-day avg: {ticketSpike?.avgTickets.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="mt-4 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ticketsTrendData}>
                <defs>
                  <linearGradient id="ticketsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={ticketSpike?.isSpike ? 'hsl(var(--warning))' : 'hsl(var(--accent))'}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={ticketSpike?.isSpike ? 'hsl(var(--warning))' : 'hsl(var(--accent))'}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [value, 'Tickets']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={ticketSpike?.isSpike ? 'hsl(var(--warning))' : 'hsl(var(--accent))'}
                  fill="url(#ticketsGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {ticketSpike?.isSpike && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-warning/20 px-3 py-2 text-xs text-warning">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>Unusual spike detected. Check for product issues or outages.</span>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

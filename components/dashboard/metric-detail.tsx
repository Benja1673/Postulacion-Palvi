'use client'

import { X } from 'lucide-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { AnomalyResult, Dataset } from '@/lib/types'
import { formatMetricValue, calculateMean, getLast7Days } from '@/lib/analytics'

interface MetricDetailProps {
  result: AnomalyResult
  dataset: Dataset
  onClose: () => void
}

export function MetricDetail({ result, dataset, onClose }: MetricDetailProps) {
  const { metric } = result
  const chartData = dataset.days.slice(-30).map((d) => ({
    date: d.date,
    value: d.metrics[metric.key],
    formattedDate: format(parseISO(d.date), 'MMM d'),
  }))

  const last7Days = getLast7Days(dataset)
  const avgValue = calculateMean(last7Days.map((d) => d.metrics[metric.key]))

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{metric.label}</h3>
          <p className="text-sm text-muted-foreground">{metric.description}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-secondary"
          aria-label="Close detail view"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
                return value.toString()
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border bg-popover px-3 py-2 shadow-md">
                    <p className="text-xs text-muted-foreground">{data.formattedDate}</p>
                    <p className="font-semibold">
                      {formatMetricValue(data.value, metric)}
                    </p>
                  </div>
                )
              }}
            />
            <ReferenceLine
              y={avgValue}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              label={{
                value: '7d avg',
                position: 'right',
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#metricGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="text-lg font-semibold">{formatMetricValue(result.currentValue, metric)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">7-day Average</p>
          <p className="text-lg font-semibold">{formatMetricValue(result.avgValue, metric)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Z-Score</p>
          <p className="text-lg font-semibold">{result.zScore.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

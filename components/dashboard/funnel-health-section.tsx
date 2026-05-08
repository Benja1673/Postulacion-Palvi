'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
  Tooltip,
} from 'recharts'
import { TrendingUp, TrendingDown, Target, Users, Handshake, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnomalyResult, Dataset } from '@/lib/types'
import { formatChange, getLatestData, getLast7Days } from '@/lib/analytics'

interface FunnelHealthSectionProps {
  results: AnomalyResult[]
  dataset: Dataset
  onMetricClick: (metricKey: string) => void
}

const FUNNEL_COLORS = {
  leads_created: 'oklch(0.75 0.10 155)',
  leads_qualified: 'oklch(0.55 0.14 155)',
  deals_created: 'oklch(0.45 0.12 155)',
  deals_won: 'oklch(0.35 0.10 155)',
}

export function FunnelHealthSection({
  results,
  dataset,
  onMetricClick,
}: FunnelHealthSectionProps) {
  const latestData = getLatestData(dataset)
  const last7Days = getLast7Days(dataset)

  const funnelData = useMemo(() => {
    if (!latestData) return []

    const { leads_created, leads_qualified, deals_created, deals_won, deals_lost } =
      latestData.metrics

    // Calculate conversion rates
    const qualificationRate = leads_created > 0 ? (leads_qualified / leads_created) * 100 : 0
    const dealCreationRate = leads_qualified > 0 ? (deals_created / leads_qualified) * 100 : 0
    const winRate = deals_won + deals_lost > 0 ? (deals_won / (deals_won + deals_lost)) * 100 : 0

    return [
      {
        stage: 'Leads Created',
        key: 'leads_created',
        value: leads_created,
        icon: Users,
        conversionToNext: qualificationRate,
        nextLabel: 'Qualification Rate',
      },
      {
        stage: 'Leads Qualified',
        key: 'leads_qualified',
        value: leads_qualified,
        icon: Target,
        conversionToNext: dealCreationRate,
        nextLabel: 'Deal Creation Rate',
      },
      {
        stage: 'Deals Created',
        key: 'deals_created',
        value: deals_created,
        icon: Handshake,
        conversionToNext: null,
        nextLabel: null,
      },
      {
        stage: 'Deals Won',
        key: 'deals_won',
        value: deals_won,
        icon: Trophy,
        conversionToNext: null,
        nextLabel: null,
      },
    ]
  }, [latestData])

  const winRateData = useMemo(() => {
    if (!latestData) return { current: 0, avg: 0, change: 0 }

    const { deals_won, deals_lost } = latestData.metrics
    const currentWinRate =
      deals_won + deals_lost > 0 ? (deals_won / (deals_won + deals_lost)) * 100 : 0

    // Calculate 7-day average win rate
    const avgWinRate =
      last7Days.length > 0
        ? last7Days.reduce((sum, day) => {
            const won = day.metrics.deals_won
            const lost = day.metrics.deals_lost
            return sum + (won + lost > 0 ? (won / (won + lost)) * 100 : 0)
          }, 0) / last7Days.length
        : 0

    const change = avgWinRate > 0 ? ((currentWinRate - avgWinRate) / avgWinRate) * 100 : 0

    return { current: currentWinRate, avg: avgWinRate, change }
  }, [latestData, last7Days])

  // Check for bottleneck: many qualified leads but few deals
  const bottleneckData = useMemo(() => {
    if (!latestData) return null

    const { leads_qualified, deals_created } = latestData.metrics
    const conversionRate = leads_qualified > 0 ? (deals_created / leads_qualified) * 100 : 0

    // Calculate 7-day average
    const avgConversionRate =
      last7Days.length > 0
        ? last7Days.reduce((sum, day) => {
            const qualified = day.metrics.leads_qualified
            const created = day.metrics.deals_created
            return sum + (qualified > 0 ? (created / qualified) * 100 : 0)
          }, 0) / last7Days.length
        : 0

    const isBottleneck = conversionRate < avgConversionRate * 0.8 && leads_qualified > 10

    return {
      isBottleneck,
      conversionRate,
      avgConversionRate,
      leadsQualified: leads_qualified,
      dealsCreated: deals_created,
    }
  }, [latestData, last7Days])

  if (!latestData) return null

  const chartData = funnelData.map((item) => ({
    name: item.stage,
    value: item.value,
    key: item.key,
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Funnel Health</h2>
          <p className="text-sm text-muted-foreground">
            Lead-to-deal conversion flow
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Funnel Chart */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            Today&apos;s Funnel Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={FUNNEL_COLORS[entry.key as keyof typeof FUNNEL_COLORS]}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      onClick={() => onMetricClick(entry.key)}
                    />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    fill="hsl(var(--foreground))"
                    fontSize={14}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Rate Labels */}
          <div className="mt-4 flex items-center justify-around border-t border-border pt-4">
            {funnelData.slice(0, 2).map((item) => (
              <div key={item.key} className="text-center">
                <div className="text-xs text-muted-foreground">{item.nextLabel}</div>
                <div className="text-lg font-semibold">
                  {item.conversionToNext?.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Win Rate & Bottleneck */}
        <div className="space-y-4">
          {/* Win Rate Card */}
          <button
            onClick={() => onMetricClick('deals_won')}
            className="w-full rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Win Rate</span>
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  winRateData.change >= 0
                    ? 'bg-success/20 text-success'
                    : 'bg-destructive/20 text-destructive'
                )}
              >
                {winRateData.change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatChange(winRateData.change)}
              </div>
            </div>
            <div className="mt-2 text-4xl font-bold">{winRateData.current.toFixed(1)}%</div>
            <div className="mt-1 text-sm text-muted-foreground">
              7-day avg: {winRateData.avg.toFixed(1)}%
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {latestData.metrics.deals_won} won / {latestData.metrics.deals_lost} lost today
            </div>
          </button>

          {/* Bottleneck Alert */}
          {bottleneckData && (
            <div
              className={cn(
                'rounded-xl border-2 p-5',
                bottleneckData.isBottleneck
                  ? 'border-warning/60 bg-warning/10'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-center gap-2">
                <Handshake
                  className={cn(
                    'h-5 w-5',
                    bottleneckData.isBottleneck ? 'text-warning' : 'text-muted-foreground'
                  )}
                />
                <span className="text-sm font-medium">Lead to Deal</span>
              </div>
              <div className="mt-2 text-2xl font-bold">
                {bottleneckData.conversionRate.toFixed(1)}%
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {bottleneckData.leadsQualified} qualified → {bottleneckData.dealsCreated} deals
              </div>
              {bottleneckData.isBottleneck && (
                <div className="mt-3 rounded-md bg-warning/20 px-3 py-2 text-xs text-warning">
                  Bottleneck detected. Qualified leads not converting to deals.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

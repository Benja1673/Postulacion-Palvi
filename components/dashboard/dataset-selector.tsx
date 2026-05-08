'use client'

import { cn } from '@/lib/utils'
import type { DatasetKey, MetricsData } from '@/lib/types'

interface DatasetSelectorProps {
  data: MetricsData
  selected: DatasetKey
  onSelect: (key: DatasetKey) => void
}

export function DatasetSelector({ selected, onSelect }: DatasetSelectorProps) {
  const datasets: DatasetKey[] = ['A', 'B', 'C', 'D']

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Dataset:</span>
      <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-1">
        {datasets.map((key) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              'relative px-4 py-1.5 text-sm font-medium transition-all rounded-md',
              selected === key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}

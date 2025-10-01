"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Github, Twitter, TrendingUp } from "lucide-react"
import type { SourceType } from "@/lib/multi-source-search"

interface SourceDistributionProps {
  sources: Array<{ source?: SourceType }>
}

export default function SourceDistribution({ sources }: SourceDistributionProps) {
  const distribution = sources.reduce(
    (acc, item) => {
      const source = item.source || "web"
      acc[source] = (acc[source] || 0) + 1
      return acc
    },
    {} as Record<SourceType, number>,
  )

  const total = sources.length
  const entries = Object.entries(distribution) as [SourceType, number][]

  const getIcon = (source: SourceType) => {
    switch (source) {
      case "github":
        return <Github className="w-4 h-4" />
      case "twitter":
        return <Twitter className="w-4 h-4" />
      case "crypto":
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getColor = (source: SourceType) => {
    switch (source) {
      case "github":
        return "bg-purple-500"
      case "twitter":
        return "bg-sky-500"
      case "crypto":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  if (total === 0) return null

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold text-sm">Source Distribution</h3>

      <div className="space-y-2">
        {entries.map(([source, count]) => {
          const percentage = (count / total) * 100

          return (
            <div key={source} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getIcon(source)}
                  <span className="capitalize">{source}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {count} ({percentage.toFixed(0)}%)
                </Badge>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${getColor(source)} rounded-full transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

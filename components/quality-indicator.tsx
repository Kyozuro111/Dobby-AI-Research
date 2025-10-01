"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Clock, Shield } from "lucide-react"
import type { SourceType } from "@/lib/multi-source-search"

interface QualityIndicatorProps {
  sources?: Array<{ source?: SourceType; url: string }>
}

export default function QualityIndicator({ sources }: QualityIndicatorProps) {
  if (!sources || sources.length === 0) return null

  const sourceCount = sources.length
  const hasMultipleSources = sourceCount >= 3
  const hasOfficialSources = sources.some((s) => s.source === "github" || s.url.includes("docs"))

  const getConfidenceLevel = () => {
    if (sourceCount >= 5 && hasOfficialSources) return { level: "high", color: "text-green-500", label: "High" }
    if (sourceCount >= 3) return { level: "medium", color: "text-yellow-500", label: "Medium" }
    return { level: "low", color: "text-orange-500", label: "Low" }
  }

  const confidence = getConfidenceLevel()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="outline" className="gap-1 text-xs">
        {confidence.level === "high" ? (
          <CheckCircle2 className={`w-3 h-3 ${confidence.color}`} />
        ) : (
          <AlertCircle className={`w-3 h-3 ${confidence.color}`} />
        )}
        <span className={confidence.color}>Confidence: {confidence.label}</span>
      </Badge>

      {hasMultipleSources && (
        <Badge variant="outline" className="gap-1 text-xs">
          <Shield className="w-3 h-3 text-blue-500" />
          <span className="text-blue-500">Verified</span>
        </Badge>
      )}

      {hasOfficialSources && (
        <Badge variant="outline" className="gap-1 text-xs">
          <CheckCircle2 className="w-3 h-3 text-purple-500" />
          <span className="text-purple-500">Official Sources</span>
        </Badge>
      )}

      <Badge variant="outline" className="gap-1 text-xs">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className="text-muted-foreground">{sourceCount} sources</span>
      </Badge>
    </div>
  )
}

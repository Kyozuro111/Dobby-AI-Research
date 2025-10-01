"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Globe, Github, Twitter, TrendingUp, Check } from "lucide-react"
import type { SourceType } from "@/lib/multi-source-search"

interface SourceSelectorProps {
  selectedSources: SourceType[]
  onSourcesChange: (sources: SourceType[]) => void
}

const sourceConfig = {
  web: {
    label: "Web Search",
    icon: Globe,
    color: "text-blue-500",
    description: "Search the web with Tavily",
  },
  github: {
    label: "GitHub",
    icon: Github,
    color: "text-purple-500",
    description: "Search repositories and code",
  },
  twitter: {
    label: "Twitter/X",
    icon: Twitter,
    color: "text-sky-500",
    description: "Search tweets and discussions",
  },
  crypto: {
    label: "Crypto Data",
    icon: TrendingUp,
    color: "text-green-500",
    description: "Get crypto prices and data",
  },
}

export default function SourceSelector({ selectedSources, onSourcesChange }: SourceSelectorProps) {
  const [open, setOpen] = useState(false)

  const toggleSource = (source: SourceType) => {
    if (selectedSources.includes(source)) {
      // Keep at least one source selected
      if (selectedSources.length > 1) {
        onSourcesChange(selectedSources.filter((s) => s !== source))
      }
    } else {
      onSourcesChange([...selectedSources, source])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Globe className="w-4 h-4" />
          Sources
          <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
            {selectedSources.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 z-[100]" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Research Sources</h4>
            <p className="text-sm text-muted-foreground">Select where to search for information</p>
          </div>

          <div className="space-y-2">
            {(Object.entries(sourceConfig) as [SourceType, (typeof sourceConfig)[SourceType]][]).map(
              ([source, config]) => {
                const Icon = config.icon
                const isSelected = selectedSources.includes(source)

                return (
                  <button
                    key={source}
                    onClick={() => toggleSource(source)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "border-[var(--sentient-primary)] bg-[var(--sentient-primary)]/5"
                        : "border-border hover:border-[var(--sentient-primary)]/50 hover:bg-accent"
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.color}`} />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{config.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-[var(--sentient-primary)]" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </button>
                )
              },
            )}
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">Tip: Select multiple sources for comprehensive research</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

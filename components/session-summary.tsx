"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import type { ResearchSession } from "@/lib/session-storage"

interface SessionSummaryProps {
  session: ResearchSession
}

export default function SessionSummary({ session }: SessionSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const generateSummary = async () => {
    setIsGenerating(true)

    try {
      const conversationText = session.messages
        .map((m) => `${m.role === "user" ? "Q" : "A"}: ${m.content}`)
        .join("\n\n")

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: conversationText }),
      })

      if (!response.ok) throw new Error("Failed to generate summary")

      const data = await response.json()
      setSummary(data.summary)
    } catch (error) {
      console.error("Summary generation error:", error)
      setSummary("Failed to generate summary. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (session.messages.length < 4) return null

  return (
    <Card className="p-4 border-[var(--sentient-primary)]/30 bg-gradient-to-br from-[var(--sentient-primary)]/5 to-[var(--sentient-secondary)]/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[var(--sentient-primary)]" />
            <h3 className="font-semibold text-sm">Session Summary</h3>
          </div>

          {!summary && !isGenerating && (
            <p className="text-xs text-muted-foreground mb-3">Get an AI-generated summary of this research session</p>
          )}

          {isGenerating && (
            <div className="flex items-center gap-2 text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating summary...</span>
            </div>
          )}

          {summary && isExpanded && (
            <div className="text-sm leading-relaxed whitespace-pre-wrap mt-2 text-muted-foreground">{summary}</div>
          )}
        </div>

        <div className="flex gap-1">
          {summary && (
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-7 w-7 p-0">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
          {!summary && !isGenerating && (
            <Button
              variant="outline"
              size="sm"
              onClick={generateSummary}
              className="h-7 px-3 bg-transparent hover:bg-[var(--sentient-primary)]/10"
            >
              Generate
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface SmartSuggestionsProps {
  messages: Message[]
  onSelectSuggestion: (suggestion: string) => void
}

export default function SmartSuggestions({ messages, onSelectSuggestion }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (messages.length >= 2 && messages.length % 2 === 0) {
      generateSuggestions()
    }
  }, [messages])

  const generateSuggestions = async () => {
    setIsLoading(true)

    try {
      const lastUserMessage = messages.filter((m) => m.role === "user").slice(-1)[0]
      const lastAssistantMessage = messages.filter((m) => m.role === "assistant").slice(-1)[0]

      const contextSuggestions = generateContextualSuggestions(lastUserMessage?.content, lastAssistantMessage?.content)

      setSuggestions(contextSuggestions)
    } catch (error) {
      console.error("Failed to generate suggestions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateContextualSuggestions = (userQuery?: string, assistantResponse?: string): string[] => {
    if (!userQuery || !assistantResponse) return []

    const suggestions: string[] = []
    const lowerQuery = userQuery.toLowerCase()
    const lowerResponse = assistantResponse.toLowerCase()

    if (lowerQuery.includes("what is") || lowerQuery.includes("explain")) {
      suggestions.push(`How does this compare to similar projects?`)
      suggestions.push(`What are the practical applications?`)
      suggestions.push(`What are the potential risks or challenges?`)
    }

    if (lowerResponse.includes("crypto") || lowerResponse.includes("token") || lowerResponse.includes("blockchain")) {
      suggestions.push(`What is the current price and market cap?`)
      suggestions.push(`Who are the main competitors?`)
      suggestions.push(`What does the community think about this?`)
    }

    if (lowerResponse.includes("github") || lowerResponse.includes("repository") || lowerResponse.includes("code")) {
      suggestions.push(`Show me the most recent commits and updates`)
      suggestions.push(`What are the main issues and discussions?`)
      suggestions.push(`How can I contribute to this project?`)
    }

    if (lowerResponse.includes("sentient") || lowerResponse.includes("dobby")) {
      suggestions.push(`How can I get involved with the Sentient community?`)
      suggestions.push(`What are the latest developments from Sentient?`)
      suggestions.push(`How does Sentient compare to other AI projects?`)
    }

    if (suggestions.length === 0) {
      suggestions.push(`Can you provide more details about this?`)
      suggestions.push(`What are the latest updates?`)
      suggestions.push(`How does this work in practice?`)
    }

    return suggestions.slice(0, 3)
  }

  if (messages.length < 2 || suggestions.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-[var(--sentient-primary)]" />
        <span>Suggested follow-ups:</span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Generating suggestions...</span>
        </div>
      ) : (
        <div className="grid gap-2">
          {suggestions.map((suggestion, idx) => (
            <Card
              key={idx}
              className="p-3 hover-lift cursor-pointer group relative overflow-hidden border-border/50 hover:border-[var(--sentient-primary)]/50 transition-all"
              onClick={() => onSelectSuggestion(suggestion)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--sentient-primary)]/0 to-[var(--sentient-secondary)]/0 group-hover:from-[var(--sentient-primary)]/5 group-hover:to-[var(--sentient-secondary)]/5 transition-all" />
              <p className="text-sm relative z-10">{suggestion}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

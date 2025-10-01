"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ExternalLink,
  Globe,
  Github,
  Twitter,
  TrendingUp,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react"
import Image from "next/image"
import QualityIndicator from "@/components/quality-indicator"
import type { SourceType } from "@/lib/multi-source-search"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Array<{ title: string; url: string; snippet: string; source?: SourceType }>
  timestamp: Date
  isStreaming?: boolean
  bookmarked?: boolean
}

interface MessageBubbleProps {
  message: Message
  onToggleBookmark?: (messageId: string) => void
}

const getSourceIcon = (source?: SourceType) => {
  switch (source) {
    case "github":
      return <Github className="w-3 h-3" />
    case "twitter":
      return <Twitter className="w-3 h-3" />
    case "crypto":
      return <TrendingUp className="w-3 h-3" />
    case "web":
    default:
      return <Globe className="w-3 h-3" />
  }
}

const getSourceColor = (source?: SourceType) => {
  switch (source) {
    case "github":
      return "text-purple-500"
    case "twitter":
      return "text-sky-500"
    case "crypto":
      return "text-green-500"
    case "web":
    default:
      return "text-blue-500"
  }
}

const getSourceLabel = (source?: SourceType) => {
  switch (source) {
    case "github":
      return "GitHub"
    case "twitter":
      return "Twitter"
    case "crypto":
      return "Crypto"
    case "web":
    default:
      return "Web"
  }
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-3">
      <div className="absolute right-2 top-2 z-10">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
      <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-xs">
        <code className="font-mono">{code}</code>
      </pre>
      {language && (
        <Badge variant="secondary" className="absolute left-2 top-2 text-xs">
          {language}
        </Badge>
      )}
    </div>
  )
}

function FormattedContent({ content }: { content: string }) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  const parts: Array<{ type: "text" | "code"; content: string; language?: string }> = []
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, match.index) })
    }
    parts.push({ type: "code", content: match[2].trim(), language: match[1] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) })
  }

  if (parts.length === 0) {
    parts.push({ type: "text", content })
  }

  return (
    <>
      {parts.map((part, idx) =>
        part.type === "code" ? (
          <CodeBlock key={idx} code={part.content} language={part.language} />
        ) : (
          <p key={idx} className="text-sm whitespace-pre-wrap leading-relaxed">
            {part.content}
          </p>
        ),
      )}
    </>
  )
}

export default function MessageBubble({ message, onToggleBookmark }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const [sourcesExpanded, setSourcesExpanded] = useState(true)
  const hasManySources = (message.sources?.length || 0) > 3

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--dobby-yellow)] to-[var(--dobby-amber)] rounded-full blur-md opacity-40" />
            <Image
              src="/user-avatar.webp"
              alt="You"
              width={40}
              height={40}
              className="rounded-full relative z-10 ring-2 ring-[var(--dobby-yellow)]/40"
            />
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--dobby-blue)] to-[var(--dobby-cyan)] rounded-full blur-md opacity-50" />
            <Image
              src="/dobby.webp"
              alt="Dobby"
              width={40}
              height={40}
              className="rounded-full relative z-10 ring-2 ring-[var(--dobby-blue)]/40"
            />
          </div>
        )}
      </div>

      <div className={`flex-1 space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <Card
          className={`p-4 max-w-[85%] hover-lift relative group ${
            isUser
              ? "bg-gradient-to-br from-[var(--sentient-primary)] to-[var(--sentient-secondary)] text-white shadow-lg shadow-[var(--sentient-primary)]/20"
              : "glass border-border/50"
          }`}
        >
          {onToggleBookmark && !isUser && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleBookmark(message.id)}
              className={`absolute right-2 top-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                message.bookmarked ? "text-yellow-500" : ""
              }`}
            >
              <Star className={`w-4 h-4 ${message.bookmarked ? "fill-current" : ""}`} />
            </Button>
          )}
          <FormattedContent content={message.content} />
          {message.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse rounded-sm" />}
        </Card>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="max-w-[85%]">
            <QualityIndicator sources={message.sources} />
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="space-y-2 max-w-[85%] w-full">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Sources ({message.sources.length})
              </p>
              {hasManySources && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSourcesExpanded(!sourcesExpanded)}
                  className="h-6 px-2 text-xs"
                >
                  {sourcesExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Expand
                    </>
                  )}
                </Button>
              )}
            </div>
            {(sourcesExpanded ? message.sources : message.sources.slice(0, 3)).map((source, idx) => (
              <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="block">
                <Card className="p-3 hover-lift border-border/50 hover:border-[var(--sentient-primary)]/50 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--sentient-primary)]/0 to-[var(--sentient-secondary)]/0 group-hover:from-[var(--sentient-primary)]/5 group-hover:to-[var(--sentient-secondary)]/5 transition-all duration-300" />
                  <div className="flex items-start gap-2 relative z-10">
                    <div className={`${getSourceColor(source.source)} flex-shrink-0 mt-0.5`}>
                      {getSourceIcon(source.source)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate group-hover:text-[var(--sentient-primary)] transition-colors">
                          {source.title}
                        </p>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {getSourceLabel(source.source)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{source.snippet}</p>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        )}

        <span className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  )
}

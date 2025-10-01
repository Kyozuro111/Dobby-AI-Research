"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, Loader2, StopCircle, Trash2, Sparkles } from "lucide-react"
import MessageBubble from "@/components/message-bubble"
import TagManager from "@/components/tag-manager"
import ShareSession from "@/components/share-session"
import SessionSummary from "@/components/session-summary"
import Image from "next/image"
import { SessionStorage, type ResearchSession } from "@/lib/session-storage"
import SourceSelector from "@/components/source-selector"
import TemplateSelector from "@/components/template-selector"
import CompareMode from "@/components/compare-mode"
import SmartSuggestions from "@/components/smart-suggestions"
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

interface ChatInterfaceProps {
  currentSessionId: string | null
  onSessionChange: (sessionId: string | null) => void
}

export default function ChatInterface({ currentSessionId, onSessionChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [selectedSources, setSelectedSources] = useState<SourceType[]>(["web"])
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasNotifiedParent = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (currentSessionId) {
      const session = SessionStorage.get(currentSessionId)
      if (session) {
        setMessages(session.messages)
        setCurrentSession(session)
        hasNotifiedParent.current = true
      }
    } else {
      // Clear all state when no session
      setMessages([])
      setCurrentSession(null)
      setInput("")
      hasNotifiedParent.current = false
    }
  }, [currentSessionId])

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const sessionId = currentSessionId || `session-${Date.now()}`

      const session: ResearchSession = {
        id: sessionId,
        title: SessionStorage.generateTitle(messages),
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: m.sources,
          timestamp: m.timestamp,
          bookmarked: m.bookmarked,
        })),
        createdAt: currentSessionId ? SessionStorage.get(sessionId)?.createdAt || new Date() : new Date(),
        updatedAt: new Date(),
        tags: currentSession?.tags || [],
      }

      SessionStorage.save(session)
      setCurrentSession(session)

      // Only notify parent once when creating a new session
      if (!currentSessionId && !hasNotifiedParent.current) {
        hasNotifiedParent.current = true
        onSessionChange(sessionId)
      }
    }
  }, [messages, currentSessionId, currentSession?.tags, isLoading, onSessionChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault()
        textareaRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear the current chat?")) {
      setMessages([])
      setCurrentSession(null)
      onSessionChange(null)
    }
  }

  const handleStop = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsLoading(false)
    }
  }

  const handleToggleBookmark = (messageId: string) => {
    if (!currentSessionId) return
    SessionStorage.toggleBookmark(currentSessionId, messageId)
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, bookmarked: !m.bookmarked } : m)))
  }

  const handleTagsChange = () => {
    if (currentSessionId) {
      const session = SessionStorage.get(currentSessionId)
      if (session) {
        setCurrentSession(session)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }
    setMessages((prev) => [...prev, assistantMessage])

    const controller = new AbortController()
    setAbortController(controller)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          sources: selectedSources,
        }),
        signal: controller.signal,
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("No response body")

      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)

              if (parsed.content) {
                accumulatedContent += parsed.content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId ? { ...msg, content: accumulatedContent, isStreaming: true } : msg,
                  ),
                )
              }

              if (parsed.sources) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId ? { ...msg, sources: parsed.sources, isStreaming: false } : msg,
                  ),
                )
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg)))
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + "\n\n[Response stopped]", isStreaming: false }
              : msg,
          ),
        )
      } else {
        console.error("Chat error:", error)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: "Sorry, I encountered an error. Please try again.",
                  isStreaming: false,
                }
              : msg,
          ),
        )
      }
    } finally {
      setIsLoading(false)
      setAbortController(null)
    }
  }

  const suggestedQuestions = [
    "What are the latest developments in AI research?",
    "Explain blockchain technology in simple terms",
    "What's trending in crypto markets today?",
  ]

  const handleSelectTemplate = (questions: string[], sources: SourceType[]) => {
    setSelectedSources(sources)
    setInput(questions[0])
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setInput(suggestion)
    textareaRef.current?.focus()
  }

  const handleCompare = (query: string, _: string, sources: SourceType[]) => {
    setSelectedSources(sources)
    setInput(query)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex-1 flex flex-col container mx-auto max-w-4xl p-4 relative z-10">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-8 max-w-2xl gradient-glow px-4">
            <div className="relative z-10">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--dobby-blue)] via-[var(--dobby-cyan)] to-[var(--dobby-yellow)] rounded-full blur-3xl opacity-40 animate-pulse" />
                <Image
                  src="/dobby.webp"
                  alt="Dobby"
                  width={180}
                  height={180}
                  className="relative z-10 drop-shadow-2xl"
                />
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Hey there! I'm Dobby.</h2>
              <p className="text-muted-foreground text-lg md:text-xl mb-8 text-pretty leading-relaxed">
                Your intelligent research companion. Ask me anything about{" "}
                <span className="text-[var(--dobby-blue)] font-semibold">technology</span>,{" "}
                <span className="text-[var(--dobby-cyan)] font-semibold">AI</span>,{" "}
                <span className="text-[var(--dobby-amber)] font-semibold">crypto</span>, or any topic you're curious
                about. I'll search multiple sources and give you comprehensive answers.
              </p>

              <div className="grid gap-3 text-left">
                {suggestedQuestions.map((question, idx) => (
                  <Card
                    key={idx}
                    className="p-4 hover-lift cursor-pointer group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm"
                    onClick={() => setInput(question)}
                  >
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-300" />
                    <div className="flex items-start gap-3 relative z-10">
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 group-hover:text-[var(--dobby-amber)] transition-colors" />
                      <p className="text-sm leading-relaxed">{question}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              {currentSession && currentSessionId && (
                <TagManager
                  sessionId={currentSessionId}
                  tags={currentSession.tags || []}
                  onTagsChange={handleTagsChange}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              {currentSession && <ShareSession session={currentSession} />}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          {currentSession && messages.length >= 4 && <SessionSummary session={currentSession} />}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onToggleBookmark={handleToggleBookmark} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--sentient-primary)]" />
              <span className="text-sm shimmer">Dobby is researching...</span>
            </div>
          )}
          {!isLoading && messages.length > 0 && (
            <SmartSuggestions messages={messages} onSelectSuggestion={handleSelectSuggestion} />
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-background via-background to-transparent">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <SourceSelector selectedSources={selectedSources} onSourcesChange={setSelectedSources} />
          <TemplateSelector onSelectTemplate={handleSelectTemplate} />
          <CompareMode onCompare={handleCompare} />
          <span className="text-xs text-muted-foreground">
            Searching: {selectedSources.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div className="relative animated-border rounded-lg">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Ask me anything..."
              className="min-h-[60px] pr-12 resize-none bg-background/50 backdrop-blur-sm border-0"
              disabled={isLoading}
            />
          </div>
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={handleStop}
              className="absolute right-3 bottom-3 shadow-lg"
            >
              <StopCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-3 bg-gradient-to-r from-[var(--sentient-primary)] to-[var(--sentient-secondary)] hover:opacity-90 transition-opacity shadow-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </form>
        <p className="text-xs text-center text-muted-foreground mt-3">
          Powered by <span className="text-primary font-semibold">Dobby AI</span>
        </p>
      </div>
    </div>
  )
}

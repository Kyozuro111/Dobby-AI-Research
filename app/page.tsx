"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Keyboard, Sparkles, Zap, Brain } from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import SessionManager from "@/components/session-manager"
import KeyboardShortcuts from "@/components/keyboard-shortcuts"
import Image from "next/image"
import { SessionStorage, type ResearchSession } from "@/lib/session-storage"

export default function Home() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showSessionSearch, setShowSessionSearch] = useState(false)

  useEffect(() => {
    setIsReady(true)
    const sessionId = SessionStorage.getCurrentSessionId()
    setCurrentSessionId(sessionId)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const modKey = isMac ? e.metaKey : e.ctrlKey

      if (e.key === "?" && !e.shiftKey) {
        e.preventDefault()
        setShowShortcuts(true)
      }

      if (modKey && e.key === "k") {
        e.preventDefault()
        setShowSessionSearch(true)
      }

      if (modKey && e.key === "n") {
        e.preventDefault()
        handleNewSession()
      }

      if (modKey && e.key === "e") {
        e.preventDefault()
        if (currentSessionId) {
          const session = SessionStorage.get(currentSessionId)
          if (session) {
            SessionStorage.exportToMarkdown(session)
          }
        }
      }

      if (e.key === "Escape") {
        setShowShortcuts(false)
        setShowSessionSearch(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentSessionId])

  const handleSessionChange = useCallback((sessionId: string | null) => {
    setCurrentSessionId(sessionId)
    if (sessionId) {
      SessionStorage.setCurrentSessionId(sessionId)
    }
  }, [])

  const handleLoadSession = (session: ResearchSession) => {
    setCurrentSessionId(session.id)
    SessionStorage.setCurrentSessionId(session.id)
    setShowSessionSearch(false)
  }

  const handleNewSession = () => {
    // Clear current session
    setCurrentSessionId(null)
    SessionStorage.setCurrentSessionId(null)

    // Force component re-mount by toggling ready state
    setIsReady(false)
    setTimeout(() => setIsReady(true), 0)
  }

  const handleDeleteSession = (id: string) => {
    if (currentSessionId === id) {
      handleNewSession()
    }
  }

  if (!isReady) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="grid-pattern" />
        <div className="gradient-glow w-full max-w-3xl">
          <Card className="glass-card p-12 md:p-16 text-center space-y-8 relative z-10 hover-lift border-2">
            <div className="flex justify-center mb-6">
              <div className="relative float-animation">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--dobby-blue)] via-[var(--dobby-cyan)] to-[var(--dobby-pink)] rounded-full blur-3xl opacity-40 animate-pulse" />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[var(--dobby-yellow)] to-[var(--dobby-amber)] rounded-full blur-2xl opacity-30 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
                <Image
                  src="/sentient-logo.webp"
                  alt="Sentient"
                  width={140}
                  height={140}
                  className="relative z-10 bg-white/95 rounded-full p-5 ring-2 ring-white/20 shadow-2xl"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight tracking-tight">
                Welcome to <span className="gradient-text">Dobby AI</span>
              </h1>
              <p className="text-muted-foreground text-xl md:text-2xl font-light text-balance">
                Your intelligent research companion powered by advanced AI
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <Brain className="w-8 h-8 text-[var(--dobby-blue)]" />
                <p className="text-sm font-medium">Deep Research</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-accent/5 border border-accent/10">
                <Zap className="w-8 h-8 text-[var(--dobby-amber)]" />
                <p className="text-sm font-medium">Lightning Fast</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[var(--dobby-cyan)]/5 border border-[var(--dobby-cyan)]/10">
                <Sparkles className="w-8 h-8 text-[var(--dobby-cyan)]" />
                <p className="text-sm font-medium">AI-Powered</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="grid-pattern" />
      <header className="border-b border-border/30 backdrop-blur-xl sticky top-0 z-50 glass-card relative">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between relative z-10">
          <button onClick={handleNewSession} className="flex items-center gap-3 hover:opacity-90 transition-all group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--dobby-blue)] to-[var(--dobby-cyan)] rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <Image
                src="/sentient-logo.webp"
                alt="Sentient"
                width={40}
                height={40}
                className="rounded-full relative z-10 ring-2 ring-white/10 bg-white p-1 shadow-lg"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg gradient-text">Dobby AI Research</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[var(--dobby-amber)]" />
                Intelligent Research Assistant
              </p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcuts(true)}
              title="Keyboard shortcuts (?)"
              className="hover:bg-primary/10 hover:text-primary transition-all glow-on-hover"
            >
              <Keyboard className="w-5 h-5" />
            </Button>
            <SessionManager
              currentSessionId={currentSessionId}
              onLoadSession={handleLoadSession}
              onNewSession={handleNewSession}
              onDeleteSession={handleDeleteSession}
              open={showSessionSearch}
              onOpenChange={setShowSessionSearch}
            />
          </div>
        </div>
      </header>
      <ChatInterface currentSessionId={currentSessionId} onSessionChange={handleSessionChange} />
      <footer className="border-t border-border/30 backdrop-blur-xl glass-card py-4 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Built with <span className="text-[var(--dobby-pink)]">♥</span> by{" "}
            <span className="gradient-text font-semibold">Kyozuro</span>
          </p>
        </div>
      </footer>
      <KeyboardShortcuts open={showShortcuts} onOpenChange={setShowShortcuts} />
    </main>
  )
}

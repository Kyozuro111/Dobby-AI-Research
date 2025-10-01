"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { History, MoreVertical, Trash2, FileJson, FileText, Plus, Search } from "lucide-react"
import { SessionStorage, type ResearchSession } from "@/lib/session-storage"
import { formatDistanceToNow } from "date-fns"

interface SessionManagerProps {
  currentSessionId: string | null
  onLoadSession: (session: ResearchSession) => void
  onNewSession: () => void
  onDeleteSession?: (id: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function SessionManager({
  currentSessionId,
  onLoadSession,
  onNewSession,
  onDeleteSession,
  open: controlledOpen,
  onOpenChange,
}: SessionManagerProps) {
  const [sessions, setSessions] = useState<ResearchSession[]>([])
  const [internalOpen, setInternalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const loadSessions = () => {
    setSessions(SessionStorage.getAll())
  }

  useEffect(() => {
    loadSessions()
  }, [open])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this session?")) {
      SessionStorage.delete(id)
      loadSessions()
      onDeleteSession?.(id)
    }
  }

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete ALL sessions? This cannot be undone.")) {
      SessionStorage.deleteAll()
      loadSessions()
      onNewSession()
    }
  }

  const handleExportJSON = (session: ResearchSession, e: React.MouseEvent) => {
    e.stopPropagation()
    SessionStorage.exportSession(session)
  }

  const handleExportMarkdown = (session: ResearchSession, e: React.MouseEvent) => {
    e.stopPropagation()
    SessionStorage.exportAsMarkdown(session)
  }

  const handleLoadSession = (session: ResearchSession) => {
    onLoadSession(session)
    setOpen(false)
  }

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[var(--sentient-primary)]/10 hover:text-[var(--sentient-primary)] transition-colors relative"
        >
          <History className="w-5 h-5" />
          {sessions.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--sentient-primary)] text-white text-xs rounded-full flex items-center justify-center">
              {sessions.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--sentient-primary)]" />
            Research Sessions
          </SheetTitle>
          <SheetDescription>View, load, or export your previous research sessions</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Button onClick={onNewSession} className="flex-1 bg-transparent" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
            {sessions.length > 0 && (
              <Button onClick={handleDeleteAll} variant="destructive" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {sessions.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {sessions.length === 0 ? (
            <Card className="p-8 text-center">
              <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No saved sessions yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your research sessions will be automatically saved here
              </p>
            </Card>
          ) : filteredSessions.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No sessions found</p>
              <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-2 pr-4">
                {filteredSessions.map((session) => (
                  <Card
                    key={session.id}
                    className={`p-4 cursor-pointer hover-lift transition-all ${
                      currentSessionId === session.id
                        ? "border-[var(--sentient-primary)] bg-[var(--sentient-primary)]/5"
                        : "hover:border-[var(--sentient-primary)]/50"
                    }`}
                    onClick={() => handleLoadSession(session)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate mb-1">{session.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{session.messages.length} messages</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(session.updatedAt, { addSuffix: true })}</span>
                        </div>
                        {session.tags && session.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {session.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded-full bg-[var(--sentient-primary)]/10 text-[var(--sentient-primary)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleExportMarkdown(session, e)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Export as Markdown
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleExportJSON(session, e)}>
                            <FileJson className="w-4 h-4 mr-2" />
                            Export as JSON
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => handleDelete(session.id, e)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

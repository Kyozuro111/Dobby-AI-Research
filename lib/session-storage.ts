export interface ResearchSession {
  id: string
  title: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    sources?: Array<{ title: string; url: string; snippet: string }>
    timestamp: Date
    bookmarked?: boolean
  }>
  createdAt: Date
  updatedAt: Date
  tags?: string[]
}

export const SessionStorage = {
  SESSIONS_KEY: "research_sessions",
  CURRENT_SESSION_KEY: "current_session_id",

  // Get all sessions
  getAll(): ResearchSession[] {
    if (typeof window === "undefined") return []
    try {
      const data = localStorage.getItem(this.SESSIONS_KEY)
      if (!data) return []
      const sessions = JSON.parse(data)
      return sessions.map((s: ResearchSession) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
      }))
    } catch (e) {
      console.error("Failed to load sessions:", e)
      return []
    }
  },

  // Get single session by ID
  get(id: string): ResearchSession | null {
    const sessions = this.getAll()
    return sessions.find((s) => s.id === id) || null
  },

  // Save or update session
  save(session: ResearchSession): void {
    if (typeof window === "undefined") return
    try {
      const sessions = this.getAll()
      const existingIndex = sessions.findIndex((s) => s.id === session.id)

      if (existingIndex >= 0) {
        sessions[existingIndex] = { ...session, updatedAt: new Date() }
      } else {
        sessions.push(session)
      }

      // Sort by updatedAt descending
      sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions))
    } catch (e) {
      console.error("Failed to save session:", e)
    }
  },

  // Delete session
  delete(id: string): void {
    if (typeof window === "undefined") return
    try {
      const sessions = this.getAll().filter((s) => s.id !== id)
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions))

      // Clear current session if it was deleted
      if (this.getCurrentSessionId() === id) {
        this.setCurrentSessionId(null)
      }
    } catch (e) {
      console.error("Failed to delete session:", e)
    }
  },

  // Delete all sessions
  deleteAll(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.SESSIONS_KEY)
    localStorage.removeItem(this.CURRENT_SESSION_KEY)
  },

  // Get current session ID
  getCurrentSessionId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.CURRENT_SESSION_KEY)
  },

  // Set current session ID
  setCurrentSessionId(id: string | null): void {
    if (typeof window === "undefined") return
    if (id) {
      localStorage.setItem(this.CURRENT_SESSION_KEY, id)
    } else {
      localStorage.removeItem(this.CURRENT_SESSION_KEY)
    }
  },

  // Generate session title from first user message
  generateTitle(messages: ResearchSession["messages"]): string {
    const firstUserMessage = messages.find((m) => m.role === "user")
    if (!firstUserMessage) return "New Research Session"

    const content = firstUserMessage.content.trim()
    if (content.length <= 50) return content

    return content.substring(0, 47) + "..."
  },

  addTag(sessionId: string, tag: string): void {
    const session = this.get(sessionId)
    if (!session) return

    const tags = session.tags || []
    if (!tags.includes(tag)) {
      tags.push(tag)
      this.save({ ...session, tags })
    }
  },

  removeTag(sessionId: string, tag: string): void {
    const session = this.get(sessionId)
    if (!session) return

    const tags = (session.tags || []).filter((t) => t !== tag)
    this.save({ ...session, tags })
  },

  toggleBookmark(sessionId: string, messageId: string): void {
    const session = this.get(sessionId)
    if (!session) return

    const messages = session.messages.map((m) => (m.id === messageId ? { ...m, bookmarked: !m.bookmarked } : m))

    this.save({ ...session, messages })
  },

  getBookmarkedMessages(): Array<{ session: ResearchSession; message: ResearchSession["messages"][0] }> {
    const sessions = this.getAll()
    const bookmarked: Array<{ session: ResearchSession; message: ResearchSession["messages"][0] }> = []

    sessions.forEach((session) => {
      session.messages.forEach((message) => {
        if (message.bookmarked) {
          bookmarked.push({ session, message })
        }
      })
    })

    return bookmarked
  },

  generateShareableText(session: ResearchSession): string {
    let text = `${session.title}\n\n`

    session.messages.forEach((msg) => {
      if (msg.role === "user") {
        text += `Q: ${msg.content}\n\n`
      } else {
        text += `A: ${msg.content}\n\n`
        if (msg.sources && msg.sources.length > 0) {
          text += `Sources:\n`
          msg.sources.forEach((source) => {
            text += `- ${source.title}: ${source.url}\n`
          })
          text += `\n`
        }
      }
    })

    return text
  },

  // Export session as JSON
  exportSession(session: ResearchSession): void {
    const dataStr = JSON.stringify(session, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `research-session-${session.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  },

  // Export session as Markdown
  exportAsMarkdown(session: ResearchSession): void {
    let markdown = `# ${session.title}\n\n`
    markdown += `**Created:** ${session.createdAt.toLocaleString()}\n`
    markdown += `**Updated:** ${session.updatedAt.toLocaleString()}\n\n`

    if (session.tags && session.tags.length > 0) {
      markdown += `**Tags:** ${session.tags.join(", ")}\n\n`
    }

    markdown += `---\n\n`

    session.messages.forEach((msg) => {
      if (msg.role === "user") {
        markdown += `## 🙋 User\n\n${msg.content}\n\n`
      } else {
        markdown += `## 🤖 Dobby\n\n${msg.content}\n\n`

        if (msg.sources && msg.sources.length > 0) {
          markdown += `### Sources\n\n`
          msg.sources.forEach((source, idx) => {
            markdown += `${idx + 1}. [${source.title}](${source.url})\n`
            markdown += `   > ${source.snippet}\n\n`
          })
        }
      }

      markdown += `---\n\n`
    })

    const dataBlob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `research-session-${session.id}.md`
    link.click()
    URL.revokeObjectURL(url)
  },
}

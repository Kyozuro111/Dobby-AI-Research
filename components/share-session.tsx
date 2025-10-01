"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Share2, Copy, Check } from "lucide-react"
import { SessionStorage, type ResearchSession } from "@/lib/session-storage"

interface ShareSessionProps {
  session: ResearchSession
}

export default function ShareSession({ session }: ShareSessionProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareableText = SessionStorage.generateShareableText(session)

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[var(--sentient-primary)]" />
            Share Session
          </DialogTitle>
          <DialogDescription>Copy this research session to share with others</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Session Content</span>
              <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2 bg-transparent">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <Textarea value={shareableText} readOnly className="min-h-[300px] font-mono text-xs" />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => SessionStorage.exportAsMarkdown(session)} variant="outline" className="flex-1">
              Export as Markdown
            </Button>
            <Button onClick={() => SessionStorage.exportSession(session)} variant="outline" className="flex-1">
              Export as JSON
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

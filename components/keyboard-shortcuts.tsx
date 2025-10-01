"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Keyboard } from "lucide-react"

interface KeyboardShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts = [
  { keys: ["Cmd", "K"], description: "Quick search sessions", mac: true },
  { keys: ["Ctrl", "K"], description: "Quick search sessions", mac: false },
  { keys: ["Cmd", "N"], description: "New session", mac: true },
  { keys: ["Ctrl", "N"], description: "New session", mac: false },
  { keys: ["Cmd", "E"], description: "Export current session", mac: true },
  { keys: ["Ctrl", "E"], description: "Export current session", mac: false },
  { keys: ["Esc"], description: "Close modals", mac: null },
  { keys: ["/"], description: "Focus input", mac: null },
  { keys: ["?"], description: "Show keyboard shortcuts", mac: null },
]

export default function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0

  const filteredShortcuts = shortcuts.filter((s) => s.mac === null || s.mac === isMac)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[var(--sentient-primary)]" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>Speed up your research with these shortcuts</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {filteredShortcuts.map((shortcut, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIdx) => (
                  <Badge key={keyIdx} variant="secondary" className="font-mono text-xs px-2 py-1">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

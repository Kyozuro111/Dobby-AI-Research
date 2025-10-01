"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Tag } from "lucide-react"
import { SessionStorage } from "@/lib/session-storage"

interface TagManagerProps {
  sessionId: string
  tags: string[]
  onTagsChange: () => void
}

const suggestedTags = ["crypto", "ai", "research", "code", "news", "tutorial", "comparison"]

export default function TagManager({ sessionId, tags, onTagsChange }: TagManagerProps) {
  const [newTag, setNewTag] = useState("")
  const [showInput, setShowInput] = useState(false)

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim().toLowerCase())) {
      SessionStorage.addTag(sessionId, tag.trim().toLowerCase())
      setNewTag("")
      setShowInput(false)
      onTagsChange()
    }
  }

  const handleRemoveTag = (tag: string) => {
    SessionStorage.removeTag(sessionId, tag)
    onTagsChange()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
          <Tag className="w-3 h-3" />
          {tag}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveTag(tag)}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            <X className="w-3 h-3" />
          </Button>
        </Badge>
      ))}

      {showInput ? (
        <div className="flex items-center gap-1">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTag(newTag)
              if (e.key === "Escape") {
                setShowInput(false)
                setNewTag("")
              }
            }}
            placeholder="Add tag..."
            className="h-7 w-24 text-xs"
            autoFocus
          />
          <Button size="sm" onClick={() => handleAddTag(newTag)} className="h-7 px-2">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowInput(true)} className="h-7 px-2 gap-1">
          <Plus className="w-3 h-3" />
          Tag
        </Button>
      )}

      {showInput && suggestedTags.filter((t) => !tags.includes(t)).length > 0 && (
        <div className="w-full flex flex-wrap gap-1 mt-1">
          <span className="text-xs text-muted-foreground">Suggestions:</span>
          {suggestedTags
            .filter((t) => !tags.includes(t))
            .map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-[var(--sentient-primary)]/10"
                onClick={() => handleAddTag(tag)}
              >
                {tag}
              </Badge>
            ))}
        </div>
      )}
    </div>
  )
}

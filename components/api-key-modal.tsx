"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, ExternalLink, Shield, Trash2, Eye, EyeOff } from "lucide-react"
import { ApiKeyStorage } from "@/lib/api-key-storage"

interface ApiKeyModalProps {
  open: boolean
  onSave: (key: string) => void
  onClose: () => void
}

export default function ApiKeyModal({ open, onSave, onClose }: ApiKeyModalProps) {
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [hasExistingKey, setHasExistingKey] = useState(false)

  useEffect(() => {
    const existingKey = ApiKeyStorage.get()
    setHasExistingKey(!!existingKey)
    if (existingKey) {
      setKey(existingKey)
    }
  }, [open])

  const handleSave = () => {
    const validation = ApiKeyStorage.validate(key)

    if (!validation.valid) {
      setError(validation.error || "Invalid API key")
      return
    }

    onSave(key.trim())
    setError("")
  }

  const handleRemove = () => {
    ApiKeyStorage.remove()
    setKey("")
    setHasExistingKey(false)
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Fireworks API Key
          </DialogTitle>
          <DialogDescription>
            {hasExistingKey
              ? "Update or remove your Fireworks AI API key."
              : "Enter your Fireworks AI API key to use Dobby model. Your key is stored locally and never sent to our servers."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Your API key is stored securely in your browser's local storage and is only used to make requests directly
              to Fireworks AI. We never see or store your key on our servers.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="fw_..."
                value={key}
                onChange={(e) => {
                  setKey(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Don't have an API key?</span>
              <a
                href="https://fireworks.ai/account/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Get one here
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">How to get your API key:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Sign up at fireworks.ai</li>
                <li>Navigate to Account → API Keys</li>
                <li>Create a new API key</li>
                <li>Copy and paste it here</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            {hasExistingKey ? "Update Key" : "Save Key"}
          </Button>
          {hasExistingKey && (
            <Button variant="destructive" size="icon" onClick={handleRemove} title="Remove API key">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

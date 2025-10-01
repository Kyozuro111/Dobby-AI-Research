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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { GitCompare, ArrowRight } from "lucide-react"
import type { SourceType } from "@/lib/multi-source-search"

interface CompareModeProps {
  onCompare: (itemA: string, itemB: string, sources: SourceType[]) => void
}

export default function CompareMode({ onCompare }: CompareModeProps) {
  const [open, setOpen] = useState(false)
  const [itemA, setItemA] = useState("")
  const [itemB, setItemB] = useState("")
  const [compareType, setCompareType] = useState<"crypto" | "github" | "general">("general")

  const handleCompare = () => {
    if (!itemA.trim() || !itemB.trim()) return

    const sources: SourceType[] =
      compareType === "crypto" ? ["crypto", "web"] : compareType === "github" ? ["github", "web"] : ["web"]

    const compareQuery = `Compare ${itemA} and ${itemB}. Provide a detailed comparison covering:
1. Key differences and similarities
2. Strengths and weaknesses of each
3. Use cases and target audience
4. Performance and metrics
5. Community and ecosystem
6. Which one to choose and when

Please structure your response in a clear, comparative format.`

    onCompare(compareQuery, "", sources)
    setOpen(false)
    setItemA("")
    setItemB("")
  }

  const compareExamples = {
    crypto: [
      { a: "Bitcoin", b: "Ethereum" },
      { a: "Solana", b: "Avalanche" },
      { a: "Uniswap", b: "PancakeSwap" },
    ],
    github: [
      { a: "React", b: "Vue" },
      { a: "Next.js", b: "Remix" },
      { a: "TailwindCSS", b: "Bootstrap" },
    ],
    general: [
      { a: "AI Agents", b: "Traditional Bots" },
      { a: "Centralized AI", b: "Decentralized AI" },
      { a: "Web2", b: "Web3" },
    ],
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <GitCompare className="w-4 h-4" />
          Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[var(--sentient-primary)]" />
            Compare Mode
          </DialogTitle>
          <DialogDescription>Compare two projects, technologies, or concepts side-by-side</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            {(["general", "crypto", "github"] as const).map((type) => (
              <Button
                key={type}
                variant={compareType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setCompareType(type)}
                className="flex-1"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="item-a">First Item</Label>
              <Input id="item-a" value={itemA} onChange={(e) => setItemA(e.target.value)} placeholder="e.g., Bitcoin" />
            </div>

            <div className="pb-2">
              <div className="w-8 h-8 rounded-full bg-[var(--sentient-primary)]/10 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-[var(--sentient-primary)]" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-b">Second Item</Label>
              <Input
                id="item-b"
                value={itemB}
                onChange={(e) => setItemB(e.target.value)}
                placeholder="e.g., Ethereum"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Quick examples:</p>
            <div className="grid gap-2">
              {compareExamples[compareType].map((example, idx) => (
                <Card
                  key={idx}
                  className="p-3 hover-lift cursor-pointer group relative overflow-hidden border-border/50 hover:border-[var(--sentient-primary)]/50 transition-all"
                  onClick={() => {
                    setItemA(example.a)
                    setItemB(example.b)
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--sentient-primary)]/0 to-[var(--sentient-secondary)]/0 group-hover:from-[var(--sentient-primary)]/5 group-hover:to-[var(--sentient-secondary)]/5 transition-all" />
                  <div className="flex items-center justify-center gap-2 text-sm relative z-10">
                    <span className="font-medium">{example.a}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">{example.b}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Button onClick={handleCompare} disabled={!itemA.trim() || !itemB.trim()} className="w-full">
            <GitCompare className="w-4 h-4 mr-2" />
            Compare Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

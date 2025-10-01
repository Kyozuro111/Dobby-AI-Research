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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Coins, Code, TrendingUp, Newspaper, GitCompare, GraduationCap, Sparkles, Plus } from "lucide-react"
import { defaultTemplates, TemplateStorage, type ResearchTemplate } from "@/lib/research-templates"
import type { SourceType } from "@/lib/multi-source-search"

interface TemplateSelectorProps {
  onSelectTemplate: (questions: string[], sources: SourceType[]) => void
}

const iconMap = {
  coins: Coins,
  code: Code,
  "trending-up": TrendingUp,
  newspaper: Newspaper,
  "git-compare": GitCompare,
  "graduation-cap": GraduationCap,
}

export default function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ResearchTemplate | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [customTemplates] = useState(TemplateStorage.getCustom())

  const handleTemplateClick = (template: ResearchTemplate) => {
    setSelectedTemplate(template)

    const vars: Record<string, string> = {}
    template.questions.forEach((q) => {
      const matches = q.match(/\[([^\]]+)\]/g)
      if (matches) {
        matches.forEach((match) => {
          const key = match.slice(1, -1)
          if (!vars[key]) vars[key] = ""
        })
      }
    })

    if (Object.keys(vars).length === 0) {
      onSelectTemplate(template.questions, template.sources as SourceType[])
      setOpen(false)
    } else {
      setVariables(vars)
    }
  }

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return

    const filled = TemplateStorage.fillTemplate(selectedTemplate, variables)
    onSelectTemplate(filled, selectedTemplate.sources as SourceType[])
    setOpen(false)
    setSelectedTemplate(null)
    setVariables({})
  }

  const renderTemplateCard = (template: ResearchTemplate) => {
    const Icon = iconMap[template.icon as keyof typeof iconMap] || FileText

    return (
      <Card
        key={template.id}
        className="p-4 hover-lift cursor-pointer group relative overflow-hidden border-border/50 hover:border-[var(--sentient-primary)]/50 transition-all"
        onClick={() => handleTemplateClick(template)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--sentient-primary)]/0 to-[var(--sentient-secondary)]/0 group-hover:from-[var(--sentient-primary)]/5 group-hover:to-[var(--sentient-secondary)]/5 transition-all" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[var(--sentient-primary)]/10 group-hover:bg-[var(--sentient-primary)]/20 transition-colors">
                <Icon className="w-4 h-4 text-[var(--sentient-primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{template.name}</h3>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {template.sources.map((source) => (
              <Badge key={source} variant="secondary" className="text-xs">
                {source}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{template.questions.length} questions</p>
        </div>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <FileText className="w-4 h-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--sentient-primary)]" />
            Research Templates
          </DialogTitle>
          <DialogDescription>
            Choose a template to start your research with pre-made questions and optimized sources.
          </DialogDescription>
        </DialogHeader>

        {selectedTemplate && Object.keys(variables).length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Fill in the details:</h3>
              {Object.keys(variables).map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{key}</Label>
                  <Input
                    id={key}
                    value={variables[key]}
                    onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                    placeholder={`Enter ${key.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyTemplate} className="flex-1">
                Apply Template
              </Button>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Back
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              <TabsContent value="all" className="space-y-3 mt-0">
                {defaultTemplates.map(renderTemplateCard)}
                {customTemplates.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-6 mb-3">
                      <Plus className="w-4 h-4" />
                      <h3 className="font-semibold text-sm">Custom Templates</h3>
                    </div>
                    {customTemplates.map(renderTemplateCard)}
                  </>
                )}
              </TabsContent>

              {["crypto", "code", "news", "general"].map((category) => (
                <TabsContent key={category} value={category} className="space-y-3 mt-0">
                  {defaultTemplates.filter((t) => t.category === category).map(renderTemplateCard)}
                  {customTemplates.filter((t) => t.category === category).map(renderTemplateCard)}
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

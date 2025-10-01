export interface ResearchTemplate {
  id: string
  name: string
  category: "crypto" | "code" | "news" | "general" | "custom"
  description: string
  questions: string[]
  sources: Array<"web" | "github" | "twitter" | "crypto">
  icon: string
}

export const defaultTemplates: ResearchTemplate[] = [
  {
    id: "crypto-analysis",
    name: "Crypto Project Analysis",
    category: "crypto",
    description: "Deep dive into a cryptocurrency project",
    questions: [
      "What is [PROJECT] and what problem does it solve?",
      "What is the tokenomics of [PROJECT]?",
      "Who are the team members and investors behind [PROJECT]?",
      "What are the latest developments and roadmap for [PROJECT]?",
      "What are the risks and criticisms of [PROJECT]?",
    ],
    sources: ["web", "twitter", "crypto"],
    icon: "coins",
  },
  {
    id: "github-repo-analysis",
    name: "GitHub Repository Analysis",
    category: "code",
    description: "Analyze a GitHub repository in detail",
    questions: [
      "What does [REPO] do and what are its main features?",
      "How active is the development of [REPO]?",
      "What are the main dependencies and tech stack of [REPO]?",
      "What are the open issues and recent pull requests in [REPO]?",
      "How can I contribute to [REPO]?",
    ],
    sources: ["web", "github"],
    icon: "code",
  },
  {
    id: "twitter-sentiment",
    name: "Twitter Sentiment Analysis",
    category: "news",
    description: "Analyze community sentiment on Twitter",
    questions: [
      "What is the general sentiment about [TOPIC] on Twitter?",
      "Who are the key influencers discussing [TOPIC]?",
      "What are the trending discussions about [TOPIC]?",
      "What are the main concerns or criticisms about [TOPIC]?",
    ],
    sources: ["twitter", "web"],
    icon: "trending-up",
  },
  {
    id: "news-research",
    name: "Latest News Research",
    category: "news",
    description: "Get the latest news and updates on a topic",
    questions: [
      "What are the latest news about [TOPIC]?",
      "What major announcements or updates happened recently for [TOPIC]?",
      "What are experts saying about [TOPIC]?",
      "What are the future predictions for [TOPIC]?",
    ],
    sources: ["web", "twitter"],
    icon: "newspaper",
  },
  {
    id: "comparison",
    name: "Project Comparison",
    category: "general",
    description: "Compare two projects or technologies",
    questions: [
      "What are the key differences between [PROJECT A] and [PROJECT B]?",
      "Which one has better performance: [PROJECT A] or [PROJECT B]?",
      "What are the pros and cons of [PROJECT A] vs [PROJECT B]?",
      "Which one should I choose: [PROJECT A] or [PROJECT B]?",
    ],
    sources: ["web", "github", "crypto"],
    icon: "git-compare",
  },
  {
    id: "learning",
    name: "Learning Path",
    category: "general",
    description: "Create a learning path for a new topic",
    questions: [
      "What are the fundamentals I need to learn about [TOPIC]?",
      "What are the best resources to learn [TOPIC]?",
      "What projects should I build to practice [TOPIC]?",
      "What are common mistakes beginners make with [TOPIC]?",
    ],
    sources: ["web", "github"],
    icon: "graduation-cap",
  },
]

export const TemplateStorage = {
  KEY: "research_templates",

  getAll(): ResearchTemplate[] {
    if (typeof window === "undefined") return defaultTemplates
    const stored = localStorage.getItem(this.KEY)
    if (!stored) return defaultTemplates

    try {
      const custom = JSON.parse(stored) as ResearchTemplate[]
      return [...defaultTemplates, ...custom]
    } catch {
      return defaultTemplates
    }
  },

  getCustom(): ResearchTemplate[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.KEY)
    if (!stored) return []

    try {
      return JSON.parse(stored) as ResearchTemplate[]
    } catch {
      return []
    }
  },

  save(template: ResearchTemplate): void {
    if (typeof window === "undefined") return
    const custom = this.getCustom()
    const updated = [...custom.filter((t) => t.id !== template.id), template]
    localStorage.setItem(this.KEY, JSON.stringify(updated))
  },

  delete(id: string): void {
    if (typeof window === "undefined") return
    const custom = this.getCustom()
    const updated = custom.filter((t) => t.id !== id)
    localStorage.setItem(this.KEY, JSON.stringify(updated))
  },

  fillTemplate(template: ResearchTemplate, variables: Record<string, string>): string[] {
    return template.questions.map((q) => {
      let filled = q
      Object.entries(variables).forEach(([key, value]) => {
        filled = filled.replace(`[${key}]`, value)
      })
      return filled
    })
  },
}

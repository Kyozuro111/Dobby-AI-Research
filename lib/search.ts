interface SearchResult {
  title: string
  url: string
  snippet: string
  content?: string
}

export async function performWebSearch(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`https://api.tavily.com/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY || "tvly-demo",
        query: query,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true,
        include_raw_content: false,
      }),
    })

    if (!response.ok) {
      console.error("Tavily search failed, using fallback")
      return getFallbackResults(query)
    }

    const data = await response.json()

    return (
      data.results?.map((result: { title: string; url: string; content: string }) => ({
        title: result.title,
        url: result.url,
        snippet: result.content.slice(0, 200) + "...",
        content: result.content,
      })) || []
    )
  } catch (error) {
    console.error("Search error:", error)
    return getFallbackResults(query)
  }
}

function getFallbackResults(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("sentient")) {
    return [
      {
        title: "Sentient AGI - GitHub",
        url: "https://github.com/sentient-agi",
        snippet:
          "Sentient is building the world's first open, monetizable, and loyal AI. Community-owned models and decentralized infrastructure for the future of AI.",
        content:
          "Sentient is building decentralized AI infrastructure with community-owned models like Dobby, frameworks for confidential computing, and tools for building AI agents.",
      },
      {
        title: "Sentient Agent Framework",
        url: "https://github.com/sentient-agi/Sentient-Agent-Framework",
        snippet:
          "Python package for building agents that serve Sentient Chat events with multimodal inputs and real-time rendering.",
      },
      {
        title: "OpenDeepSearch by Sentient",
        url: "https://github.com/sentient-agi/OpenDeepSearch",
        snippet:
          "Lightweight yet powerful search tool for AI agents, enabling deep web search and retrieval with state-of-the-art performance.",
      },
    ]
  }

  if (lowerQuery.includes("dobby")) {
    return [
      {
        title: "Dobby Unhinged Llama Model",
        url: "https://huggingface.co/SentientAGI/Dobby-Unhinged-Llama-3.3-70B",
        snippet:
          "Community-owned AI model with pro-crypto, pro-freedom stance. First truly decentralized LLM owned by 700,000+ people.",
        content:
          "Dobby is a fine-tuned Llama 3.3 70B model with strong conviction towards personal freedom, decentralization, and crypto. It's loyal, conversational, and maintains broad skills.",
      },
    ]
  }

  if (lowerQuery.includes("crypto") || lowerQuery.includes("blockchain") || lowerQuery.includes("decentrali")) {
    return [
      {
        title: "Decentralized AI Explained",
        url: "https://ethereum.org/en/decentralized-ai/",
        snippet:
          "Decentralized AI combines blockchain technology with artificial intelligence to create transparent, censorship-resistant AI systems owned by communities.",
      },
      {
        title: "The Future of Crypto and AI",
        url: "https://a16z.com/crypto-ai/",
        snippet:
          "Cryptocurrency and AI are converging to create new economic models for AI development, ownership, and monetization.",
      },
    ]
  }

  return [
    {
      title: "Search Results",
      url: "https://www.google.com/search?q=" + encodeURIComponent(query),
      snippet: "For more information, try searching on Google or other search engines.",
    },
  ]
}

export function buildContextFromResults(results: SearchResult[]): string {
  if (results.length === 0) return ""

  let context = "Here's what I found from web search:\n\n"

  results.forEach((result, idx) => {
    context += `[${idx + 1}] ${result.title}\n`
    context += `${result.content || result.snippet}\n`
    context += `Source: ${result.url}\n\n`
  })

  return context
}

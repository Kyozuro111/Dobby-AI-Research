export type SourceType = "web" | "github" | "twitter" | "crypto"

export interface MultiSourceResult {
  title: string
  url: string
  snippet: string
  content?: string
  source: SourceType
  metadata?: {
    stars?: number
    language?: string
    author?: string
    price?: number
    change24h?: number
    marketCap?: number
  }
}

// GitHub API Search
export async function searchGitHub(query: string): Promise<MultiSourceResult[]> {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=5`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Sentient-Research-Assistant",
        },
      },
    )

    if (!response.ok) {
      console.error("GitHub search failed")
      return []
    }

    const data = await response.json()

    return (
      data.items?.map((repo: any) => ({
        title: repo.full_name,
        url: repo.html_url,
        snippet: repo.description || "No description available",
        content: `${repo.description || ""}\n\nStars: ${repo.stargazers_count} | Language: ${repo.language || "N/A"} | Forks: ${repo.forks_count}`,
        source: "github" as SourceType,
        metadata: {
          stars: repo.stargazers_count,
          language: repo.language,
          author: repo.owner.login,
        },
      })) || []
    )
  } catch (error) {
    console.error("GitHub search error:", error)
    return []
  }
}

// Twitter/X Search (using public API or fallback)
export async function searchTwitter(query: string): Promise<MultiSourceResult[]> {
  // Note: Twitter API requires authentication. This is a simplified version.
  // In production, you'd need Twitter API credentials
  try {
    // Fallback to Twitter search URL since we don't have API access
    return [
      {
        title: `Twitter Search: ${query}`,
        url: `https://twitter.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`,
        snippet: `Search Twitter for recent discussions about "${query}". Click to view live results.`,
        content: `Twitter search results for "${query}". This will show you the latest tweets and discussions.`,
        source: "twitter" as SourceType,
      },
    ]
  } catch (error) {
    console.error("Twitter search error:", error)
    return []
  }
}

// Crypto Data Search (CoinGecko API - free tier)
export async function searchCrypto(query: string): Promise<MultiSourceResult[]> {
  try {
    // Search for coins
    const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`)

    if (!searchResponse.ok) {
      console.error("CoinGecko search failed")
      return []
    }

    const searchData = await searchResponse.json()
    const coins = searchData.coins?.slice(0, 3) || []

    if (coins.length === 0) return []

    // Get detailed data for top results
    const coinIds = coins.map((c: any) => c.id).join(",")
    const detailsResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false`,
    )

    if (!detailsResponse.ok) {
      return coins.map((coin: any) => ({
        title: `${coin.name} (${coin.symbol?.toUpperCase()})`,
        url: `https://www.coingecko.com/en/coins/${coin.id}`,
        snippet: `Cryptocurrency: ${coin.name}`,
        source: "crypto" as SourceType,
      }))
    }

    const detailsData = await detailsResponse.json()

    return detailsData.map((coin: any) => ({
      title: `${coin.name} (${coin.symbol?.toUpperCase()})`,
      url: `https://www.coingecko.com/en/coins/${coin.id}`,
      snippet: `Price: $${coin.current_price?.toLocaleString()} | 24h: ${coin.price_change_percentage_24h?.toFixed(2)}% | Market Cap: $${(coin.market_cap / 1e9).toFixed(2)}B`,
      content: `${coin.name} (${coin.symbol?.toUpperCase()})\n\nCurrent Price: $${coin.current_price?.toLocaleString()}\n24h Change: ${coin.price_change_percentage_24h?.toFixed(2)}%\nMarket Cap: $${(coin.market_cap / 1e9).toFixed(2)}B\nRank: #${coin.market_cap_rank}`,
      source: "crypto" as SourceType,
      metadata: {
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
      },
    }))
  } catch (error) {
    console.error("Crypto search error:", error)
    return []
  }
}

// Aggregate search across multiple sources
export async function multiSourceSearch(query: string, sources: SourceType[] = ["web"]): Promise<MultiSourceResult[]> {
  const results: MultiSourceResult[] = []

  const searchPromises = sources.map(async (source) => {
    switch (source) {
      case "github":
        return searchGitHub(query)
      case "twitter":
        return searchTwitter(query)
      case "crypto":
        return searchCrypto(query)
      case "web":
      default:
        // Import web search from existing search.ts
        const { performWebSearch } = await import("./search")
        const webResults = await performWebSearch(query)
        return webResults.map((r) => ({ ...r, source: "web" as SourceType }))
    }
  })

  const allResults = await Promise.all(searchPromises)
  allResults.forEach((sourceResults) => {
    results.push(...sourceResults)
  })

  return results
}

export function buildMultiSourceContext(results: MultiSourceResult[]): string {
  if (results.length === 0) return ""

  let context = "Here's what I found from multiple sources:\n\n"

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.source]) acc[result.source] = []
      acc[result.source].push(result)
      return acc
    },
    {} as Record<SourceType, MultiSourceResult[]>,
  )

  Object.entries(groupedResults).forEach(([source, sourceResults]) => {
    const sourceLabel = source.charAt(0).toUpperCase() + source.slice(1)
    context += `## ${sourceLabel} Results\n\n`

    sourceResults.forEach((result, idx) => {
      context += `[${idx + 1}] ${result.title}\n`
      context += `${result.content || result.snippet}\n`
      context += `Source: ${result.url}\n\n`
    })
  })

  return context
}

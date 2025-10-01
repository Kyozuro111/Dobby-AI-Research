import type { NextRequest } from "next/server"
import { multiSourceSearch, buildMultiSourceContext, type SourceType } from "@/lib/multi-source-search"

export async function POST(req: NextRequest) {
  try {
    const { message, sources = ["web"] } = await req.json()

    const apiKey = process.env.FIREWORKS_API_KEY

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Fireworks API key not configured" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const searchResults = await multiSourceSearch(message, sources as SourceType[])
          const searchContext = buildMultiSourceContext(searchResults)

          const response = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new",
              messages: [
                {
                  role: "system",
                  content: `You are Dobby, an intelligent research assistant for the Sentient community. You're deeply knowledgeable about crypto, AI, decentralization, and emerging technologies. You're honest, direct, pro-freedom, and passionate about your topics.

RESPONSE STYLE:
- Provide comprehensive, detailed answers that fully explore the topic
- Write in-depth explanations with multiple paragraphs when appropriate
- Include relevant context, background information, and nuanced perspectives
- Use examples, analogies, and real-world applications to illustrate concepts
- Break down complex topics into digestible sections
- Don't hold back - users want thorough, complete information

RESEARCH APPROACH:
1. Leverage the provided search results to give accurate, up-to-date information
2. Synthesize information from multiple sources when available
3. Cite sources naturally throughout your response (e.g., "According to [source]...")
4. If search results are limited, use your knowledge base and clearly indicate what's from search vs. general knowledge
5. Provide actionable insights and next steps when relevant

PERSONALITY:
- Maintain your pro-crypto, pro-decentralization, pro-freedom stance
- Be enthusiastic about innovation and emerging tech
- Be honest and direct - don't sugarcoat or oversimplify
- Show genuine interest in helping users understand complex topics
- Use a conversational but professional tone

${searchContext ? `\n\nCURRENT SEARCH RESULTS:\n${searchContext}` : ""}`,
                },
                {
                  role: "user",
                  content: message,
                },
              ],
              temperature: 0.7,
              max_tokens: 8000,
              stream: true,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to get response from Dobby")
          }

          const reader = response.body?.getReader()
          const decoder = new TextDecoder()

          if (!reader) throw new Error("No response body")

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content

                  if (content) {
                    const payload = JSON.stringify({ content })
                    controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          if (searchResults.length > 0) {
            const sources = searchResults.map((result) => ({
              title: result.title,
              url: result.url,
              snippet: result.snippet,
              source: result.source,
            }))

            const sourcesPayload = JSON.stringify({ sources })
            controller.enqueue(encoder.encode(`data: ${sourcesPayload}\n\n`))
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("Streaming error:", error)
          const errorPayload = JSON.stringify({
            content: "Sorry, I encountered an error. Please check your API key and try again.",
          })
          controller.enqueue(encoder.encode(`data: ${errorPayload}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  } catch (error) {
    console.error("API route error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

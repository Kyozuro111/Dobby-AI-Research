import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { conversation } = await req.json()

    if (!conversation) {
      return NextResponse.json({ error: "Conversation is required" }, { status: 400 })
    }

    const response = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/llama-v3p3-70b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a research assistant that creates concise, informative summaries. Summarize the key findings, main topics discussed, and important conclusions from research conversations. Keep it brief but comprehensive.",
          },
          {
            role: "user",
            content: `Please summarize this research conversation:\n\n${conversation}\n\nProvide a concise summary highlighting:\n1. Main topics discussed\n2. Key findings\n3. Important conclusions\n\nKeep it under 150 words.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate summary")
    }

    const data = await response.json()
    const summary = data.choices[0]?.message?.content || "Unable to generate summary"

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Summarize API error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}

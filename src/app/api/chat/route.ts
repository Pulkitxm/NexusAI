import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"
import { createGroq } from "@ai-sdk/groq"
import { deepseek } from "@ai-sdk/deepseek"
import { streamText } from "ai"

export const maxDuration = 30

const getModel = (modelId: string, keys: Record<string, string>) => {
  // OpenAI Models
  if (modelId.startsWith("gpt-") || modelId.startsWith("o")) {
    const model = openai("gpt-3.5-turbo-instruct")
    switch (modelId) {
      case "gpt-4.1":
      case "gpt-4.1-mini":
      case "gpt-4.5":
        return model
      case "gpt-4.1-nano":
        return model
      case "gpt-4o-mini":
      case "o4-mini":
      case "o3-mini":
        return model
      case "gpt-4o":
      case "o3":
      default:
        return model
    }
  }

  // Google Models
  if (modelId.startsWith("gemini-")) {
    const model = google("gemini-1.5-pro")
    return model
  }

  // Anthropic Models
  if (modelId.startsWith("claude-")) {
    const model = anthropic("claude-3-5-sonnet-20241022")
    return model
  }

  // DeepSeek Models
  if (modelId.startsWith("deepseek-")) {
    const model = deepseek("deepseek-chat")
    return model
  }

  // Groq/Meta Models
  if (modelId.startsWith("llama-") || modelId.startsWith("grok-")) {
    const model = createGroq("llama-3.1-70b-versatile")
    return model
  }

  // Qwen Models (via OpenRouter)
  if (modelId.startsWith("qwen-")) {
    const model = openai("qwen/qwen-2.5-72b-instruct")
    return model
  }

  // Default fallback
  return openai("gpt-3.5-turbo-instruct")
}

export async function POST(req: Request) {
  try {
    const { messages, model: modelId, chatId, keys } = await req.json()

    if (!keys || Object.keys(keys).length === 0) {
      return new Response(JSON.stringify({ error: "No API keys provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const model = getModel(modelId, keys)

    const systemMessage = {
      role: "system" as const,
      content:
        "You are a helpful AI assistant. Provide clear, accurate, and helpful responses. If you're unsure about something, say so rather than guessing. Format your responses nicely with proper spacing and structure when appropriate.",
    }

    const result = streamText({
      model,
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      maxTokens: 4000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API Error:", error)

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

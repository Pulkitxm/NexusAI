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
    const openaiClient = openai({ apiKey: keys.openai })
    switch (modelId) {
      case "gpt-4.1":
        return openaiClient("gpt-4-turbo")
      case "gpt-4.1-mini":
        return openaiClient("gpt-4-turbo")
      case "gpt-4.1-nano":
        return openaiClient("gpt-3.5-turbo")
      case "gpt-4o-mini":
        return openaiClient("gpt-4o-mini")
      case "gpt-4o":
        return openaiClient("gpt-4o")
      case "gpt-4.5":
        return openaiClient("gpt-4-turbo")
      case "o4-mini":
        return openaiClient("gpt-4o-mini")
      case "o3-mini":
        return openaiClient("gpt-4o-mini")
      case "o3":
        return openaiClient("gpt-4o")
      default:
        return openaiClient("gpt-4o")
    }
  }

  // Google Models
  if (modelId.startsWith("gemini-")) {
    const googleClient = google({ apiKey: keys.google })
    switch (modelId) {
      case "gemini-2.5-flash":
        return googleClient("gemini-1.5-flash")
      case "gemini-2.5-pro":
        return googleClient("gemini-1.5-pro")
      case "gemini-2.0-flash":
        return googleClient("gemini-1.5-flash")
      case "gemini-2.0-flash-lite":
        return googleClient("gemini-1.5-flash")
      case "gemini-2.5-flash-thinking":
        return googleClient("gemini-1.5-pro")
      default:
        return googleClient("gemini-1.5-pro")
    }
  }

  // Anthropic Models
  if (modelId.startsWith("claude-")) {
    const anthropicClient = anthropic({ apiKey: keys.anthropic })
    switch (modelId) {
      case "claude-4-sonnet":
        return anthropicClient("claude-3-5-sonnet-20241022")
      case "claude-3.5-sonnet":
        return anthropicClient("claude-3-5-sonnet-20241022")
      case "claude-3.7-sonnet":
        return anthropicClient("claude-3-5-sonnet-20241022")
      case "claude-3.7-sonnet-reasoning":
        return anthropicClient("claude-3-5-sonnet-20241022")
      case "claude-4-opus":
        return anthropicClient("claude-3-opus-20240229")
      default:
        return anthropicClient("claude-3-5-sonnet-20241022")
    }
  }

  // DeepSeek Models
  if (modelId.startsWith("deepseek-")) {
    const deepseekClient = deepseek({ apiKey: keys.deepseek })
    return deepseekClient("deepseek-chat")
  }

  // Groq/Meta Models
  if (modelId.startsWith("llama-") || modelId.startsWith("grok-")) {
    const groqClient = createGroq({ apiKey: keys.groq })
    switch (modelId) {
      case "llama-3.3-70b":
        return groqClient("llama-3.1-70b-versatile")
      case "llama-4-scout":
        return groqClient("llama-3.1-70b-versatile")
      case "llama-4-maverick":
        return groqClient("llama-3.1-70b-versatile")
      case "grok-3":
        return groqClient("llama-3.1-70b-versatile")
      case "grok-3-mini":
        return groqClient("llama-3.1-8b-instant")
      default:
        return groqClient("llama-3.1-70b-versatile")
    }
  }

  // Qwen Models (via OpenRouter)
  if (modelId.startsWith("qwen-")) {
    const openaiClient = openai({
      apiKey: keys.openrouter,
      baseURL: "https://openrouter.ai/api/v1",
    })
    return openaiClient("qwen/qwen-2.5-72b-instruct")
  }

  // Default fallback
  const openaiClient = openai({ apiKey: keys.openai })
  return openaiClient("gpt-4o")
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

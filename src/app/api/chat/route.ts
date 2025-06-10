import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { AI_MODELS } from "@/lib/models"

export async function POST(req: Request) {
  try {
    const { messages, model, provider, apiKey, webSearch } = await req.json()

    if (!messages?.length || !model || !apiKey) {
      return new Response("Missing required fields", { status: 400 })
    }

    // Find the model configuration
    const modelConfig = AI_MODELS.find((m) => m.id === model)
    if (!modelConfig) {
      return new Response(`Model ${model} not found`, { status: 400 })
    }

    // Use the provider from the model configuration or the provided one
    const modelProvider = modelConfig.provider || provider

    let aiModel

    // Create the appropriate client based on the provider
    switch (modelProvider) {
      case "OpenAI":
        const openai = createOpenAI({ apiKey })
        aiModel = openai(model)
        break

      case "Anthropic":
        const anthropic = createAnthropic({ apiKey })
        aiModel = anthropic(model)
        break

      case "Google":
        const google = createGoogleGenerativeAI({ apiKey })
        aiModel = google(model)
        break

      default:
        return new Response(`Provider ${modelProvider} not supported`, { status: 400 })
    }

    // Prepare messages with web search context if enabled
    let processedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Add web search context if enabled and this is a user message
    if (webSearch && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "user") {
        // Add a system message about web search capability
        processedMessages = [
          {
            role: "system",
            content:
              "You have access to current web information. When answering questions, you can reference recent events, current data, and up-to-date information from the web. Always cite your sources when using web information.",
          },
          ...processedMessages,
        ]
      }
    }

    // Stream the response
    const result = streamText({
      model: aiModel,
      messages: processedMessages,
      temperature: 0.7,
      maxTokens: 4000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

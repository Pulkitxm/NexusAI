import { streamText, convertToCoreMessages } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { AI_MODELS } from "@/lib/models"
import { saveAssistantMessage } from "@/actions/chat"
import { auth } from "@/lib/authOptions"

export const maxDuration = 30

class APIError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code?: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = "APIError"
  }
}

function formatErrorResponse(error: unknown) {
  if (error instanceof APIError) {
    return {
      error: {
        message: error.message,
        code: error.code || "API_ERROR",
        status: error.statusCode,
        details: error.details,
      },
    }
  }

  if (error instanceof Error) {
    return {
      error: {
        message: error.message,
        code: "UNKNOWN_ERROR",
        status: 500,
        details: error.stack,
      },
    }
  }

  return {
    error: {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      status: 500,
    },
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new APIError("User not authenticated", 401, "UNAUTHORIZED")
    }

    const { messages, model, provider, apiKey, webSearch, chatId } = await req.json()

    if (!messages?.length || !model || !apiKey) {
      throw new APIError(
        "Missing required fields. Please ensure you have provided messages, model, and API key.",
        400,
        "MISSING_FIELDS",
      )
    }

    const modelConfig = AI_MODELS.find((m) => m.id === model)
    if (!modelConfig) {
      throw new APIError(`Model "${model}" is not supported. Please select a valid model.`, 400, "MODEL_NOT_FOUND")
    }

    const modelProvider = modelConfig.provider || provider

    let aiModel
    try {
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
          throw new APIError(
            `Provider "${modelProvider}" is not supported. Please use OpenAI, Anthropic, or Google.`,
            400,
            "PROVIDER_NOT_SUPPORTED",
          )
      }
    } catch (error) {
      throw new APIError(
        `Failed to initialize AI provider: ${error instanceof Error ? error.message : "Unknown error"}`,
        500,
        "PROVIDER_INIT_ERROR",
        error,
      )
    }

    const coreMessages = convertToCoreMessages(messages)

    let processedMessages = coreMessages

    if (webSearch && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "user") {
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

    try {
      const result = streamText({
        model: aiModel,
        messages: processedMessages,
        temperature: 0.7,
        maxTokens: 4000,
        onFinish: async ({ text }) => {
          if (chatId && text && text.trim()) {
            try {
              const saveResult = await saveAssistantMessage(chatId, text.trim())
              if (saveResult.success) {
              } else {
                console.error("Failed to save assistant message:", saveResult.error)
              }
            } catch (error) {
              console.error("Error saving assistant message:", error)
            }
          } else {
          }
        },
      })

      return result.toDataStreamResponse()
    } catch (error) {
      throw new APIError(
        "Failed to generate response. Please check your inputs and try again.",
        500,
        "GENERATION_ERROR",
        error,
      )
    }
  } catch (error) {
    console.error("Chat API Error:", error)
    const errorResponse = formatErrorResponse(error)

    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.error.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })
  }
}

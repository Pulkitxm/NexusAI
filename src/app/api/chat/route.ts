import { streamText, convertToCoreMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AI_MODELS } from "@/lib/models";
import { saveAssistantMessage } from "@/actions/chat";
import { auth } from "@/lib/authOptions";
import { prisma } from "@/lib/db";

export const maxDuration = 30;

class APIError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "APIError";
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
    };
  }

  if (error instanceof Error) {
    return {
      error: {
        message: error.message,
        code: "UNKNOWN_ERROR",
        status: 500,
        details: error.stack,
      },
    };
  }

  return {
    error: {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      status: 500,
    },
  };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new APIError("User not authenticated", 401, "UNAUTHORIZED");
    }

    const { messages, model, provider, apiKey, webSearch, chatId, reasoning } = await req.json();

    if (!messages?.length || !model || !apiKey) {
      throw new APIError(
        "Missing required fields. Please ensure you have provided messages, model, and API key.",
        400,
        "MISSING_FIELDS"
      );
    }

    const [userSettings, globalMemories] = await Promise.all([
      prisma.userSettings.findUnique({
        where: { userId },
        select: {
          name: true,
          jobTitle: true,
          occupation: true,
          bio: true,
          location: true,
          company: true,
          website: true,
        },
      }),
      prisma.globalMemory.findMany({
        where: {
          userId,
          isDeleted: false,
        },
        select: {
          content: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

    const modelConfig = AI_MODELS.find((m) => m.id === model);
    if (!modelConfig) {
      throw new APIError(`Model "${model}" is not supported. Please select a valid model.`, 400, "MODEL_NOT_FOUND");
    }

    let finalModel = model;
    if (reasoning && !modelConfig.capabilities.reasoning) {
      const reasoningModel = AI_MODELS.find((m) => m.provider === modelConfig.provider && m.capabilities.reasoning);
      if (reasoningModel) {
        finalModel = reasoningModel.id;
      }
    }

    const modelProvider = modelConfig.provider || provider;

    let aiModel;
    try {
      switch (modelProvider) {
        case "OpenAI":
          const openai = createOpenAI({ apiKey });
          aiModel = openai(finalModel, {
            structuredOutputs: true,
            reasoningEffort:
              reasoning === "high"
                ? "high"
                : reasoning === "medium"
                  ? "medium"
                  : reasoning === "low"
                    ? "low"
                    : undefined,
          });
          break;

        case "Anthropic":
          const anthropic = createAnthropic({ apiKey });
          aiModel = anthropic(finalModel, {
            sendReasoning: reasoning ? true : false,
          });
          break;

        case "Google":
          const google = createGoogleGenerativeAI({ apiKey });
          aiModel = google(finalModel);
          break;

        default:
          throw new APIError(
            `Provider "${modelProvider}" is not supported. Please use OpenAI, Anthropic, or Google.`,
            400,
            "PROVIDER_NOT_SUPPORTED"
          );
      }
    } catch (error) {
      throw new APIError(
        `Failed to initialize AI provider: ${error instanceof Error ? error.message : "Unknown error"}`,
        500,
        "PROVIDER_INIT_ERROR",
        error
      );
    }

    const coreMessages = convertToCoreMessages(messages);

    let processedMessages = coreMessages;

    const isWebSearchInConfig = AI_MODELS.find((m) => m.id === finalModel)?.capabilities?.search;

    const systemMessage = convertToCoreMessages([
      {
        role: "system",
        content: `You are a helpful AI assistant. Here is some context about the user:

${
  userSettings
    ? `User Profile:
${userSettings.name ? `Name: ${userSettings.name}` : ""}
${userSettings.jobTitle ? `Job Title: ${userSettings.jobTitle}` : ""}
${userSettings.occupation ? `Occupation: ${userSettings.occupation}` : ""}
${userSettings.bio ? `Bio: ${userSettings.bio}` : ""}
${userSettings.location ? `Location: ${userSettings.location}` : ""}
${userSettings.company ? `Company: ${userSettings.company}` : ""}
${userSettings.website ? `Website: ${userSettings.website}` : ""}`
    : ""
}

${
  globalMemories.length > 0
    ? `Recent Memories:
${globalMemories.map((memory) => `- ${memory.content}`).join("\n")}`
    : ""
}

${webSearch && isWebSearchInConfig ? "You have access to current web information. When answering questions, you can reference recent events, current data, and up-to-date information from the web. Always cite your sources when using web information." : ""}`,
      },
    ])[0];

    processedMessages = [systemMessage, ...processedMessages];

    try {
      const result = streamText({
        model: aiModel,
        messages: processedMessages,
        temperature: 0.7,
        maxTokens: 4000,
        onFinish: async ({ text }) => {
          if (chatId && text && text.trim()) {
            try {
              const saveResult = await saveAssistantMessage(chatId, text.trim());
              if (saveResult.success) {
              } else {
                console.error("Failed to save assistant message:", saveResult.error);
              }
            } catch (error) {
              console.error("Error saving assistant message:", error);
            }
          }
        },
      });

      return result.toDataStreamResponse();
    } catch (error) {
      throw new APIError(
        "Failed to generate response. Please check your inputs and try again.",
        500,
        "GENERATION_ERROR",
        error
      );
    }
  } catch (error) {
    console.error("Chat API Error:", error);
    const errorResponse = formatErrorResponse(error);

    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.error.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  }
}

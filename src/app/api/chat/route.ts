import { cache } from "react";

import { saveAssistantMessage } from "@/actions/chat";
import { getAIProvider } from "@/ai/providers/factory";
import { auth } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { analyzeAndStoreMemories } from "@/lib/memoryAnalyzer";
import { AI_MODELS } from "@/lib/models";

import type { ChatInput } from "@/ai/types";

export const maxDuration = 30;

const getUserData = cache(async (userId: string) => {
  const [userSettings, globalMemories] = await Promise.all([
    prisma.userSettings.findUnique({
      where: { userId },
      select: {
        jobTitle: true,
        occupation: true,
        bio: true,
        location: true,
        company: true,
        website: true
      }
    }),
    prisma.globalMemory.findMany({
      where: { userId, isDeleted: false },
      select: { content: true, category: true, importance: true },
      orderBy: [{ importance: "desc" }, { createdAt: "desc" }],
      take: 8
    })
  ]);

  return { userSettings, globalMemories };
});

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
        details: error.details
      }
    };
  }

  if (error instanceof Error) {
    return {
      error: {
        message: error.message,
        code: "UNKNOWN_ERROR",
        status: 500,
        details: error.stack
      }
    };
  }

  return {
    error: {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      status: 500
    }
  };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new APIError("User not authenticated", 401, "UNAUTHORIZED");
    }

    const { messages, model, provider, apiKey, webSearch, chatId, reasoning, attachments } = await req.json();

    if (!messages?.length || !model || !apiKey) {
      throw new APIError("Missing required fields", 400, "MISSING_FIELDS");
    }

    const dbAttachments = await prisma.attachment.findMany({
      where: {
        id: {
          in: attachments || []
        }
      },
      select: {
        url: true,
        name: true
      }
    });

    const { userSettings, globalMemories } = await getUserData(userId);

    const modelConfig = AI_MODELS.find((m) => m.id === model);
    if (!modelConfig) {
      throw new APIError(`Model "${model}" is not supported`, 400, "MODEL_NOT_FOUND");
    }

    // Get AI provider using your factory
    const aiProvider = getAIProvider({
      provider: modelConfig.provider || provider,
      apiKey,
      openRouter: false
    });

    if (!aiProvider) {
      throw new APIError(
        `Provider "${modelConfig.provider || provider}" is not supported`,
        400,
        "PROVIDER_NOT_SUPPORTED"
      );
    }

    // Build system message
    const systemMessageContent = [
      "You are a helpful AI assistant with access to the user's profile and memories.",
      `User Name: ${session?.user?.name}`,
      userSettings
        ? `User Profile:\n${Object.entries(userSettings)
            .filter(([, value]) => value)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n")}`
        : "",
      globalMemories.length > 0
        ? `User Memories (organized by importance):\n${globalMemories
            .map(
              (memory) =>
                `[${memory.category?.toUpperCase() || "GENERAL"}] ${memory.content} (Importance: ${memory.importance}/10)`
            )
            .join("\n")}`
        : "",
      webSearch && modelConfig.capabilities?.search
        ? "You have access to current web information. Cite sources when using web data."
        : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    // Prepare messages for your provider
    const processedMessages = [{ role: "system" as const, content: systemMessageContent }, ...messages];

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const chatInput: ChatInput = {
      messages: processedMessages,
      stream: true,
      temperature: 0.7,
      maxTokens: 4000,
      model
    };

    try {
      let fullResponse = "";
      const result = await aiProvider.chat(chatInput, {
        onText: (text: string) => {
          fullResponse += text;
        },
        onStop: async () => {
          if (chatId && fullResponse.trim()) {
            try {
              await Promise.all([
                saveAssistantMessage(chatId, fullResponse.trim()),
                (async () => {
                  try {
                    await analyzeAndStoreMemories(userId, lastUserMessage, fullResponse.trim(), apiKey, model);
                  } catch (error) {
                    console.error("[Chat API] Error in global memory analysis:", error);
                  }
                })()
              ]);
            } catch (error) {
              console.error("Error in onStop:", error);
            }
          }
        }
      });

      // Return the stream response
      if (result instanceof ReadableStream) {
        return new Response(result, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
          }
        });
      }

      // Handle non-streaming response
      if (typeof result === "object" && "content" in result) {
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" }
        });
      }

      return result as Response;
    } catch (error) {
      console.error("Chat API Error:", error);
      throw new APIError("Failed to generate response", 500, "GENERATION_ERROR");
    }
  } catch (error) {
    console.error("Chat API Error:", error);
    const errorResponse = formatErrorResponse(error);

    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.error.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });
  }
}

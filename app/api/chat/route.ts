import { streamText, convertToCoreMessages } from "ai";
import { cache } from "react";

import { saveAssistantMessage } from "@/actions/chat";
import { AI_MODELS } from "@/data/models";
import { getAiProvider } from "@/lib/ai-helper/get-provider";
import { analyzeAndStoreMemories } from "@/lib/ai-helper/memory-analyzer";
import { ReasoningHandler } from "@/lib/ai-helper/resoning-handler";
import { auth } from "@/lib/authOptions";
import { debugLog } from "@/lib/utils";
import { prisma } from "@/prisma";
import { validateChatStreamBody } from "@/types/chat";

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

function createSSEResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new APIError("User not authenticated", 401, "UNAUTHORIZED");
    }

    const body = await req.json();
    const validateBody = validateChatStreamBody.safeParse(body);

    debugLog("validateBody", validateBody);

    if (!validateBody.success) {
      return new Response(JSON.stringify({ error: validateBody.error.issues }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    const { messages, model, provider, apiKey, webSearch, chatId, reasoning, openRouter } = validateBody.data;

    if (!messages || !model || !apiKey) {
      throw new APIError("Missing required fields", 400, "MISSING_FIELDS");
    }

    const { userSettings, globalMemories } = await getUserData(userId);

    const modelConfig = AI_MODELS.find((m) => m.uuid === model);
    if (!modelConfig) {
      throw new APIError(`Model "${model}" is not supported`, 400, "MODEL_NOT_FOUND");
    }

    const finalModel = ReasoningHandler.shouldUseReasoningModel(reasoning, modelConfig, AI_MODELS);
    const reasoningConfig = ReasoningHandler.getReasoningConfig(reasoning, modelConfig);
    const modelProvider = modelConfig.provider || provider;

    const aiModelResult = getAiProvider({
      apiKey,
      finalModelId: finalModel,
      modelProvider,
      openRouter,
      reasoningConfig
    });

    debugLog("aiModelResult", aiModelResult);

    if (!aiModelResult.success) {
      return new Response(JSON.stringify({ error: aiModelResult.error }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    const aiModel = aiModelResult.aiModel;
    const coreMessages = convertToCoreMessages(messages);
    const lastUserMessage = messages[messages.length - 1]?.content || "";

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

    const systemMessage = convertToCoreMessages([{ role: "system", content: systemMessageContent }])[0];
    const processedMessages = [systemMessage, ...coreMessages];

    debugLog("processedMessages", processedMessages);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          debugLog("streamText", {
            model: aiModel,
            messages: processedMessages,
            temperature: 0.7,
            maxTokens: 4000
          });
          const result = streamText({
            model: aiModel,
            messages: processedMessages,
            temperature: 0.7,
            maxTokens: 4000
          });

          let fullResponse = "";

          for await (const chunk of result.textStream) {
            fullResponse += chunk;

            debugLog("chunk", chunk);

            const data = JSON.stringify({
              type: "text",
              content: chunk
            });

            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }

          const completionData = JSON.stringify({
            type: "done",
            content: fullResponse
          });

          debugLog("completionData", completionData);

          controller.enqueue(new TextEncoder().encode(`data: ${completionData}\n\n`));

          if (chatId && fullResponse?.trim()) {
            try {
              debugLog("saving assistant message", fullResponse.trim());
              await saveAssistantMessage({
                chatId,
                content: fullResponse.trim(),
                modelUsed: model
              });

              try {
                debugLog("analyzing and storing memories", fullResponse.trim());
                await analyzeAndStoreMemories({
                  apiKey,
                  assistantResponse: fullResponse.trim(),
                  modelUUID: model,
                  userId,
                  userMessage: lastUserMessage,
                  openRouter
                });
              } catch (error) {
                console.error("[Chat API] Error in global memory analysis:", error);
              }
            } catch (error) {
              console.error("Error in onFinish:", error);
            }
          }
        } catch (error) {
          console.error("[Chat API] Error in streamText:", error);

          const errorData = JSON.stringify({
            type: "error",
            message: "Failed to generate response"
          });

          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return createSSEResponse(stream);
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

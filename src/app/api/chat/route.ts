import { cache } from "react";

import { saveAssistantMessage } from "@/actions/chat";
import { getAIProvider } from "@/ai/factory";
import { auth } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { analyzeAndStoreMemories } from "@/lib/memoryAnalyzer";
import { AI_MODELS } from "@/lib/models";
import {
  type ChatInput,
  type ChatMessage,
  type ChatRequestBody,
  type ProcessedAttachment,
  type UserData,
  type APIErrorResponse,
  chatBodyValidator
} from "@/types/models";

import type { NextRequest } from "next/server";

export const maxDuration = 30;

const getUserData = cache(async (userId: string): Promise<UserData> => {
  try {
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
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { userSettings: null, globalMemories: [] };
  }
});

const processAttachments = async (attachmentIds: string[]): Promise<ProcessedAttachment[]> => {
  if (!attachmentIds?.length) return [];

  try {
    const dbAttachments = await prisma.attachment.findMany({
      where: {
        id: { in: attachmentIds },
        isDeleted: false
      },
      select: {
        id: true,
        url: true,
        name: true,
        size: true,
        uploadThingKey: true
      }
    });

    const processedAttachments: ProcessedAttachment[] = [];

    for (const attachment of dbAttachments) {
      const processed: ProcessedAttachment = {
        id: attachment.id,
        name: attachment.name,
        url: attachment.url,
        type: attachment.name.split(".").pop()?.toLowerCase() || "",
        size: attachment.size
      };

      if (isTextFile(processed.type)) {
        try {
          const response = await fetch(attachment.url);
          if (response.ok) {
            processed.content = await response.text();
          }
        } catch (error) {
          console.error(`Error fetching text content for ${attachment.name}:`, error);
        }
      }

      processedAttachments.push(processed);
    }

    return processedAttachments;
  } catch (error) {
    console.error("Error processing attachments:", error);
    return [];
  }
};

const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith("image/");
};

const isTextFile = (mimeType: string): boolean => {
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/javascript" ||
    mimeType === "application/typescript" ||
    mimeType === "application/xml" ||
    mimeType === "application/sql" ||
    mimeType === "text/csv" ||
    mimeType === "text/markdown"
  );
};

const isPDFFile = (mimeType: string): boolean => {
  return mimeType === "application/pdf";
};

const isDocumentFile = (mimeType: string): boolean => {
  return (
    mimeType.includes("document") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation") ||
    mimeType === "application/msword" ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.ms-powerpoint"
  );
};

const buildMessagesWithAttachments = (
  messages: { role: string; content: string }[],
  attachments: ProcessedAttachment[],
  systemMessage: string
): ChatMessage[] => {
  const processedMessages: ChatMessage[] = [{ role: "system", content: systemMessage }];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const isLastUserMessage = i === messages.length - 1 && message.role === "user";

    if (isLastUserMessage && attachments.length > 0) {
      const contentParts: {
        type: "text" | "image" | "file";
        text?: string;
        image_url?: { url: string };
        file_url?: string;
        mime_type?: string;
      }[] = [{ type: "text", text: message.content }];

      for (const attachment of attachments) {
        if (isImageFile(attachment.type)) {
          contentParts.push({
            type: "image",
            image_url: { url: attachment.url }
          });
        } else if (isTextFile(attachment.type) && attachment.content) {
          contentParts.push({
            type: "text",
            text: `\n\n--- Content of ${attachment.name} ---\n${attachment.content}\n--- End of ${attachment.name} ---`
          });
        } else if (isPDFFile(attachment.type) || isDocumentFile(attachment.type)) {
          contentParts.push({
            type: "file",
            file_url: attachment.url,
            mime_type: attachment.type
          });
        } else {
          contentParts.push({
            type: "text",
            text: `\n\n[Attached file: ${attachment.name} (${attachment.type.toUpperCase()}, ${Math.round(attachment.size / 1024)}KB)]`
          });
        }
      }

      processedMessages.push({
        role: message.role as "user" | "assistant",
        content: contentParts
      });
    } else {
      processedMessages.push({
        role: message.role as "system" | "user" | "assistant",
        content: message.content
      });
    }
  }

  return processedMessages;
};

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

function formatErrorResponse(error: unknown): APIErrorResponse {
  if (error instanceof APIError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || "API_ERROR",
        status: error.statusCode,
        details: process.env.NODE_ENV === "development" ? error.details : undefined
      }
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        message: error.message,
        code: "UNKNOWN_ERROR",
        status: 500,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      }
    };
  }

  return {
    success: false,
    error: {
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      status: 500
    }
  };
}

function validateRequestBody(body: unknown): ChatRequestBody {
  const result = chatBodyValidator.safeParse(body);

  if (!result.success) {
    throw new APIError("Invalid request body", 400, "INVALID_REQUEST_BODY", result.error);
  }

  return result.data;
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new APIError("User not authenticated", 401, "UNAUTHORIZED");
    }

    let requestBody: ChatRequestBody;
    try {
      const body = await req.json();
      requestBody = validateRequestBody(body);
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError("Invalid JSON in request body", 400, "INVALID_JSON");
    }

    const {
      messages,
      model: modelUUId,
      provider,
      apiKey,
      chatId,
      reasoning,
      attachments,
      temperature,
      maxTokens,
      openRouter
    } = requestBody;

    const model = AI_MODELS.find((m) => m.uuid === modelUUId)?.id;

    if (!model) {
      throw new APIError(`Model "${modelUUId}" is not supported`, 400, "MODEL_NOT_FOUND");
    }

    const processedAttachments = await processAttachments(attachments);
    const { userSettings, globalMemories } = await getUserData(userId);

    const modelConfig = AI_MODELS.find((m) => m.id === model);
    if (!modelConfig) {
      throw new APIError(`Model "${model}" is not supported`, 400, "MODEL_NOT_FOUND");
    }

    const aiProvider = getAIProvider({
      provider: modelConfig.provider || provider,
      apiKey,
      openRouter
    });

    if (!aiProvider) {
      throw new APIError(
        `Provider "${modelConfig.provider || provider}" is not supported`,
        400,
        "PROVIDER_NOT_SUPPORTED"
      );
    }

    const systemMessageParts: string[] = [
      "You are a helpful AI assistant with access to the user's profile and memories.",
      `User Name: ${session?.user?.name || "User"}`
    ];

    if (userSettings) {
      const profileEntries = Object.entries(userSettings)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}: ${value}`);

      if (profileEntries.length > 0) {
        systemMessageParts.push(`User Profile:\n${profileEntries.join("\n")}`);
      }
    }

    if (globalMemories.length > 0) {
      const memoriesText = globalMemories
        .map(
          (memory) =>
            `[${memory.category?.toUpperCase() || "GENERAL"}] ${memory.content} (Importance: ${memory.importance}/10)`
        )
        .join("\n");
      systemMessageParts.push(`User Memories (organized by importance):\n${memoriesText}`);
    }

    if (processedAttachments.length > 0) {
      const attachmentInfo = processedAttachments
        .map((att) => {
          const sizeKB = Math.round(att.size / 1024);
          if (isImageFile(att.type)) {
            return `- 🖼️ ${att.name} (Image, ${sizeKB}KB) - I can see and analyze this image`;
          } else if (isTextFile(att.type)) {
            return `- 📄 ${att.name} (Text file, ${sizeKB}KB) - Content has been loaded and I can reference it`;
          } else if (isPDFFile(att.type)) {
            return `- 📋 ${att.name} (PDF, ${sizeKB}KB) - I can read and analyze this document`;
          } else if (isDocumentFile(att.type)) {
            return `- 📊 ${att.name} (Document, ${sizeKB}KB) - I can process this document`;
          } else {
            return `- 📎 ${att.name} (${att.type.toUpperCase()}, ${sizeKB}KB) - File attached for reference`;
          }
        })
        .join("\n");

      systemMessageParts.push(
        `Available Attachments:\n${attachmentInfo}\n\nI can analyze images, read text files, process PDFs and documents. Please ask me about any of these attachments.`
      );
    }

    if (reasoning) {
      systemMessageParts.push(
        "Please think step by step and show your reasoning process when solving complex problems."
      );
    }

    const systemMessageContent = systemMessageParts.filter(Boolean).join("\n\n");
    const processedMessages = buildMessagesWithAttachments(messages, processedAttachments, systemMessageContent);
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const chatInput: ChatInput = {
      messages: processedMessages,
      stream: true,
      temperature,
      maxTokens,
      model,
      attachments: processedAttachments
    };

    let fullResponse = "";
    let hasError = false;

    try {
      const result = await aiProvider.chat(chatInput, {
        onText: (text: string) => {
          fullResponse += text;
        },
        onError: (error: Error) => {
          console.error("[Chat API] Stream error:", error);
          hasError = true;
        },
        onStop: async () => {
          if (chatId && fullResponse.trim() && !hasError) {
            try {
              await Promise.all([
                saveAssistantMessage(chatId, fullResponse.trim()),
                (async () => {
                  try {
                    await analyzeAndStoreMemories(
                      userId,
                      lastUserMessage,
                      fullResponse.trim(),
                      apiKey,
                      model,
                      openRouter
                    );
                  } catch (error) {
                    console.error("[Chat API] Memory analysis error:", error);
                  }
                })()
              ]);
            } catch (error) {
              console.error("[Chat API] onStop error:", error);
            }
          }
        }
      });

      if (result instanceof ReadableStream) {
        return new Response(result, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      }

      if (typeof result === "object" && result !== null && "content" in result) {
        return Response.json({
          success: true,
          data: result
        });
      }

      return result as Response;
    } catch (chatError) {
      console.error("[Chat API] Generation error:", chatError);
      throw new APIError(
        "Failed to generate response from AI provider",
        500,
        "GENERATION_ERROR",
        chatError instanceof Error ? chatError.message : String(chatError)
      );
    }
  } catch (error) {
    console.error("[Chat API] Request error:", error);
    const errorResponse = formatErrorResponse(error);

    return Response.json(errorResponse, {
      status: errorResponse.error.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });
  }
}

export async function GET(): Promise<Response> {
  return Response.json({
    success: true,
    message: "Chat API is running",
    timestamp: new Date().toISOString()
  });
}

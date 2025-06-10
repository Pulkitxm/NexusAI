import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AI_MODELS } from "@/lib/models";

// Custom error class for API errors
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Error response formatter
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
    const { messages, model, provider, apiKey, webSearch } = await req.json();

    if (!messages?.length || !model || !apiKey) {
      throw new APIError(
        "Missing required fields. Please ensure you have provided messages, model, and API key.",
        400,
        "MISSING_FIELDS"
      );
    }

    const modelConfig = AI_MODELS.find((m) => m.id === model);
    if (!modelConfig) {
      throw new APIError(
        `Model "${model}" is not supported. Please select a valid model.`,
        400,
        "MODEL_NOT_FOUND"
      );
    }

    const modelProvider = modelConfig.provider || provider;

    let aiModel;
    try {
      switch (modelProvider) {
        case "OpenAI":
          const openai = createOpenAI({ apiKey });
          aiModel = openai(model);
          break;

        case "Anthropic":
          const anthropic = createAnthropic({ apiKey });
          aiModel = anthropic(model);
          break;

        case "Google":
          const google = createGoogleGenerativeAI({ apiKey });
          aiModel = google(model);
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
        `Failed to initialize AI provider: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        "PROVIDER_INIT_ERROR",
        error
      );
    }

    let processedMessages = messages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      }),
    );

    if (webSearch && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        processedMessages = [
          {
            role: "system",
            content:
              "You have access to current web information. When answering questions, you can reference recent events, current data, and up-to-date information from the web. Always cite your sources when using web information.",
          },
          ...processedMessages,
        ];
      }
    }

    try {
      const result = streamText({
        model: aiModel,
        messages: processedMessages,
        temperature: 0.7,
        maxTokens: 4000,
      });

      const stream = result.toDataStreamResponse();
      
      // Create a new TransformStream to handle errors in the stream
      const transform = new TransformStream({
        async transform(chunk, controller) {
          try {
            const text = new TextDecoder().decode(chunk);
            
            // Check for error messages in the stream
            if (text.startsWith('3:')) {
              const errorMsg = text.slice(2).trim();
              const errorResponse = formatErrorResponse(
                new APIError(
                  errorMsg || "The AI model encountered an error while generating the response.",
                  500,
                  "AI_RESPONSE_ERROR"
                )
              );
              controller.enqueue(new TextEncoder().encode(`error:${JSON.stringify(errorResponse)}\n`));
              controller.terminate();
              return;
            }

            // For normal messages, pass them through
            controller.enqueue(chunk);
          } catch (error) {
            console.error("Transform error:", error);
            const errorResponse = formatErrorResponse(
              new APIError(
                "Failed to process the AI response stream. Please try again.",
                500,
                "STREAM_TRANSFORM_ERROR",
                error
              )
            );
            controller.enqueue(new TextEncoder().encode(`error:${JSON.stringify(errorResponse)}\n`));
            controller.terminate();
          }
        },
        flush(controller) {
          try {
            controller.terminate();
          } catch (error) {
            console.error("Error terminating stream:", error);
          }
        }
      });

      // Create a new ReadableStream that includes our error handling
      const transformedStream = stream.body?.pipeThrough(transform);
      
      if (!transformedStream) {
        throw new APIError(
          "Failed to create response stream. Please try again.",
          500,
          "STREAM_ERROR"
        );
      }

      return new Response(transformedStream, {
        headers: {
          ...stream.headers,
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
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
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: errorResponse.error.status,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

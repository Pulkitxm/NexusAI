import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

import { BaseAIProvider } from "./base";
import { OpenAIProvider } from "./openai";

import type { ChatInput, ChatResponse, StreamOptions, ChatMessage } from "../../types/models";

export class GoogleProvider extends BaseAIProvider {
  protected apiKey: string;
  private client: GoogleGenerativeAI | OpenAIProvider;
  private isOpenRouter: boolean;

  constructor({ apiKey, isOpenRouter = false }: { apiKey: string; isOpenRouter?: boolean }) {
    super();
    this.apiKey = apiKey;
    this.isOpenRouter = isOpenRouter;
    this.client = this.isOpenRouter
      ? new OpenAIProvider({ apiKey: this.apiKey, isOpenRouter: true })
      : new GoogleGenerativeAI(apiKey);
  }

  async chat(input: ChatInput, options?: StreamOptions): Promise<ChatResponse | ReadableStream | Response> {
    if (this.isOpenRouter && this.client instanceof OpenAIProvider) {
      return this.client.chat(input, options);
    }

    if (!(this.client instanceof GoogleGenerativeAI)) {
      throw new Error("Invalid client configuration for Google AI");
    }

    const { messages, stream, temperature = 0.7, maxTokens, model = "gemini-1.5-pro" } = input;

    try {
      const genModel = this.client.getGenerativeModel({
        model,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      });

      const googleContent = await this.convertMessagesToGoogleFormat(messages);

      if (stream) {
        const result = await genModel.generateContentStream(googleContent);
        return this.createStreamFromGoogle(result.stream, options);
      }

      const result = await genModel.generateContent(googleContent);
      const response = result.response;

      return {
        id: `google-${Date.now()}`,
        content: response.text() || "",
        role: "assistant",
        success: true,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error) {
      throw new Error(`Google API error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async convertMessagesToGoogleFormat(messages: ChatMessage[]): Promise<Part[]> {
    const parts: Part[] = [];
    let conversationText = "";

    for (const message of messages) {
      if (message.role === "system") {
        if (typeof message.content === "string") {
          conversationText += `System: ${message.content}\n\n`;
        }
      } else {
        if (typeof message.content === "string") {
          conversationText += `${message.content}\n\n`;
        } else if (Array.isArray(message.content)) {
          let messageText = "";

          for (const contentPart of message.content) {
            if (contentPart.type === "text" && contentPart.text) {
              messageText += contentPart.text;
            } else if (contentPart.type === "image" && contentPart.image_url?.url) {
              if (messageText.trim() !== "") {
                conversationText += messageText + "\n\n";
                messageText = "";
              }

              try {
                const response = await fetch(contentPart.image_url.url);
                if (!response.ok) {
                  throw new Error(`Failed to fetch image: ${response.statusText}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString("base64");
                const mimeType = response.headers.get("content-type") || "image/jpeg";

                if (conversationText.trim()) {
                  parts.push({ text: conversationText.trim() });
                  conversationText = "";
                }

                parts.push({
                  inlineData: {
                    mimeType,
                    data: base64
                  }
                });
              } catch (error) {
                console.error("Error processing image for Google:", error);
                messageText += `\n[Image could not be processed: ${contentPart.image_url.url}]`;
              }
            }
          }

          if (messageText.trim() !== "") {
            conversationText += messageText + "\n\n";
          }
        }
      }
    }

    if (conversationText.trim()) {
      parts.push({ text: conversationText.trim() });
    }

    if (parts.length === 0) {
      parts.push({ text: "Hello" });
    }

    return parts;
  }

  private createStreamFromGoogle(stream: AsyncIterable<unknown>, options?: StreamOptions): ReadableStream {
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const response = chunk as { text: () => string };
            const content = response.text();

            if (content) {
              const data = {
                type: "text",
                data: content
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              options?.onText?.(content);
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "stop" })}\n\n`));
          options?.onStop?.();
        } catch (error) {
          controller.error(error);
          options?.onError?.(error instanceof Error ? error : new Error("Unknown streaming error"));
        } finally {
          controller.close();
        }
      }
    });
  }
}

import { Anthropic } from "@anthropic-ai/sdk";

import { BaseAIProvider } from "./base";
import { OpenAIProvider } from "./openai";

import type { ChatInput, ChatResponse, StreamOptions } from "../types/models";

export class AnthropicProvider extends BaseAIProvider {
  protected apiKey: string;
  private client: Anthropic | OpenAIProvider;
  private isOpenRouter: boolean;

  constructor({ apiKey, isOpenRouter = false }: { apiKey: string; isOpenRouter?: boolean }) {
    super();
    this.apiKey = apiKey;
    this.isOpenRouter = isOpenRouter;
    this.client = this.isOpenRouter
      ? new OpenAIProvider({ apiKey: this.apiKey, isOpenRouter: true })
      : new Anthropic({ apiKey });
  }

  async chat(input: ChatInput, options?: StreamOptions): Promise<ChatResponse | ReadableStream | Response> {
    const { messages, stream, temperature = 0.7, maxTokens, model } = input;

    if (this.isOpenRouter && this.client instanceof OpenAIProvider) {
      return this.client.chat(input, options);
    }

    if (!(this.client instanceof AnthropicProvider)) {
      throw new Error("Invalid client configuration for Google AI");
    }

    try {
      const anthropicMessages = messages.map((msg) => ({
        role: msg.role === "system" ? "user" : msg.role,
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
      }));

      if (stream) {
        const stream = await this.client.messages.create({
          model,
          messages: anthropicMessages,
          temperature,
          max_tokens: maxTokens || 4096,
          stream: true
        });

        return this.createStreamFromAnthropic(stream, options);
      }

      const response = await this.client.messages.create({
        model,
        messages: anthropicMessages,
        temperature,
        max_tokens: maxTokens || 4096
      });

      return {
        id: response.id,
        content: response.content[0].type === "text" ? response.content[0].text : "",
        role: "assistant",
        success: true,
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
        }
      };
    } catch (error) {
      throw new Error(`Anthropic API error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private createStreamFromAnthropic(stream: AsyncIterable<unknown>, options?: StreamOptions): ReadableStream {
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const event = chunk as { type: string; delta: { text?: string } };
            if (event.type === "content_block_delta" && event.delta.text) {
              const data = {
                type: "text",
                data: event.delta.text
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              options?.onText?.(event.delta.text);
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "stop" })}\n\n`));
          options?.onStop?.();
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });
  }
}

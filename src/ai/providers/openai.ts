import OpenAI from "openai";

import { OPENROUTER_BASE_URL } from "@/lib/data";

import { BaseAIProvider } from "./base";

import type { ChatInput, ChatResponse, StreamOptions } from "../types";

export class OpenAIProvider extends BaseAIProvider {
  protected apiKey: string;
  protected baseUrl?: string;
  private client: OpenAI;

  constructor({ apiKey, isOpenRouter = false }: { apiKey: string; isOpenRouter?: boolean }) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = isOpenRouter ? OPENROUTER_BASE_URL : undefined;
    this.client = new OpenAI({ apiKey, baseURL: this.baseUrl });
  }

  async chat(input: ChatInput, options?: StreamOptions): Promise<ChatResponse | ReadableStream | Response> {
    const { messages, stream, temperature = 0.7, maxTokens, model = "gpt-4-vision-preview" } = input;

    try {
      if (stream) {
        const stream = await this.client.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true
        });

        return this.createStreamFromOpenAI(stream, options);
      }

      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      });

      return {
        id: response.id,
        content: response.choices[0].message.content || "",
        role: "assistant",
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private createStreamFromOpenAI(stream: AsyncIterable<unknown>, options?: StreamOptions): ReadableStream {
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const event = chunk as { choices: { delta: { content?: string } }[] };
            const content = event.choices[0]?.delta?.content;
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
        } finally {
          controller.close();
        }
      }
    });
  }
}

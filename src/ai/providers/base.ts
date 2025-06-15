import type { ChatInput, ChatResponse, StreamOptions } from "../../types/models";

export abstract class BaseAIProvider {
  protected abstract apiKey: string;

  abstract chat(input: ChatInput, options?: StreamOptions): Promise<ChatResponse | ReadableStream | Response>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async handleError(error: any): Promise<never> {
    if (error.response) {
      const data = await error.response.json();
      throw new Error(data.error?.message || "An error occurred");
    }
    throw error;
  }

  protected createStream(response: Response, options: StreamOptions = {}): ReadableStream {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = JSON.parse(line.slice(6));

                switch (data.type) {
                  case "text":
                    options.onText?.(data.data);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                    break;
                  case "error":
                    options.onError?.(new Error(data.data));
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                    break;
                  case "usage":
                    options.onUsage?.(data.data);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                    break;
                  case "stop":
                    options.onStop?.();
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                    break;
                }
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Role = "user" | "assistant" | "system";

export interface Message {
  role: Role;
  content: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ChatInput {
  messages: Message[];
  attachments?: Attachment[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface ChatResponse {
  id: string;
  content: string;
  role: Role;
  attachments?: Attachment[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamContext {
  id: string;
  messages?: Message[];
  attachments?: Attachment[];
}

export interface StreamProtocolChunk {
  type: "text" | "error" | "usage" | "stop" | "base64_image" | "tool_calls";
  id: string;
  data: any;
}

export interface StreamOptions {
  onText?: (text: string) => void;
  onError?: (error: Error) => void;
  onUsage?: (usage: any) => void;
  onStop?: () => void;
  onImage?: (image: string) => void;
  onToolCalls?: (calls: any[]) => void;
}

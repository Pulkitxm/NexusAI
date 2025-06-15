/* eslint-disable no-unused-vars */
import type { IconType } from "react-icons";

export enum Provider {
  OpenAI = "openai",
  Anthropic = "anthropic",
  Google = "google"
}

export interface AIModel {
  id: string;
  name: string;
  provider: Provider;
  category: "text" | "image" | "reasoning";
  icon: IconType;
  description: string;
  requiresKey: keyof import("./keys").ApiKeys;
  capabilities: Capabilities;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  lastMessage: string;
  timestamp: Date;
}

export interface Capabilities {
  reasoning?: boolean;
  imageGeneration?: boolean;
  imageUpload?: boolean;
  pdfUpload?: boolean;
  search?: boolean;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | {
        type: "text" | "image" | "file";
        text?: string;
        image_url?: { url: string };
        file_url?: string;
        mime_type?: string;
      }[];
}

export interface ChatInput {
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  model: string;
  attachments?: ProcessedAttachment[];
}

export interface ChatResponse {
  id: string;
  content: string;
  role: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamOptions {
  onText?: (text: string) => void;
  onError?: (error: Error) => void;
  onUsage?: (usage: { promptTokens: number; completionTokens: number; totalTokens: number }) => void;
  onStop?: () => void;
}

export interface ProcessedAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  content?: string;
}

export interface UserSettings {
  jobTitle: string | null;
  occupation: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
}

export interface GlobalMemory {
  content: string;
  category: string | null;
  importance: number;
}

export interface UserData {
  userSettings: UserSettings | null;
  globalMemories: GlobalMemory[];
}

export interface ChatRequestBody {
  messages: { role: string; content: string }[];
  model: string;
  provider?: string;
  apiKey: string;
  chatId?: string;
  reasoning: boolean;
  attachments: string[];
  temperature: number;
  maxTokens: number;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    content: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  error?: {
    message: string;
    code: string;
    status: number;
    details?: unknown;
  };
}

export interface APIErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    status: number;
    details?: unknown;
  };
}

export interface ChatStreamChunk {
  type: "text" | "error" | "done";
  content?: string;
  error?: string;
}

import { z } from "zod";

import { AI_MODELS } from "@/lib/models";

import { Provider, Reasoning } from "./providers";

import type { IconType } from "react-icons";

export interface AIModel {
  id: string;
  uuid: string;
  openRouterId?: string;
  name: string;
  provider: Provider;
  icon: IconType;
  description: string;
  capabilities?: Capabilities;
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
  attachment?: boolean;
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

export const chatBodyValidator = z.object({
  messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1),
  model: z.string().refine((model) => {
    return AI_MODELS.some((m) => m.uuid === model);
  }, "Invalid model ID"),
  provider: z.nativeEnum(Provider),
  apiKey: z.string(),
  chatId: z.string(),
  reasoning: z.nativeEnum(Reasoning).nullable().optional(),
  attachments: z.array(z.string()),
  temperature: z.number().optional().default(0.7),
  maxTokens: z.number().optional().default(1000),
  openRouter: z.boolean().optional().default(false)
});
export type ChatRequestBody = z.infer<typeof chatBodyValidator>;

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

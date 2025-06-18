import { Prisma } from "@prisma/client";
import { IconType } from "react-icons";
import { z } from "zod";

import { AI_MODELS } from "@/data/models";

import { Provider, Reasoning } from "./provider";

export type Chat = Prisma.ChatGetPayload<{
  select: {
    id: true;
    title: true;
    updatedAt: true;
  };
}>;

export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
  openrouter?: string;
}

export interface Capabilities {
  reasoning?: boolean;
  attachment?: boolean;
  search?: boolean;
}

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

export const validateAttachment = z.array(
  z.object({
    id: z.string().min(1),
    size: z.number().min(1),
    name: z.string().min(1),
    url: z.string().min(1),
    uploaded: z.boolean(),
    uploadThingKey: z.string().min(1)
  })
);
export type Attachment = z.infer<typeof validateAttachment>[number];

export const validateChatStreamBody = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string()
      })
    )
    .min(1, "At least one message is required"),
  provider: z.nativeEnum(Provider),
  model: z.string().refine((model) => {
    return AI_MODELS.some((m) => m.uuid === model);
  }, "Invalid model ID"),
  apiKey: z.string(),
  chatId: z.string().optional(),
  reasoning: z.nativeEnum(Reasoning).nullable(),
  attachments: z.array(z.string()),
  webSearch: z.boolean().nullable(),
  temperature: z.number().nullable().optional(),
  maxTokens: z.number().nullable().optional(),
  openRouter: z.boolean().default(false)
});

export type MessageWithAttachments = Prisma.MessageGetPayload<{
  select: {
    id: true;
    role: true;
    content: true;
    createdAt: true;
    attachments: {
      select: {
        id: true;
        url: true;
        name: true;
        size: true;
      };
    };
  };
}>;

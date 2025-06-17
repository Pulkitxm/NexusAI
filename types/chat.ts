import { Prisma } from "@prisma/client";
import { IconType } from "react-icons";
import { z } from "zod";

import { Provider } from "./provider";

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
  groq?: string;
  deepseek?: string;
  fireworks?: string;
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

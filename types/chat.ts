import { Prisma } from "@prisma/client";
import { IconType } from "react-icons";

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

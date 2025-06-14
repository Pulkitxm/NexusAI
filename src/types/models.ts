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

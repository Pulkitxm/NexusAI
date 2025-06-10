import type { IconType } from "react-icons";

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: "text" | "image" | "reasoning";
  icon: IconType;
  description: string;
  requiresKey: keyof import("./keys").ApiKeys;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  lastMessage: string;
  timestamp: Date;
}
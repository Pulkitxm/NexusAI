import type { IconType } from "react-icons";

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: "text" | "image" | "reasoning";
  icon: IconType;
  color: string;
  description: string;
  requiresKey: keyof import("./keys").ApiKeys;
}

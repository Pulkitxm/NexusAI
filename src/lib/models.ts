import { ApiKeys } from "@/types/keys";
import type { AIModel } from "@/types/models";
import { RiAnthropicFill } from "react-icons/ri";
import { SiOpenai } from "react-icons/si";
import { FaGoogle } from "react-icons/fa";

export const AI_MODELS: AIModel[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Fast and efficient for everyday tasks",
    requiresKey: "google",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Advanced reasoning and complex tasks",
    requiresKey: "google",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Balanced speed and capability",
    requiresKey: "google",
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Lightweight and fast responses",
    requiresKey: "google",
  },
  {
    id: "gemini-2.5-flash-thinking",
    name: "Gemini 2.5 Flash (Thinking)",
    provider: "Google",
    category: "reasoning",
    icon: FaGoogle,
    description: "Enhanced reasoning capabilities",
    requiresKey: "google",
  },
  {
    id: "gpt-4.1",
    name: "GPT 4.1",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Latest GPT model with enhanced capabilities",
    requiresKey: "openai",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT 4.1 Mini",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Compact version of GPT 4.1",
    requiresKey: "openai",
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT 4.1 Nano",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Ultra-lightweight GPT model",
    requiresKey: "openai",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT 4o-mini",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Optimized mini version",
    requiresKey: "openai",
  },
  {
    id: "gpt-4o",
    name: "GPT 4o",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Omni-modal GPT model",
    requiresKey: "openai",
  },
  {
    id: "gpt-4.5",
    name: "GPT 4.5",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Next generation GPT model",
    requiresKey: "openai",
  },

  {
    id: "claude-4-sonnet",
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Balanced performance and speed",
    requiresKey: "anthropic",
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Enhanced reasoning and analysis",
    requiresKey: "anthropic",
  },
  {
    id: "claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Advanced language understanding",
    requiresKey: "anthropic",
  },
  {
    id: "claude-3.7-sonnet-reasoning",
    name: "Claude 3.7 Sonnet (Reasoning)",
    provider: "Anthropic",
    category: "reasoning",
    icon: RiAnthropicFill,
    description: "Specialized for complex reasoning",
    requiresKey: "anthropic",
  },
  {
    id: "claude-4-opus",
    name: "Claude 4 Opus",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Most capable Claude model",
    requiresKey: "anthropic",
  },
];

export const getModelsByCategory = (category?: string) => {
  if (!category) return AI_MODELS;
  return AI_MODELS.filter((model) => model.category === category);
};

export const getModelsByProvider = (provider: string) => {
  return AI_MODELS.filter((model) => model.provider === provider);
};

export const getAvailableModels = (keys: ApiKeys) => {
  return AI_MODELS.filter((model) => {
    const requiredKey = keys[model.requiresKey];
    return requiredKey && requiredKey.trim() !== "";
  });
};

const allKeyConfigs = AI_MODELS.map((model) => ({
  key: model.requiresKey,
  name: model.provider,
  description: model.description,
  icon: model.icon,
  color: "bg-emerald-500/90 dark:bg-emerald-600/80",
  link: "https://platform.openai.com/api-keys",
}))
// get only unique keys
export const keyConfigs = allKeyConfigs.filter((key, index, self) =>
  index === self.findIndex((t) => t.key === key.key)
);
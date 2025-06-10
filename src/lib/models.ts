import { ApiKeys } from "@/types/keys";
import type { AIModel } from "@/types/models";
import { RiAnthropicFill } from "react-icons/ri";
import { SiOpenai } from "react-icons/si";
import { FaGoogle } from "react-icons/fa";

export const AI_MODELS: AIModel[] = [
  // Google Models
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Latest Gemini model with multimodal capabilities",
    requiresKey: "google",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Advanced reasoning and complex tasks",
    requiresKey: "google",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Fast and efficient for everyday tasks",
    requiresKey: "google",
  },

  // OpenAI Models
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Most capable GPT model with vision",
    requiresKey: "openai",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Faster and more affordable GPT-4 level intelligence",
    requiresKey: "openai",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Enhanced GPT-4 with improved performance",
    requiresKey: "openai",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Fast and cost-effective for most tasks",
    requiresKey: "openai",
  },

  // Anthropic Models
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Most intelligent Claude model",
    requiresKey: "anthropic",
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Fastest Claude model for quick tasks",
    requiresKey: "anthropic",
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Most capable Claude model for complex tasks",
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

const providerConfigs = [
  {
    key: "openai",
    name: "OpenAI",
    description: "GPT models for general AI tasks",
    icon: SiOpenai,
    color: "bg-green-500/90 dark:bg-green-600/80",
    link: "https://platform.openai.com/api-keys",
  },
  {
    key: "anthropic",
    name: "Anthropic",
    description: "Claude models for thoughtful AI assistance",
    icon: RiAnthropicFill,
    color: "bg-orange-500/90 dark:bg-orange-600/80",
    link: "https://console.anthropic.com/",
  },
  {
    key: "google",
    name: "Google",
    description: "Gemini models for multimodal AI",
    icon: FaGoogle,
    color: "bg-blue-500/90 dark:bg-blue-600/80",
    link: "https://aistudio.google.com/app/apikey",
  },
];

export const keyConfigs = providerConfigs;

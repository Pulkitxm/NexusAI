import { ApiKeys } from "@/types/keys";
import type { AIModel } from "@/types/models";
import { RiAnthropicFill } from "react-icons/ri";
import { SiOpenai } from "react-icons/si";
import { FaGoogle } from "react-icons/fa";

export const AI_MODELS: AIModel[] = [
  // Google Models
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Latest Gemini model with multimodal capabilities",
    requiresKey: "google",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
      search: true,
    },
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Advanced reasoning and complex tasks",
    requiresKey: "google",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
      search: true,
    },
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Fast and efficient multimodal model",
    requiresKey: "google",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
      search: true,
    },
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Lightweight version of Gemini 2.0 Flash",
    requiresKey: "google",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
    },
  },
  {
    id: "gemini-2.5-flash-thinking",
    name: "Gemini 2.5 Flash (Thinking)",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Enhanced reasoning with thinking capabilities",
    requiresKey: "google",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
      search: true,
    },
  },

  // OpenAI Models
  {
    id: "gpt-4o-mini",
    name: "GPT 4o-mini",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Faster and more affordable GPT-4 level intelligence",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true,
    },
  },
  {
    id: "gpt-4o",
    name: "GPT 4o",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Most capable GPT model with vision",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true,
    },
  },
  {
    id: "gpt-4.1",
    name: "GPT 4.1",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Enhanced GPT-4 with improved capabilities",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true,
    },
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT 4.1 Mini",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Compact version of GPT-4.1",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true,
    },
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT 4.1 Nano",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Ultra-lightweight GPT-4.1 variant",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true,
    },
  },
  {
    id: "gpt-4.5",
    name: "GPT 4.5",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Next-generation GPT model with advanced capabilities",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true,
    },
  },

  // Anthropic Models
  {
    id: "claude-4-sonnet",
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Latest Claude model with advanced capabilities",
    requiresKey: "anthropic",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
    },
  },
  {
    id: "claude-4-sonnet-reasoning",
    name: "Claude 4 Sonnet (Reasoning)",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Claude 4 with enhanced reasoning capabilities",
    requiresKey: "anthropic",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
      reasoning: true,
    },
  },
  {
    id: "claude-3.5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Most intelligent Claude 3.5 model",
    requiresKey: "anthropic",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
    },
  },
  {
    id: "claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Enhanced Claude model with improved performance",
    requiresKey: "anthropic",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
    },
  },
  {
    id: "claude-3.7-sonnet-reasoning",
    name: "Claude 3.7 Sonnet (Reasoning)",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Claude 3.7 with advanced reasoning capabilities",
    requiresKey: "anthropic",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
      reasoning: true,
    },
  },
  {
    id: "claude-4-opus",
    name: "Claude 4 Opus",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Most capable Claude 4 model for complex tasks",
    requiresKey: "anthropic",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
    },
  },
  {
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Fastest Claude model for quick tasks",
    requiresKey: "anthropic",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
    },
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Most capable Claude 3 model for complex tasks",
    requiresKey: "anthropic",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
    },
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

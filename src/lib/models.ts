import { FaGoogle } from "react-icons/fa";
import { RiAnthropicFill } from "react-icons/ri";
import { SiOpenai } from "react-icons/si";

import { ApiKeys } from "@/types/keys";

import type { AIModel } from "@/types/models";

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
      search: true
    }
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
      search: true
    }
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
      reasoning: true
    }
  },
  {
    id: "gemini-2.5-pro-thinking",
    name: "Gemini 2.5 Pro (Thinking)",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "State-of-the-art reasoning with thinking mode",
    requiresKey: "google",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
      search: true,
      reasoning: true
    }
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
      search: true
    }
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
      pdfUpload: true
    }
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Long context understanding and complex reasoning",
    requiresKey: "google",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
      search: true
    }
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Fast multimodal model with efficient processing",
    requiresKey: "google",
    capabilities: {
      imageUpload: true,
      pdfUpload: true,
      search: true
    }
  },
  {
    id: "gemini-1.5-flash-8b",
    name: "Gemini 1.5 Flash-8B",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Compact 8B parameter model for efficiency",
    requiresKey: "google",
    capabilities: {
      imageUpload: true,
      pdfUpload: true
    }
  },
  {
    id: "gemini-1.0-pro",
    name: "Gemini 1.0 Pro",
    provider: "Google",
    category: "text",
    icon: FaGoogle,
    description: "Original Gemini Pro model",
    requiresKey: "google",
    capabilities: {
      imageUpload: true,
      pdfUpload: true
    }
  },

  // OpenAI Models
  {
    id: "gpt-4o",
    name: "GPT 4o",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Most capable GPT model with vision",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true
    }
  },
  {
    id: "gpt-4o-mini",
    name: "GPT 4o-mini",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Faster and more affordable GPT-4 level intelligence",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true
    }
  },
  {
    id: "gpt-4.1",
    name: "GPT 4.1",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Enhanced GPT-4 with improved coding and instruction following",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true
    }
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT 4.1 Mini",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Compact version of GPT-4.1 with improved performance",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true
    }
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
      imageUpload: true
    }
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
      imageUpload: true
    }
  },
  {
    id: "o4-mini",
    name: "OpenAI o4-mini",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Optimized for fast, cost-efficient reasoning in math, coding, and visual tasks",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true,
      reasoning: true
    }
  },
  {
    id: "o3",
    name: "OpenAI o3",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Advanced reasoning model with omni-modal architecture",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true,
      reasoning: true
    }
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Large multimodal model optimized for chat and accuracy",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true
    }
  },
  {
    id: "gpt-4-turbo-preview",
    name: "GPT-4 Turbo Preview",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Preview version of GPT-4 Turbo with latest features",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true
    }
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Original GPT-4 model with high capability",
    requiresKey: "openai",
    capabilities: {
      imageUpload: true
    }
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    category: "text",
    icon: SiOpenai,
    description: "Fast and cost-effective model for many tasks",
    requiresKey: "openai",
    capabilities: {}
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
      pdfUpload: true
    }
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
      pdfUpload: true
    }
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
      reasoning: true
    }
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
      pdfUpload: true
    }
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
      reasoning: true
    }
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
      pdfUpload: true
    }
  },
  {
    id: "claude-3.5-sonnet-20240620",
    name: "Claude 3.5 Sonnet (June)",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Earlier version of Claude 3.5 Sonnet",
    requiresKey: "anthropic",
    capabilities: {
      imageUpload: true,
      pdfUpload: true
    }
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
      pdfUpload: true
    }
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
      pdfUpload: true
    }
  },
  {
    id: "claude-3-sonnet-20240229",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Balanced Claude 3 model for various tasks",
    requiresKey: "anthropic",
    capabilities: {
      imageUpload: true,
      pdfUpload: true
    }
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Fastest Claude 3 model for simple tasks",
    requiresKey: "anthropic",
    capabilities: {
      imageUpload: true,
      pdfUpload: true
    }
  },
  {
    id: "claude-2.1",
    name: "Claude 2.1",
    provider: "Anthropic",
    category: "text",
    icon: RiAnthropicFill,
    description: "Previous generation Claude model",
    requiresKey: "anthropic",
    capabilities: {
      pdfUpload: true
    }
  }
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
    link: "https://platform.openai.com/api-keys"
  },
  {
    key: "anthropic",
    name: "Anthropic",
    description: "Claude models for thoughtful AI assistance",
    icon: RiAnthropicFill,
    color: "bg-orange-500/90 dark:bg-orange-600/80",
    link: "https://console.anthropic.com/"
  },
  {
    key: "google",
    name: "Google",
    description: "Gemini models for multimodal AI",
    icon: FaGoogle,
    color: "bg-purple-500/90 dark:bg-purple-600/80",
    link: "https://aistudio.google.com/app/apikey"
  }
];

export const keyConfigs = providerConfigs;

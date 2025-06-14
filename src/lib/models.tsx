import { FaGoogle } from "react-icons/fa";
import { RiAnthropicFill } from "react-icons/ri";
import { SiOpenai } from "react-icons/si";

import { ApiKeys } from "@/types/keys";
import { Provider, type AIModel } from "@/types/models";

export const AI_MODELS: AIModel[] = [
  // Google Models
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: Provider.Google,
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
    provider: Provider.Google,
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
    provider: Provider.Google,
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
    provider: Provider.Google,
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
    provider: Provider.Google,
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
    provider: Provider.Google,
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
    provider: Provider.Google,
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
    provider: Provider.Google,
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
    provider: Provider.Google,
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
    provider: Provider.Google,
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
    provider: Provider.OpenAI,
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
    provider: Provider.OpenAI,
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
    provider: Provider.OpenAI,
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
    provider: Provider.OpenAI,
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
    provider: Provider.OpenAI,
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
    provider: Provider.OpenAI,
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
    provider: Provider.OpenAI,
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
    provider: Provider.OpenAI,
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
    provider: Provider.OpenAI,
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
    provider: Provider.OpenAI,
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
    provider: Provider.OpenAI,
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
    provider: Provider.OpenAI,
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
    provider: Provider.Anthropic,
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
    provider: Provider.Anthropic,
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
    provider: Provider.Anthropic,
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
    provider: Provider.Anthropic,
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
    provider: Provider.Anthropic,
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
    provider: Provider.Anthropic,
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
    provider: Provider.Anthropic,
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
    provider: Provider.Anthropic,
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
    provider: Provider.Anthropic,
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
    provider: Provider.Anthropic,
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
    provider: Provider.Anthropic,
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
    provider: Provider.Anthropic,
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
    key: "openrouter",
    name: "OpenRouter",
    description: "OpenRouter models for general AI tasks",
    icon: () => (
      <svg
        fill="currentColor"
        fillRule="evenodd"
        height="1em"
        viewBox="0 0 24 24"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-primary"
        style={{ flex: "0 0 auto", lineHeight: "1" }}
      >
        <title>OpenRouter</title>
        <path d="M16.804 1.957l7.22 4.105v.087L16.73 10.21l.017-2.117-.821-.03c-1.059-.028-1.611.002-2.268.11-1.064.175-2.038.577-3.147 1.352L8.345 11.03c-.284.195-.495.336-.68.455l-.515.322-.397.234.385.23.53.338c.476.314 1.17.796 2.701 1.866 1.11.775 2.083 1.177 3.147 1.352l.3.045c.694.091 1.375.094 2.825.033l.022-2.159 7.22 4.105v.087L16.589 22l.014-1.862-.635.022c-1.386.042-2.137.002-3.138-.162-1.694-.28-3.26-.926-4.881-2.059l-2.158-1.5a21.997 21.997 0 00-.755-.498l-.467-.28a55.927 55.927 0 00-.76-.43C2.908 14.73.563 14.116 0 14.116V9.888l.14.004c.564-.007 2.91-.622 3.809-1.124l1.016-.58.438-.274c.428-.28 1.072-.726 2.686-1.853 1.621-1.133 3.186-1.78 4.881-2.059 1.152-.19 1.974-.213 3.814-.138l.02-1.907z"></path>
      </svg>
    ),
    color: "bg-green-500/90 dark:bg-green-600/80",
    link: "https://openrouter.ai/api-keys"
  },
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

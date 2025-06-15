import { DeepSeek, Meta, OpenRouter, Qwen, Grok } from "@lobehub/icons";
import { FaGoogle } from "react-icons/fa";
import { RiAnthropicFill } from "react-icons/ri";
import { SiOpenai } from "react-icons/si";

import { ApiKeys } from "@/types/keys";
import { Provider } from "@/types/providers";

import type { AIModel } from "@/types/models";

export const AI_MODELS: AIModel[] = [
  // OpenRouter Models
  {
    id: "deepseek/deepseek-r1",
    openRouterId: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    provider: Provider.OpenRouter,
    icon: DeepSeek,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description: "The first reasoning model from DeepSeek"
  },
  {
    id: "deepseek/deepseek-chat-v3-0324",
    openRouterId: "deepseek/deepseek-chat-v3-0324",
    name: "DeepSeek V3 0324",
    provider: Provider.OpenRouter,
    icon: DeepSeek,
    description:
      "A 685B-parameter mixture-of-experts model, successor to DeepSeek V3 with enhanced performance across diverse tasks"
  },
  {
    id: "deepseek/deepseek-r1-0528",
    openRouterId: "deepseek/deepseek-r1-0528",
    name: "DeepSeek R1 0528",
    provider: Provider.OpenRouter,
    icon: DeepSeek,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "671B parameter open-source model with performance matching OpenAI o1. Features 37B active parameters per inference and fully open reasoning tokens."
  },
  {
    id: "deepseek/deepseek-chat-v3-0324",
    openRouterId: "deepseek/deepseek-chat-v3-0324",
    name: "DeepSeek V3 0324",
    provider: Provider.OpenRouter,
    icon: DeepSeek,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "A 685B-parameter mixture-of-experts model, successor to DeepSeek V3 with enhanced performance across diverse tasks"
  },
  {
    id: "qwen/qwen3-32b",
    openRouterId: "qwen/qwen3-32b",
    name: "Qwen3 32B",
    provider: Provider.OpenRouter,
    icon: Qwen,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "32.8B parameter model with dual-mode operation for complex reasoning and efficient dialogue. Features 32K context window, multilingual support, and strong performance in instruction-following, coding, and creative tasks"
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct",
    openRouterId: "qwen/qwen-2.5-coder-32b-instruct",
    name: "Qwen2.5 Coder 32B Instruct",
    provider: Provider.OpenRouter,
    icon: Qwen,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "Latest code-specialized model in the Qwen series, featuring enhanced code generation, reasoning, and debugging capabilities. Maintains strong performance in mathematics and general tasks while providing a robust foundation for code agent applications."
  },
  {
    id: "meta-llama/llama-4-maverick",
    openRouterId: "meta-llama/llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: Provider.OpenRouter,
    icon: Meta,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "Llama 4 Maverick is a 70B parameter model with enhanced reasoning capabilities and improved performance across diverse tasks"
  },
  {
    id: "meta-llama/llama-4-scout",
    openRouterId: "meta-llama/llama-4-scout",
    name: "Llama 4 Scout",
    provider: Provider.OpenRouter,
    icon: Meta,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "Llama 4 Scout is a 17B parameter mixture-of-experts model with native multimodal capabilities, supporting text and image input across 12 languages. Features 16 experts per forward pass, 10M token context length, and instruction-tuning for multilingual chat and visual reasoning tasks."
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    openRouterId: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B Instruct",
    provider: Provider.OpenRouter,
    icon: Meta,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "Llama 3.3 70B Instruct is a multilingual instruction-tuned model optimized for dialogue, supporting 8 languages including English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai. It delivers strong performance across industry benchmarks while maintaining efficient text generation capabilities."
  },
  {
    id: "x-ai/grok-3-beta",
    openRouterId: "x-ai/grok-3-beta",
    name: "Grok 3",
    provider: Provider.OpenRouter,
    icon: Grok,
    capabilities: {
      attachment: true
    },
    description:
      "xAI's flagship model optimized for enterprise tasks like data extraction and coding. Features deep domain expertise and superior benchmark performance. Available in base (default) and fast endpoints."
  },
  {
    id: "x-ai/grok-3-beta",
    openRouterId: "x-ai/grok-3-beta",
    name: "Grok 3",
    provider: Provider.OpenRouter,
    icon: Grok,
    capabilities: {
      attachment: true
    },
    description:
      "xAI's flagship model optimized for enterprise tasks like data extraction, coding, and text summarization. Features deep domain expertise in finance, healthcare, law, and science. Excels in structured tasks and benchmarks like GPQA, LCB, and MMLU-Pro. Available in base (default) and fast endpoints."
  },

  // Google Models
  {
    id: "gemini-2.5-flash",
    openRouterId: "google/gemini-2.5-flash-preview-05-20",
    name: "Gemini 2.5 Flash",
    provider: Provider.Google,
    icon: FaGoogle,
    description: "Latest Gemini model with multimodal capabilities",
    capabilities: {
      attachment: true,
      search: true
    }
  },
  {
    id: "gemini-2.5-flash-thinking",
    openRouterId: "google/gemini-2.5-flash-preview-05-20:thinking",
    name: "Gemini 2.5 Flash (Thinking)",
    provider: Provider.Google,
    icon: FaGoogle,
    description: "Enhanced reasoning with thinking capabilities",
    capabilities: {
      attachment: true,
      search: true,
      reasoning: true
    }
  },
  {
    id: "gemini-2.5-pro",
    openRouterId: "google/gemini-2.5-pro-preview",
    name: "Gemini 2.5 Pro",
    provider: Provider.Google,
    icon: FaGoogle,
    description: "Advanced reasoning and complex tasks",
    capabilities: {
      attachment: true,
      search: true,
      reasoning: true
    }
  },
  {
    id: "google/gemini-2.0-flash-001",
    openRouterId: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash",
    provider: Provider.Google,
    icon: FaGoogle,
    description: "Fast and efficient multimodal model",
    capabilities: {
      attachment: true,
      search: true
    }
  },
  {
    id: "gemini-2.0-flash-lite",
    openRouterId: "google/gemini-2.0-flash-lite-001",
    name: "Gemini 2.0 Flash Lite",
    provider: Provider.Google,
    icon: FaGoogle,
    description: "Lightweight version of Gemini 2.0 Flash",
    capabilities: {
      attachment: true
    }
  },

  // OpenAI Models
  {
    id: "gpt-4o",
    openRouterId: "openai/gpt-4o",
    name: "GPT 4o",
    provider: Provider.OpenAI,
    icon: SiOpenai,
    description: "Most capable GPT model with vision",
    capabilities: {
      attachment: true
    }
  },
  {
    id: "gpt-4o-mini",
    openRouterId: "openai/gpt-4o-mini",
    name: "GPT 4o-mini",
    provider: Provider.OpenAI,
    icon: SiOpenai,
    description: "Faster and more affordable GPT-4 level intelligence",
    capabilities: {
      attachment: true
    }
  },
  {
    id: "gpt-4.1",
    openRouterId: "openai/gpt-4.1",
    name: "GPT 4.1",
    provider: Provider.OpenAI,
    icon: SiOpenai,
    description: "Enhanced GPT-4 with improved coding and instruction following",
    capabilities: {
      attachment: true
    }
  },
  {
    id: "gpt-4.1-mini",
    openRouterId: "openai/gpt-4.1-mini",
    name: "GPT 4.1 Mini",
    provider: Provider.OpenAI,
    icon: SiOpenai,
    description: "Compact version of GPT-4.1 with improved performance",
    capabilities: {
      attachment: true
    }
  },
  {
    id: "gpt-4.1-nano",
    openRouterId: "openai/gpt-4.1-nano",
    name: "GPT 4.1 Nano",
    provider: Provider.OpenAI,
    icon: SiOpenai,
    description: "Ultra-lightweight GPT-4.1 variant",
    capabilities: {
      attachment: true
    }
  },
  {
    id: "gpt-4.5",
    openRouterId: "openai/gpt-4.5-preview",
    name: "GPT 4.5",
    provider: Provider.OpenAI,
    icon: SiOpenai,
    description: "Next-generation GPT model with advanced capabilities",
    capabilities: {
      attachment: true
    }
  },
  {
    id: "o4-mini",
    openRouterId: "openai/o4-mini",
    name: "OpenAI o4-mini",
    provider: Provider.OpenAI,
    icon: SiOpenai,
    description: "Optimized for fast, cost-efficient reasoning in math, coding, and visual tasks",
    capabilities: {
      attachment: true,
      reasoning: true
    }
  },
  {
    id: "o3",
    openRouterId: "openai/o3",
    name: "OpenAI o3",
    provider: Provider.OpenAI,
    icon: SiOpenai,
    description: "Advanced reasoning model with omni-modal architecture",
    capabilities: {
      attachment: true,
      reasoning: true
    }
  },
  {
    id: "o3-mini",
    openRouterId: "openai/o3-mini",
    name: "OpenAI o3-mini",
    provider: Provider.OpenAI,
    icon: SiOpenai,
    description: "Lightweight version of o3 model for efficient reasoning tasks",
    capabilities: {
      reasoning: true
    }
  },
  {
    id: "o3-pro",
    openRouterId: "openai/o3-pro",
    name: "OpenAI o3-pro",
    provider: Provider.OpenAI,
    icon: SiOpenai,
    description: "Professional-grade o3 model with enhanced capabilities",
    capabilities: {
      attachment: true,
      reasoning: true
    }
  },

  // Anthropic Models
  {
    id: "claude-4-sonnet",
    openRouterId: "anthropic/claude-sonnet-4",
    name: "Claude 4 Sonnet",
    provider: Provider.Anthropic,
    icon: RiAnthropicFill,
    description: "Latest Claude model with advanced capabilities",
    capabilities: {
      attachment: true
    }
  },
  {
    id: "claude-4-opus",
    openRouterId: "anthropic/claude-opus-4",
    name: "Claude 4 Opus",
    provider: Provider.Anthropic,
    icon: RiAnthropicFill,
    description: "Most capable Claude 4 model for complex tasks",
    capabilities: {
      attachment: true
    }
  },
  {
    id: "claude-4-sonnet-reasoning",
    name: "Claude 4 Sonnet (Reasoning)",
    provider: Provider.Anthropic,
    icon: RiAnthropicFill,
    description: "Claude 4 with enhanced reasoning capabilities",
    capabilities: {
      attachment: true,
      reasoning: true
    }
  },
  {
    id: "claude-3.7-sonnet",
    openRouterId: "anthropic/claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: Provider.Anthropic,
    icon: RiAnthropicFill,
    description: "Enhanced Claude model with improved performance",
    capabilities: {
      attachment: true
    }
  },
  {
    id: "claude-3.7-sonnet-reasoning",
    openRouterId: "anthropic/claude-3.7-sonnet:thinking",
    name: "Claude 3.7 Sonnet (Reasoning)",
    provider: Provider.Anthropic,
    icon: RiAnthropicFill,
    description: "Claude 3.7 with advanced reasoning capabilities",
    capabilities: {
      attachment: true,
      reasoning: true
    }
  },
  {
    id: "claude-3.5-sonnet-20241022",
    openRouterId: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: Provider.Anthropic,
    icon: RiAnthropicFill,
    description: "Most intelligent Claude 3.5 model",
    capabilities: {
      attachment: true
    }
  }
];
export const ALL_MODELS = AI_MODELS.map((model) => model.id);

export const getModelsByProvider = (provider: string) => {
  return AI_MODELS.filter((model) => model.provider === provider);
};

export const getAvailableModels = (keys: ApiKeys) => {
  if (keys.openrouter)
    return AI_MODELS.filter((model) => model.provider === Provider.OpenRouter || !!model.openRouterId);
  return AI_MODELS.filter((model) => {
    const requiredKey = keys[model.provider];
    return requiredKey && requiredKey.trim() !== "";
  });
};

const providerConfigs = [
  {
    key: Provider.OpenRouter,
    name: "OpenRouter",
    description: "Access multiple AI models through a single API key",
    icon: OpenRouter,
    color: "bg-green-500/90 dark:bg-green-600/80",
    link: "https://openrouter.ai/api-keys"
  },
  {
    key: Provider.OpenAI,
    name: "OpenAI",
    description: "OpenAI models for general AI tasks",
    icon: SiOpenai,
    color: "bg-green-500/90 dark:bg-green-600/80",
    link: "https://platform.openai.com/api-keys"
  },
  {
    key: Provider.Anthropic,
    name: "Anthropic",
    description: "Claude models for thoughtful AI assistance",
    icon: RiAnthropicFill,
    color: "bg-orange-500/90 dark:bg-orange-600/80",
    link: "https://console.anthropic.com/"
  },
  {
    key: Provider.Google,
    name: "Google",
    description: "Gemini models for multimodal AI",
    icon: FaGoogle,
    color: "bg-purple-500/90 dark:bg-purple-600/80",
    link: "https://aistudio.google.com/app/apikey"
  }
];

export const keyConfigs = providerConfigs;

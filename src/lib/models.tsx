import { FaGoogle } from "react-icons/fa";
import { RiAnthropicFill } from "react-icons/ri";
import { SiOpenai } from "react-icons/si";

import { ApiKeys } from "@/types/keys";
import { Provider } from "@/types/providers";

import { DEEPSEEK_ICON, GROK_ICON, META_ICON, OPENROUTER_ICON, QWEN_ICON } from "./data";

import type { AIModel } from "@/types/models";

export const AI_MODELS: AIModel[] = [
  // OpenRouter Models
  {
    id: "deepseek/deepseek-r1",
    uuid: "79d8ba49-5c07-469c-b72f-3ea9037074d1",
    openRouterId: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    provider: Provider.OpenRouter,
    icon: DEEPSEEK_ICON,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description: "The first reasoning model from DeepSeek"
  },
  {
    id: "deepseek/deepseek-chat-v3-0324",
    uuid: "aafbc193-1abe-47bb-a66c-27dfb7e38355",
    openRouterId: "deepseek/deepseek-chat-v3-0324",
    name: "DeepSeek V3",
    provider: Provider.OpenRouter,
    icon: DEEPSEEK_ICON,
    description:
      "A 685B-parameter mixture-of-experts model, successor to DeepSeek V3 with enhanced performance across diverse tasks"
  },
  {
    id: "deepseek/deepseek-r1-0528",
    uuid: "2900b61c-ce9b-40b4-b7b5-d3ab65fa4248",
    openRouterId: "deepseek/deepseek-r1-0528",
    name: "DeepSeek R1",
    provider: Provider.OpenRouter,
    icon: DEEPSEEK_ICON,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "671B parameter open-source model with performance matching OpenAI o1. Features 37B active parameters per inference and fully open reasoning tokens."
  },
  {
    id: "qwen/qwen3-32b",
    uuid: "823b8c69-ffd9-463f-9e3e-91a5060b2e97",
    openRouterId: "qwen/qwen3-32b",
    name: "Qwen3 32B",
    provider: Provider.OpenRouter,
    icon: QWEN_ICON,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "32.8B parameter model with dual-mode operation for complex reasoning and efficient dialogue. Features 32K context window, multilingual support, and strong performance in instruction-following, coding, and creative tasks"
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct",
    uuid: "1d517c73-dd58-4de5-9a36-e881591fe8e8",
    openRouterId: "qwen/qwen-2.5-coder-32b-instruct",
    name: "Qwen2.5 Coder 32B Instruct",
    provider: Provider.OpenRouter,
    icon: QWEN_ICON,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "Latest code-specialized model in the Qwen series, featuring enhanced code generation, reasoning, and debugging capabilities. Maintains strong performance in mathematics and general tasks while providing a robust foundation for code agent applications."
  },
  {
    id: "meta-llama/llama-4-maverick",
    uuid: "eab6ed67-b847-4691-9073-f537ba22fa70",
    openRouterId: "meta-llama/llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: Provider.OpenRouter,
    icon: META_ICON,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "Llama 4 Maverick is a 70B parameter model with enhanced reasoning capabilities and improved performance across diverse tasks"
  },
  {
    id: "meta-llama/llama-4-scout",
    uuid: "d2ebd5e7-0e64-43e8-9182-ccec7e0f7b01",
    openRouterId: "meta-llama/llama-4-scout",
    name: "Llama 4 Scout",
    provider: Provider.OpenRouter,
    icon: META_ICON,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "Llama 4 Scout is a 17B parameter mixture-of-experts model with native multimodal capabilities, supporting text and image input across 12 languages. Features 16 experts per forward pass, 10M token context length, and instruction-tuning for multilingual chat and visual reasoning tasks."
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    uuid: "7f078395-b152-4a4f-bed1-c446b3a606c0",
    openRouterId: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B Instruct",
    provider: Provider.OpenRouter,
    icon: META_ICON,
    capabilities: {
      reasoning: true,
      attachment: true
    },
    description:
      "Llama 3.3 70B Instruct is a multilingual instruction-tuned model optimized for dialogue, supporting 8 languages including English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai. It delivers strong performance across industry benchmarks while maintaining efficient text generation capabilities."
  },
  {
    id: "x-ai/grok-3-beta",
    uuid: "9d1fbac0-339d-4309-8d80-c3d970ea4be3",
    openRouterId: "x-ai/grok-3-beta",
    name: "Grok 3",
    provider: Provider.OpenRouter,
    icon: GROK_ICON,
    capabilities: {
      attachment: true
    },
    description:
      "xAI's flagship model optimized for enterprise tasks like data extraction and coding. Features deep domain expertise and superior benchmark performance. Available in base (default) and fast endpoints."
  },
  {
    id: "x-ai/grok-3-mini-beta",
    uuid: "dd6bb346-b56b-4ad7-ab12-5755c5833621",
    openRouterId: "x-ai/grok-3-mini-beta",
    name: "Grok 3 Mini",
    provider: Provider.OpenRouter,
    icon: GROK_ICON,
    capabilities: {
      attachment: true
    },
    description:
      "xAI's flagship model optimized for enterprise tasks like data extraction, coding, and text summarization. Features deep domain expertise in finance, healthcare, law, and science. Excels in structured tasks and benchmarks like GPQA, LCB, and MMLU-Pro. Available in base (default) and fast endpoints."
  },

  // Google Models
  {
    id: "gemini-2.5-flash",
    uuid: "e6f77b94-8775-42c1-87b1-e9303688873f",
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
    uuid: "42a37421-af28-4a3f-a254-7c1be96b8793",
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
    uuid: "69e147c3-aad5-4e33-b9c3-aafd13b6173d",
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
    uuid: "99ec6607-8749-4e0c-b645-f5b797c5f7d3",
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
    uuid: "69362cce-4781-4525-9aec-5cfebec9ad8f",
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
    uuid: "724c1fd7-c5ca-4487-9ef2-74bf0922c158",
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
    uuid: "d191669f-a0d2-4fbd-b91f-d51cf18e8296",
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
    uuid: "ae30551e-3285-4b23-81e2-eaf00298e23a",
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
    uuid: "19055e3e-b064-4bb5-8cc0-df8cfecd9369",
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
    uuid: "6b95b751-e5b2-4f25-b282-889940f2757e",
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
    uuid: "920c1d39-a573-436e-b957-930f7d2fdc3f",
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
    uuid: "d3e48622-4358-424f-ab76-7da72a248d4d",
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
    uuid: "0b8ab35e-996c-4665-80cb-aa41a6a8682e",
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
    uuid: "397cb217-502a-4e4f-a381-6f852028f769",
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
    uuid: "748fdf38-cd65-4c33-858a-e5a90a608858",
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
    uuid: "8bcf7fbb-33c7-42e5-8adf-191a1a301f74",
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
    uuid: "bd39104a-30c7-4bed-a201-894434872ec4",
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
    uuid: "6247eead-3436-4a73-8eef-6a558c52bd78",
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
    uuid: "5e30d772-8932-4948-b78a-aa429f6b4dad",
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
    uuid: "e14bc460-2f1a-496c-a6b6-c71aba0445e3",
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
    uuid: "ba151fe5-c93c-4750-ad65-c9a6af781522",
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

const providerConfigs = [
  {
    key: Provider.OpenRouter,
    name: "OpenRouter",
    description: "Access multiple AI models through a single API key",
    icon: OPENROUTER_ICON,
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

export const getProviderIcon = (provider: Provider) => {
  return providerConfigs.find((config) => config.key === provider)?.icon;
};

export const keyConfigs = providerConfigs;

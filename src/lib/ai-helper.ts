import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { LanguageModelV1 } from "ai";

import { OPENROUTER_BASE_URL } from "@/lib/data";
import { Provider } from "@/types/providers";

import { ReasoningHandler } from "./reasoningHandler";

export function getAiProvider({
  apiKey,
  finalModel,
  modelProvider,
  openRouter,
  reasoningConfig
}: {
  modelProvider: Provider;
  apiKey: string;
  openRouter: boolean | undefined;
  finalModel: string;
  reasoningConfig?: ReturnType<typeof ReasoningHandler.getReasoningConfig>;
}):
  | {
      success: true;
      aiModel: LanguageModelV1;
    }
  | {
      success: false;
      error: string;
    } {
  let aiModel: LanguageModelV1 | null = null;

  if (modelProvider === Provider.OpenRouter || modelProvider === Provider.OpenAI || openRouter) {
    const openai = createOpenAI({
      apiKey,
      baseURL: modelProvider === Provider.OpenRouter ? OPENROUTER_BASE_URL : undefined
    });
    aiModel = openai(finalModel, {
      structuredOutputs: true,
      ...(reasoningConfig?.enabled && reasoningConfig?.config
        ? {
            reasoningEffort: reasoningConfig?.config.reasoningEffort as "high" | "medium" | "low"
          }
        : {})
    });
  } else if (modelProvider === Provider.Anthropic) {
    const anthropic = createAnthropic({ apiKey });
    aiModel = anthropic(finalModel, {
      ...(reasoningConfig?.enabled ? reasoningConfig?.config : {})
    });
  } else if (modelProvider === Provider.Google) {
    const google = createGoogleGenerativeAI({ apiKey });
    aiModel = google(finalModel);
  }

  if (!aiModel) {
    return { success: false, error: "Invalid model provider" };
  }

  return { success: true, aiModel };
}

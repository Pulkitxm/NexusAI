import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { LanguageModelV1 } from "ai";

import { OPENROUTER_BASE_URL } from "@/lib/data";
import { Provider } from "@/types/providers";

import { AI_MODELS } from "./models";
import { ReasoningHandler } from "./reasoningHandler";

export function getAiProvider({
  apiKey,
  finalModelId,
  modelProvider,
  openRouter,
  reasoningConfig
}: {
  modelProvider: Provider;
  apiKey: string;
  openRouter: boolean | undefined;
  finalModelId: string;
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

  const shouldUseOpenRouter = modelProvider === Provider.OpenAI || openRouter;
  if (modelProvider === Provider.OpenRouter || shouldUseOpenRouter) {
    const openai = createOpenAI({
      apiKey,
      baseURL: shouldUseOpenRouter ? OPENROUTER_BASE_URL : undefined
    });
    const modelConfig = AI_MODELS.find((m) => m.id === finalModelId);
    const modelToUse = shouldUseOpenRouter ? modelConfig?.openRouterId : finalModelId;

    if (!modelToUse) {
      return { success: false, error: "Model not found" };
    }

    aiModel = openai(modelToUse, {
      structuredOutputs: true,
      ...(reasoningConfig?.enabled && reasoningConfig?.config
        ? {
            reasoningEffort: reasoningConfig?.config.reasoningEffort as "high" | "medium" | "low"
          }
        : {})
    });
  } else if (modelProvider === Provider.Anthropic) {
    const anthropic = createAnthropic({ apiKey });
    aiModel = anthropic(finalModelId, {
      ...(reasoningConfig?.enabled ? reasoningConfig?.config : {})
    });
  } else if (modelProvider === Provider.Google) {
    const google = createGoogleGenerativeAI({ apiKey });
    aiModel = google(finalModelId);
  }

  if (!aiModel) {
    return { success: false, error: "Invalid model provider" };
  }

  return { success: true, aiModel };
}

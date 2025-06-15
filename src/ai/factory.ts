import { Provider } from "@/types/providers";

import { AnthropicProvider } from "./anthropic";
import { GoogleProvider } from "./google";
import { OpenAIProvider } from "./openai";

import type { BaseAIProvider } from "./base";

export const getAIProvider = ({
  provider,
  apiKey,
  openRouter = false
}: {
  provider: Provider;
  apiKey: string;
  openRouter?: boolean;
}): BaseAIProvider | undefined => {
  if (provider === Provider.OpenAI) {
    return new OpenAIProvider({ apiKey, isOpenRouter: openRouter });
  } else if (provider === Provider.Anthropic) {
    return new AnthropicProvider({ apiKey, isOpenRouter: openRouter });
  } else if (provider === Provider.Google) {
    return new GoogleProvider({ apiKey, isOpenRouter: openRouter });
  }
  return undefined;
};

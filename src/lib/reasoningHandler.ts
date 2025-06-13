export class ReasoningHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getReasoningConfig(reasoning: string | boolean | undefined, modelConfig: any) {
    if (!reasoning || !modelConfig.capabilities.reasoning) {
      return { enabled: false };
    }

    const reasoningLevel = typeof reasoning === "string" ? reasoning : "medium";

    switch (modelConfig.provider) {
      case "OpenAI":
        return {
          enabled: true,
          config: {
            reasoningEffort: this.mapReasoningLevel(reasoningLevel)
          }
        };

      case "Anthropic":
        return {
          enabled: true,
          config: {
            sendReasoning: true,
            reasoningDepth: reasoningLevel
          }
        };

      default:
        return { enabled: false };
    }
  }

  private static mapReasoningLevel(level: string): string {
    switch (level.toLowerCase()) {
      case "high":
        return "high";
      case "low":
        return "low";
      case "medium":
      default:
        return "medium";
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static shouldUseReasoningModel(reasoning: any, currentModel: any, availableModels: any[]): string {
    if (!reasoning || currentModel.capabilities.reasoning) {
      return currentModel.id;
    }

    const reasoningModel = availableModels.find(
      (m) => m.provider === currentModel.provider && m.capabilities.reasoning
    );

    return reasoningModel?.id || currentModel.id;
  }
}

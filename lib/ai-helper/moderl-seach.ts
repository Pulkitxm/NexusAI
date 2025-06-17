import { CAPABILITY_CONFIG } from "@/chat/model-switcher/constants";

import type { AIModel } from "@/types/chat";

export function calculateMatchScore(model: AIModel, query: string, availableModels: AIModel[]): number {
  if (!query.trim()) return 0;

  const lowerQuery = query.toLowerCase();
  let score = 0;

  if (model.name.toLowerCase() === lowerQuery) score += 1.0;
  else if (model.name.toLowerCase().includes(lowerQuery)) score += 0.8;

  if (model.provider.toLowerCase().includes(lowerQuery)) score += 0.6;

  if (model.description.toLowerCase().includes(lowerQuery)) score += 0.4;

  if (model.capabilities) {
    Object.entries(model.capabilities).forEach(([key, value]) => {
      if (!value) return;
      const config = CAPABILITY_CONFIG[key];
      if (!config) return;

      if (config.label.toLowerCase().includes(lowerQuery)) score += 0.7;
      config.searchTerms.forEach((term) => {
        if (term.toLowerCase().includes(lowerQuery) || lowerQuery.includes(term.toLowerCase())) {
          score += 0.3;
        }
      });
    });
  }

  const isAvailable = availableModels.some((m) => m.id === model.id);
  if (lowerQuery === "available" && isAvailable) score += 0.9;
  if (lowerQuery === "unavailable" && !isAvailable) score += 0.9;

  return Math.min(score, 1.0);
}

export function filterModels(models: AIModel[], query: string, availableModels: AIModel[]): AIModel[] {
  if (!query.trim()) return models;

  return models
    .map((model) => ({
      model,
      score: calculateMatchScore(model, query, availableModels)
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ model }) => model);
}

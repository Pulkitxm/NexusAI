"use client";

import { Zap } from "lucide-react";
import { memo } from "react";

import { AnimatedWrapper } from "@/components/ui/animated-wrapper";
import { HighlightedText } from "@/components/ui/highlighted-text";
import { getProviderIcon } from "@/data/models";

import { ModelCard } from "./model-card";

import type { ProviderSectionProps } from "../../types/model-selector";
import type { Provider } from "@/types/provider";

export const ProviderSection = memo<ProviderSectionProps>(
  ({ provider, models, selectedModel, onModelSelect, searchQuery, index, availableModels }) => {
    const ProviderIcon = getProviderIcon(provider as Provider) || Zap;

    return (
      <AnimatedWrapper show={true} delay={index * 50}>
        <div className="space-y-5">
          <div className="sticky top-0 z-10 flex items-center gap-4 rounded-xl bg-white/80 px-4 py-3 backdrop-blur-sm dark:bg-gray-900/80">
            <div className="rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-3 shadow-sm dark:from-gray-800 dark:to-gray-700">
              <ProviderIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                <HighlightedText text={provider} searchQuery={searchQuery} />
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {models.length} model{models.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-2 lg:grid-cols-2 lg:gap-8 xl:grid-cols-2">
            {models.map((model, modelIndex) => (
              <ModelCard
                key={model.id}
                model={model}
                isSelected={selectedModel === model.id}
                onClick={() => onModelSelect(model.id)}
                searchQuery={searchQuery}
                index={modelIndex}
                isAvailable={availableModels.some((available) => available.id === model.id)}
              />
            ))}
          </div>
        </div>
      </AnimatedWrapper>
    );
  }
);

ProviderSection.displayName = "ProviderSection";

"use client";

import { memo } from "react";

import { AIModel } from "@/types/chat";

import { ModelDialog } from "./model-dialog";
import { ModelDropdown } from "./model-dropdown";

interface ModelSelectorProps {
  availableModels: AIModel[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export const ModelSelector = memo<ModelSelectorProps>(({ availableModels, selectedModel, onModelChange }) => {
  return (
    <div className="flex items-center gap-3">
      <ModelDropdown availableModels={availableModels} selectedModel={selectedModel} onModelChange={onModelChange} />
      <ModelDialog availableModels={availableModels} selectedModel={selectedModel} onModelChange={onModelChange} />
    </div>
  );
});

ModelSelector.displayName = "ModelSelector";

export default ModelSelector;

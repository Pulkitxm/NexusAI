import type { AIModel } from "@/types/chat";
import type { IconType } from "react-icons";

export interface ModelSelectorProps {
  availableModels: AIModel[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export interface CapabilityConfig {
  icon: IconType;
  label: string;
  color: string;
  searchTerms: string[];
}

export interface SearchSuggestion {
  query: string;
  label: string;
  icon: IconType;
}

export interface ModelCardProps {
  model: AIModel;
  isSelected: boolean;
  onClick: () => void;
  searchQuery?: string;
  index: number;
  isAvailable: boolean;
  matchScore?: number;
}

export interface ProviderSectionProps {
  provider: string;
  models: AIModel[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  searchQuery: string;
  index: number;
  availableModels: AIModel[];
}

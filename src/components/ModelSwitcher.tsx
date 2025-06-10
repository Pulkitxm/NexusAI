"use client";
import React, { memo, useMemo, useState, useCallback } from "react";
import type { IconType } from "react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Settings2,
  Search,
  Brain,
  Image as ImageIcon,
  Eye,
  Search as SearchIcon,
  FileText,
  Zap,
  Bot,
  Star,
  X,
  Filter,
} from "lucide-react";
import type { AIModel } from "@/types/models";

interface ModelSelectorProps {
  availableModels: AIModel[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

interface CapabilityConfig {
  icon: IconType;
  label: string;
  color: string;
  searchTerms: string[];
}

const capabilityConfig: Record<string, CapabilityConfig> = {
  reasoning: {
    icon: Brain,
    label: "Reasoning",
    color: "text-violet-600 dark:text-violet-400",
    searchTerms: [
      "reasoning",
      "logic",
      "thinking",
      "analysis",
      "smart",
      "intelligent",
    ],
  },
  imageGeneration: {
    icon: ImageIcon,
    label: "Image Gen",
    color: "text-pink-600 dark:text-pink-400",
    searchTerms: [
      "image",
      "generation",
      "create",
      "draw",
      "art",
      "visual",
      "picture",
      "generate",
    ],
  },
  imageUpload: {
    icon: Eye,
    label: "Vision",
    color: "text-blue-600 dark:text-blue-400",
    searchTerms: [
      "vision",
      "see",
      "image",
      "photo",
      "visual",
      "upload",
      "analyze",
      "recognize",
    ],
  },
  search: {
    icon: SearchIcon,
    label: "Search",
    color: "text-emerald-600 dark:text-emerald-400",
    searchTerms: [
      "search",
      "web",
      "internet",
      "browse",
      "find",
      "lookup",
      "query",
    ],
  },
  pdfUpload: {
    icon: FileText,
    label: "PDF",
    color: "text-orange-600 dark:text-orange-400",
    searchTerms: ["pdf", "document", "file", "upload", "text", "read", "parse"],
  },
};

const AnimatedWrapper = memo<{
  children: React.ReactNode;
  show: boolean;
  delay?: number;
}>(({ children, show, delay = 0 }) => {
  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        show
          ? "opacity-100 translate-y-0 "
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
      style={{
        transitionDelay: show ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
});

AnimatedWrapper.displayName = "AnimatedWrapper";

const CapabilityBadges = memo<{
  capabilities: AIModel["capabilities"];
  size?: "sm" | "xs";
  searchQuery?: string;
}>(({ capabilities, size = "xs", searchQuery = "" }) => {
  const badges = useMemo(() => {
    return Object.entries(capabilities)
      .filter(([, value]) => value)
      .map(([key]) => {
        const config = capabilityConfig[key];
        if (!config) return null;

        const CapIcon = config.icon;
        const sizeClasses = size === "sm" ? "h-4 w-4" : "h-3 w-3";

        const isHighlighted =
          searchQuery &&
          (config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            config.searchTerms.some((term) =>
              term.toLowerCase().includes(searchQuery.toLowerCase()),
            ));

        return (
          <div
            key={key}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-300 ${
              isHighlighted
                ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-800"
                : "bg-gray-100 dark:bg-gray-800"
            } ${size === "sm" ? "text-sm" : "text-xs"} font-medium`}
          >
            <CapIcon
              className={`${sizeClasses} ${config.color} ${isHighlighted ? "animate-pulse" : ""}`}
            />
            <span className="text-gray-700 dark:text-gray-300">
              {config.label}
            </span>
          </div>
        );
      })
      .filter(Boolean);
  }, [capabilities, size, searchQuery]);

  return <div className="flex flex-wrap gap-2">{badges}</div>;
});

CapabilityBadges.displayName = "CapabilityBadges";

const ModelCard = memo<{
  model: AIModel;
  isSelected: boolean;
  onClick: () => void;
  searchQuery?: string;
  index: number;
}>(({ model, isSelected, onClick, searchQuery = "", index }) => {
  const ModelIcon = model.icon;

  const isNameHighlighted =
    searchQuery && model.name.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <AnimatedWrapper show={true} delay={index * 50}>
      <div
        className={`relative p-4 sm:p-5 rounded-xl border transition-all duration-300 cursor-pointer group transform ${
          isSelected
            ? "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-blue-200 dark:border-blue-700 shadow-lg ring-2 ring-blue-100 dark:ring-blue-900/50"
            : "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
        }`}
        onClick={onClick}
      >
        {isSelected && (
          <div className="absolute -top-2 -right-2 p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg animate-bounce">
            <Star className="h-3 w-3 text-white fill-current" />
          </div>
        )}

        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isSelected
                ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
            }`}
          >
            <ModelIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate transition-all duration-300 ${
                  isNameHighlighted ? "text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                {model.name}
              </span>
              <Badge
                variant="outline"
                className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex-shrink-0"
              >
                {model.category}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed line-clamp-2">
              {model.description}
            </p>

            <CapabilityBadges
              capabilities={model.capabilities}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
});

ModelCard.displayName = "ModelCard";

const ModelSelectItem = memo<{
  model: AIModel;
  searchQuery?: string;
}>(({ model, searchQuery = "" }) => {
  const ModelIcon = model.icon;

  const capabilityIcons = useMemo(() => {
    return Object.entries(model.capabilities)
      .filter(([, value]) => value)
      .map(([key]) => {
        const config = capabilityConfig[key];
        if (!config) return null;

        const CapIcon = config.icon;
        const isHighlighted =
          searchQuery &&
          (config.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            config.searchTerms.some((term) =>
              term.toLowerCase().includes(searchQuery.toLowerCase()),
            ));

        return (
          <CapIcon
            key={key}
            className={`h-3 w-3 transition-all duration-300 ${config.color} ${isHighlighted ? "animate-pulse" : ""}`}
            title={config.label}
          />
        );
      })
      .filter(Boolean);
  }, [model.capabilities, searchQuery]);

  const isNameHighlighted =
    searchQuery && model.name.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <SelectItem
      value={model.id}
      className="py-3 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0">
          <ModelIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-sm font-medium truncate transition-all duration-300 ${
                isNameHighlighted
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {model.name}
            </span>
            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0 flex-shrink-0"
            >
              {model.category}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">{capabilityIcons}</div>
        </div>
      </div>
    </SelectItem>
  );
});

ModelSelectItem.displayName = "ModelSelectItem";

const ProviderSection = memo<{
  provider: string;
  models: AIModel[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  searchQuery: string;
  index: number;
}>(({ provider, models, selectedModel, onModelSelect, searchQuery, index }) => {
  return (
    <AnimatedWrapper show={true} delay={index * 100}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10 rounded-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              {provider}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {models.length} model{models.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
          {models.map((model, modelIndex) => (
            <ModelCard
              key={model.id}
              model={model}
              isSelected={selectedModel === model.id}
              onClick={() => onModelSelect(model.id)}
              searchQuery={searchQuery}
              index={modelIndex}
            />
          ))}
        </div>
      </div>
    </AnimatedWrapper>
  );
});

ProviderSection.displayName = "ProviderSection";

export const ModelSelector = memo<ModelSelectorProps>(
  ({ availableModels, selectedModel, onModelChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownSearch, setDropdownSearch] = useState("");

    const groupedByProvider = useMemo(() => {
      return availableModels.reduce(
        (acc, model) => {
          if (!acc[model.provider]) {
            acc[model.provider] = [];
          }
          acc[model.provider].push(model);
          return acc;
        },
        {} as Record<string, AIModel[]>,
      );
    }, [availableModels]);

    const filterModels = useCallback((models: AIModel[], query: string) => {
      if (!query.trim()) return models;
      const lowerQuery = query.toLowerCase();

      return models.filter((model) => {
        const basicMatch =
          model.name.toLowerCase().includes(lowerQuery) ||
          model.provider.toLowerCase().includes(lowerQuery) ||
          model.description.toLowerCase().includes(lowerQuery) ||
          model.category.toLowerCase().includes(lowerQuery);

        const capabilityMatch = Object.entries(model.capabilities).some(
          ([key, value]) => {
            if (!value) return false;
            const config = capabilityConfig[key];
            if (!config) return false;

            return (
              config.label.toLowerCase().includes(lowerQuery) ||
              config.searchTerms.some((term) =>
                term.toLowerCase().includes(lowerQuery),
              )
            );
          },
        );

        return basicMatch || capabilityMatch;
      });
    }, []);

    const filteredModelsForModal = useMemo(
      () => filterModels(availableModels, searchQuery),
      [availableModels, searchQuery, filterModels],
    );

    const filteredGroupedByProvider = useMemo(() => {
      return Object.entries(groupedByProvider).reduce(
        (acc, [provider, models]) => {
          const filtered = filterModels(models, dropdownSearch);
          if (filtered.length > 0) {
            acc[provider] = filtered;
          }
          return acc;
        },
        {} as Record<string, AIModel[]>,
      );
    }, [groupedByProvider, dropdownSearch, filterModels]);

    const selectedModelData = useMemo(
      () => availableModels.find((m) => m.id === selectedModel),
      [availableModels, selectedModel],
    );

    const groupedFilteredForModal = useMemo(() => {
      return filteredModelsForModal.reduce(
        (acc, model) => {
          if (!acc[model.provider]) {
            acc[model.provider] = [];
          }
          acc[model.provider].push(model);
          return acc;
        },
        {} as Record<string, AIModel[]>,
      );
    }, [filteredModelsForModal]);

    const handleModelSelect = useCallback(
      (modelId: string) => {
        onModelChange(modelId);
        setIsModalOpen(false);
      },
      [onModelChange],
    );

    const clearSearchQuery = useCallback(() => setSearchQuery(""), []);
    const clearDropdownSearch = useCallback(() => setDropdownSearch(""), []);

    const SelectedIcon = selectedModelData?.icon;

    return (
      <div className="flex items-center gap-2">
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-[180px] sm:w-[220px] lg:w-[260px] h-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
            <SelectValue placeholder="Select AI Model">
              {selectedModelData && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-sm">
                    {SelectedIcon && (
                      <SelectedIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    )}
                  </div>
                  <span className="truncate font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                    {selectedModelData.name}
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>

          <SelectContent className="w-[300px] sm:w-[340px] max-h-[500px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search models, capabilities..."
                  value={dropdownSearch}
                  onChange={(e) => setDropdownSearch(e.target.value)}
                  className="pl-10 pr-10 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                {dropdownSearch && (
                  <button
                    onClick={clearDropdownSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {Object.keys(filteredGroupedByProvider).length === 0 ? (
                <AnimatedWrapper show={true}>
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No models found
                  </div>
                </AnimatedWrapper>
              ) : (
                Object.entries(filteredGroupedByProvider).map(
                  ([provider, models]) => (
                    <div key={provider}>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">
                        <Zap className="h-3 w-3" />
                        <span>{provider}</span>
                      </div>

                      {models.map((model) => (
                        <ModelSelectItem
                          key={model.id}
                          model={model}
                          searchQuery={dropdownSearch}
                        />
                      ))}
                    </div>
                  ),
                )
              )}
            </div>
          </SelectContent>
        </Select>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 px-2 sm:px-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200"
            >
              <Settings2 className="h-4 w-4 sm:mr-2" />
              <span className="text-sm font-medium hidden sm:inline">
                All Models
              </span>
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <DialogHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 sm:pb-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl font-semibold">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-gray-900 dark:text-gray-100">
                    AI Models
                  </span>
                </DialogTitle>

                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search models, capabilities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearchQuery}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-4 sm:py-6 min-h-0">
              {Object.keys(groupedFilteredForModal).length === 0 ? (
                <AnimatedWrapper show={true}>
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      No models found matching your search.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 px-4">
                      Try searching by model name, provider, or capabilities
                      like &quot;vision&quot;, &quot;reasoning&quot;,
                      &quot;image generation&quot;
                    </p>
                  </div>
                </AnimatedWrapper>
              ) : (
                <div className="space-y-6 sm:space-y-8 px-1">
                  {Object.entries(groupedFilteredForModal).map(
                    ([provider, models], index) => (
                      <ProviderSection
                        key={provider}
                        provider={provider}
                        models={models}
                        selectedModel={selectedModel}
                        onModelSelect={handleModelSelect}
                        searchQuery={searchQuery}
                        index={index}
                      />
                    ),
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);

ModelSelector.displayName = "ModelSelector";

export default ModelSelector;

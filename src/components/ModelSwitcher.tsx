"use client";
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
  Filter
} from "lucide-react";
import React, { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AI_MODELS } from "@/lib/models";

import type { AIModel } from "@/types/models";
import type { IconType } from "react-icons";

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
    searchTerms: ["reasoning", "logic", "thinking", "analysis", "smart", "intelligent"]
  },
  imageGeneration: {
    icon: ImageIcon,
    label: "Image Gen",
    color: "text-pink-600 dark:text-pink-400",
    searchTerms: ["image", "generation", "create", "draw", "art", "visual", "picture", "generate"]
  },
  imageUpload: {
    icon: Eye,
    label: "Vision",
    color: "text-blue-600 dark:text-blue-400",
    searchTerms: ["vision", "see", "image", "photo", "visual", "upload", "analyze", "recognize"]
  },
  search: {
    icon: SearchIcon,
    label: "Search",
    color: "text-emerald-600 dark:text-emerald-400",
    searchTerms: ["search", "web", "internet", "browse", "find", "lookup", "query"]
  },
  pdfUpload: {
    icon: FileText,
    label: "PDF",
    color: "text-orange-600 dark:text-orange-400",
    searchTerms: ["pdf", "document", "file", "upload", "text", "read", "parse"]
  }
};

const AnimatedWrapper = memo<{
  children: React.ReactNode;
  show: boolean;
  delay?: number;
}>(({ children, show, delay = 0 }) => {
  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
      }`}
      style={{
        transitionDelay: show ? `${delay}ms` : "0ms"
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
            config.searchTerms.some((term) => term.toLowerCase().includes(searchQuery.toLowerCase())));

        return (
          <div
            key={key}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all duration-300 ${
              isHighlighted
                ? "bg-blue-100 ring-2 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-800"
                : "bg-gray-100 dark:bg-gray-800"
            } ${size === "sm" ? "text-sm" : "text-xs"} font-medium`}
          >
            <CapIcon className={`${sizeClasses} ${config.color} ${isHighlighted ? "animate-pulse" : ""}`} />
            <span className="text-gray-700 dark:text-gray-300">{config.label}</span>
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
  isAvailable: boolean;
}>(({ model, isSelected, onClick, searchQuery = "", index, isAvailable }) => {
  const ModelIcon = model.icon;

  const isNameHighlighted = searchQuery && model.name.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <AnimatedWrapper show={true} delay={index * 50}>
      <div
        className={`group relative transform cursor-pointer rounded-xl border p-4 transition-all duration-300 sm:p-5 ${
          isSelected
            ? "border-blue-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-lg ring-2 ring-blue-100 dark:border-blue-700 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 dark:ring-blue-900/50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 dark:hover:bg-gray-800"
        } ${isAvailable ? "" : "cursor-not-allowed select-none opacity-50"}`}
        onClick={isAvailable ? onClick : undefined}
      >
        {isSelected && (
          <div className="absolute -right-2 -top-2 animate-bounce rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 shadow-lg">
            <Star className="h-3 w-3 fill-current text-white" />
          </div>
        )}

        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:h-12 sm:w-12 ${
              isSelected
                ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-600"
            }`}
          >
            <ModelIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`truncate text-sm font-semibold text-gray-900 transition-all duration-300 dark:text-gray-100 sm:text-base ${
                  isNameHighlighted ? "text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                {model.name}
              </span>
              <Badge
                variant="outline"
                className="flex-shrink-0 border-gray-200 bg-gray-50 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
              >
                {model.category}
              </Badge>
            </div>

            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300 sm:text-sm">
              {model.description}
            </p>

            <CapabilityBadges capabilities={model.capabilities} searchQuery={searchQuery} />
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
            config.searchTerms.some((term) => term.toLowerCase().includes(searchQuery.toLowerCase())));

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

  const isNameHighlighted = searchQuery && model.name.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <SelectItem
      value={model.id}
      className="cursor-pointer px-3 py-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <div className="flex w-full items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
          <ModelIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`truncate text-sm font-medium transition-all duration-300 ${
                isNameHighlighted ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {model.name}
            </span>
            <Badge
              variant="secondary"
              className="flex-shrink-0 border-0 bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
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
  isAvailable: boolean;
}>(({ provider, models, selectedModel, onModelSelect, searchQuery, index, isAvailable }) => {
  return (
    <AnimatedWrapper show={true} delay={index * 100}>
      <div className="space-y-4">
        <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg bg-white py-2 dark:bg-gray-900">
          <div className="rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-2 dark:from-gray-800 dark:to-gray-700">
            <Zap className="h-4 w-4 text-gray-600 dark:text-gray-300 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">{provider}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              {models.length} model{models.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-2">
          {models.map((model, modelIndex) => (
            <ModelCard
              key={model.id}
              model={model}
              isSelected={selectedModel === model.id}
              onClick={() => onModelSelect(model.id)}
              searchQuery={searchQuery}
              index={modelIndex}
              isAvailable={isAvailable}
            />
          ))}
        </div>
      </div>
    </AnimatedWrapper>
  );
});

ProviderSection.displayName = "ProviderSection";

export const ModelSelector = memo<ModelSelectorProps>(({ availableModels, selectedModel, onModelChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownSearch, setDropdownSearch] = useState("");
  const dropdownSearchRef = useRef<HTMLInputElement>(null);
  const modalSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modalSearchRef.current && isModalOpen) {
      modalSearchRef.current.focus();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isDropdownOpen) {
      const timer = setTimeout(() => {
        if (dropdownSearchRef.current) {
          dropdownSearchRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isDropdownOpen]);

  const groupedByProvider = useMemo(() => {
    const emptyRecord: Record<string, AIModel[]> = {};
    return availableModels.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, emptyRecord);
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

      const capabilityMatch = Object.entries(model.capabilities).some(([key, value]) => {
        if (!value) return false;
        const config = capabilityConfig[key];
        if (!config) return false;

        return (
          config.label.toLowerCase().includes(lowerQuery) ||
          config.searchTerms.some((term) => term.toLowerCase().includes(lowerQuery))
        );
      });

      return basicMatch || capabilityMatch;
    });
  }, []);

  const filteredGroupedByProvider = useMemo(() => {
    const emptyRecord: Record<string, AIModel[]> = {};
    return Object.entries(groupedByProvider).reduce((acc, [provider, models]) => {
      const filtered = filterModels(models, dropdownSearch);
      if (filtered.length > 0) {
        acc[provider] = filtered;
      }
      return acc;
    }, emptyRecord);
  }, [groupedByProvider, dropdownSearch, filterModels]);

  const selectedModelData = useMemo(
    () => availableModels.find((m) => m.id === selectedModel),
    [availableModels, selectedModel]
  );

  const groupedFilteredForModal = useMemo(() => {
    const emptyRecord: Record<string, AIModel[]> = {};
    return AI_MODELS.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, emptyRecord);
  }, []);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      onModelChange(modelId);
      setIsModalOpen(false);
    },
    [onModelChange]
  );

  const clearSearchQuery = useCallback(() => setSearchQuery(""), []);
  const clearDropdownSearch = useCallback(() => setDropdownSearch(""), []);

  const SelectedIcon = selectedModelData?.icon;

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedModel} onValueChange={onModelChange} onOpenChange={setIsDropdownOpen}>
        <SelectTrigger className="h-10 w-[180px] rounded-lg border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 sm:w-[220px] lg:w-[260px]">
          <SelectValue placeholder="Select AI Model">
            {selectedModelData && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-sm sm:h-6 sm:w-6">
                  {SelectedIcon && <SelectedIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                </div>
                <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100 sm:text-base">
                  {selectedModelData.name}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent className="max-h-[500px] w-[300px] border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:w-[340px]">
          <div className="border-b border-gray-100 p-3 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search models, capabilities..."
                value={dropdownSearch}
                ref={dropdownSearchRef}
                onChange={(e) => setDropdownSearch(e.target.value)}
                className="h-9 border-gray-200 bg-gray-50 pl-10 pr-10 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              />
              {dropdownSearch && (
                <button
                  onClick={clearDropdownSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300"
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
                  <Filter className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  No models found
                </div>
              </AnimatedWrapper>
            ) : (
              Object.entries(filteredGroupedByProvider).map(([provider, models]) => (
                <div key={provider}>
                  <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    <Zap className="h-3 w-3" />
                    <span>{provider}</span>
                  </div>

                  {models.map((model) => (
                    <ModelSelectItem key={model.id} model={model} searchQuery={dropdownSearch} />
                  ))}
                </div>
              ))
            )}
          </div>
        </SelectContent>
      </Select>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-2 transition-all duration-200 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 sm:px-3"
          >
            <Settings2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden text-sm font-medium sm:inline">All Models</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="flex h-[90vh] w-[95vw] max-w-6xl flex-col border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <DialogHeader className="flex-shrink-0 border-b border-gray-100 pb-4 dark:border-gray-800 sm:pb-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <DialogTitle className="flex items-center gap-3 text-lg font-semibold sm:text-xl">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-2 text-white shadow-lg sm:p-2.5">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">AI Models</span>
              </DialogTitle>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search models, capabilities..."
                  value={searchQuery}
                  ref={modalSearchRef}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 border-gray-200 bg-gray-50 pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-blue-400"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearchQuery}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto py-4 sm:py-6">
            {Object.keys(groupedFilteredForModal).length === 0 ? (
              <AnimatedWrapper show={true}>
                <div className="py-12 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="mb-2 text-gray-500 dark:text-gray-400">No models found matching your search.</p>
                  <p className="px-4 text-sm text-gray-400 dark:text-gray-500">
                    Try searching by model name, provider, or capabilities like &quot;vision&quot;,
                    &quot;reasoning&quot;, &quot;image generation&quot;
                  </p>
                </div>
              </AnimatedWrapper>
            ) : (
              <div className="space-y-6 px-1 sm:space-y-8">
                {Object.entries(groupedFilteredForModal).map(([provider, models], index) => (
                  <ProviderSection
                    key={provider}
                    provider={provider}
                    models={models}
                    selectedModel={selectedModel}
                    onModelSelect={handleModelSelect}
                    searchQuery={searchQuery}
                    index={index}
                    isAvailable={availableModels.some((model) => model.provider === provider)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

ModelSelector.displayName = "ModelSelector";

export default ModelSelector;

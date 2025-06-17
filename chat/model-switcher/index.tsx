"use client";
import {
  Settings2,
  Search,
  Brain,
  ImageIcon,
  Eye,
  SearchIcon,
  FileText,
  Zap,
  Bot,
  Star,
  X,
  Filter,
  TrendingUp,
  Sparkles,
  ChevronDown,
  Check
} from "lucide-react";
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AI_MODELS, getProviderIcon } from "@/data/models";
import { useSettingsModal } from "@/providers/use-settings";

import type { AIModel, Capabilities } from "@/types/chat";
import type { Provider } from "@/types/provider";
import type React from "react";
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
    searchTerms: ["reasoning", "logic", "thinking", "analysis", "smart", "intelligent", "brain", "cognitive"]
  },
  attachment: {
    icon: FileText,
    label: "Files",
    color: "text-orange-600 dark:text-orange-400",
    searchTerms: ["attachment", "file", "upload", "document", "pdf", "image", "vision"]
  },
  search: {
    icon: SearchIcon,
    label: "Search",
    color: "text-emerald-600 dark:text-emerald-400",
    searchTerms: ["search", "web", "internet", "browse", "find", "lookup", "query", "google", "bing"]
  }
};

const searchSuggestions = [
  { query: "reasoning", label: "Reasoning Models", icon: Brain },
  { query: "image generation", label: "Image Creation", icon: ImageIcon },
  { query: "vision", label: "Vision Models", icon: Eye },
  { query: "available", label: "Available Models", icon: TrendingUp },
  { query: "gpt", label: "GPT Models", icon: Sparkles },
  { query: "claude", label: "Claude Models", icon: Bot }
];

const AnimatedWrapper = memo<{
  children: React.ReactNode;
  show: boolean;
  delay?: number;
}>(({ children, show, delay = 0 }) => {
  return (
    <div
      className={`transition-all duration-300 ease-out ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
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

const SearchSuggestions = memo<{
  suggestions: typeof searchSuggestions;
  onSuggestionClick: (query: string) => void;
  currentQuery: string;
}>(({ suggestions, onSuggestionClick, currentQuery }) => {
  if (currentQuery.trim()) return null;

  return (
    <div className="border-b border-gray-100 p-3 dark:border-gray-800">
      <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Quick searches</div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => {
          const SuggestionIcon = suggestion.icon;
          return (
            <button
              key={suggestion.query}
              onClick={() => onSuggestionClick(suggestion.query)}
              className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <SuggestionIcon className="h-3 w-3" />
              {suggestion.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

SearchSuggestions.displayName = "SearchSuggestions";

const HighlightedText = memo<{
  text: string;
  searchQuery: string;
  className?: string;
}>(({ text, searchQuery, className = "" }) => {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="rounded bg-yellow-200 px-0.5 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-300"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
});

HighlightedText.displayName = "HighlightedText";

const CapabilityBadges = memo<{
  capabilities?: Capabilities;
  size?: "sm" | "xs" | "lg";
  showIcons?: boolean;
  searchQuery?: string;
}>(({ capabilities, size = "sm", showIcons = true, searchQuery = "" }) => {
  if (!capabilities) return null;

  const activeCapabilities = Object.entries(capabilities)
    .filter(([, isActive]) => isActive)
    .map(([key]) => key)
    .filter((key) => capabilityConfig[key]);

  if (activeCapabilities.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {activeCapabilities.map((capability) => {
        const config = capabilityConfig[capability];
        const CapabilityIcon = config.icon;
        const isHighlighted =
          searchQuery &&
          config.searchTerms.some(
            (term) =>
              term.toLowerCase().includes(searchQuery.toLowerCase()) ||
              searchQuery.toLowerCase().includes(term.toLowerCase()) ||
              config.label.toLowerCase().includes(searchQuery.toLowerCase())
          );

        return (
          <Badge
            key={capability}
            variant="secondary"
            className={`flex items-center gap-1 transition-all duration-200 ${
              size === "xs" ? "px-1.5 py-0.5 text-xs" : size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs"
            } ${
              isHighlighted
                ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:ring-yellow-700"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {showIcons && (
              <CapabilityIcon
                className={`${size === "xs" ? "h-2.5 w-2.5" : size === "lg" ? "h-4 w-4" : "h-3 w-3"} ${config.color}`}
              />
            )}
            <span className="font-medium">
              <HighlightedText text={config.label} searchQuery={searchQuery} />
            </span>
          </Badge>
        );
      })}
    </div>
  );
});

CapabilityBadges.displayName = "CapabilityBadges";

const CustomDropdown = memo<{
  availableModels: AIModel[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}>(({ availableModels, selectedModel, onModelChange }) => {
  const { openModal } = useSettingsModal();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedModelData = availableModels.find((m) => m.id === selectedModel);
  const SelectedIcon = selectedModelData?.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return availableModels;

    return availableModels.filter((model) => {
      const query = searchQuery.toLowerCase();
      return (
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query) ||
        (model.capabilities &&
          Object.entries(model.capabilities).some(([key, value]) => {
            if (!value) return false;
            const config = capabilityConfig[key];
            return (
              config &&
              (config.label.toLowerCase().includes(query) ||
                config.searchTerms.some((term) => term.toLowerCase().includes(query)))
            );
          }))
      );
    });
  }, [availableModels, searchQuery]);

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-[180px] items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm transition-all duration-200 hover:bg-gray-50 sm:w-[220px] lg:w-[260px] dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
      >
        {selectedModelData ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 via-purple-500 to-pink-500 text-white shadow-sm sm:h-6 sm:w-6">
              {SelectedIcon && <SelectedIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <span className="truncate text-sm font-medium text-gray-900 sm:text-base dark:text-gray-100">
                {selectedModelData.name}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Select AI Model</span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-[320px] rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 p-3 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                ref={searchRef}
                placeholder="Search models, capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 border-gray-200 bg-gray-50 pr-10 pl-10 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {filteredModels.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <Filter className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="font-medium">No models found</p>
                {availableModels.length === 0 ? (
                  <p className="mt-1 text-xs">
                    <Button
                      variant="link"
                      onClick={() => openModal()}
                      className="cursor-pointer text-xs text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Add API key
                    </Button>
                  </p>
                ) : (
                  <p className="mt-1 text-xs">Try different keywords</p>
                )}
              </div>
            ) : (
              filteredModels.map((model) => {
                const ModelIcon = model.icon;
                const isSelected = model.id === selectedModel;

                return (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={`w-full px-3 py-3 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      isSelected ? "bg-purple-50 dark:bg-purple-950/30" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                            : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"
                        }`}
                      >
                        <ModelIcon
                          className={`h-4 w-4 ${isSelected ? "text-white" : "text-gray-600 dark:text-gray-300"}`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <HighlightedText
                            text={model.name}
                            searchQuery={searchQuery}
                            className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                          />
                          {isSelected && <Check className="h-4 w-4 text-purple-600" />}
                        </div>
                        <CapabilityBadges
                          capabilities={model.capabilities}
                          size="xs"
                          showIcons={true}
                          searchQuery={searchQuery}
                        />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

CustomDropdown.displayName = "CustomDropdown";

const ModelCard = memo<{
  model: AIModel;
  isSelected: boolean;
  onClick: () => void;
  searchQuery?: string;
  index: number;
  isAvailable: boolean;
  matchScore?: number;
}>(({ model, isSelected, onClick, searchQuery = "", index, isAvailable, matchScore = 0 }) => {
  const ModelIcon = model.icon;

  return (
    <AnimatedWrapper show={true} delay={index * 30}>
      <div
        className={`group relative transform ${isAvailable ? "cursor-pointer" : ""} rounded-xl border p-4 transition-all duration-200 sm:p-5 ${
          isSelected
            ? "border-purple-200 bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 shadow-lg ring-2 ring-purple-100 dark:border-purple-700 dark:from-purple-950/30 dark:via-purple-950/30 dark:to-pink-950/30 dark:ring-purple-900/50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 dark:hover:bg-gray-800"
        } ${isAvailable ? "" : "cursor-not-allowed opacity-50 select-none"} ${
          matchScore > 0.8 ? "ring-2 ring-purple-200 dark:ring-purple-800" : ""
        }`}
        onClick={isAvailable ? onClick : undefined}
      >
        {isSelected && (
          <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 p-1.5 shadow-lg">
            <Star className="h-3 w-3 fill-current text-white" />
          </div>
        )}

        {matchScore > 0.8 && searchQuery && (
          <div className="absolute -top-2 -left-2 rounded-full bg-purple-500 p-1.5 shadow-lg">
            <TrendingUp className="h-3 w-3 text-white" />
          </div>
        )}

        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 sm:h-14 sm:w-14 ${
              isSelected
                ? "bg-gradient-to-br from-purple-500 via-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-600"
            }`}
          >
            <ModelIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <HighlightedText
                text={model.name}
                searchQuery={searchQuery}
                className="truncate text-sm font-semibold text-gray-900 transition-all duration-200 sm:text-base dark:text-gray-100"
              />
            </div>

            <HighlightedText
              text={model.description}
              searchQuery={searchQuery}
              className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-600 sm:text-sm dark:text-gray-300"
            />

            <CapabilityBadges capabilities={model.capabilities} size="lg" showIcons={true} searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  );
});

ModelCard.displayName = "ModelCard";

const ProviderSection = memo<{
  provider: string;
  models: AIModel[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  searchQuery: string;
  index: number;
  availableModels: AIModel[];
}>(({ provider, models, selectedModel, onModelSelect, searchQuery, index, availableModels }) => {
  const ProviderIcon = getProviderIcon(provider as Provider) || Zap;

  return (
    <AnimatedWrapper show={true} delay={index * 50}>
      <div className="space-y-4">
        <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg bg-white py-2 dark:bg-gray-900">
          <div className="rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-2 dark:from-gray-800 dark:to-gray-700">
            <ProviderIcon className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5 dark:text-gray-300" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
              <HighlightedText text={provider} searchQuery={searchQuery} />
            </h3>
            <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              {models.length} model{models.length !== 1 ? "s" : ""}
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
              isAvailable={availableModels.some((available) => available.id === model.id)}
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
  const [searchQuery, setSearchQuery] = useState("");
  const modalSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modalSearchRef.current && isModalOpen) {
      modalSearchRef.current.focus();
    }
  }, [isModalOpen]);

  const groupedByProvider = useMemo(() => {
    const emptyRecord: Record<string, AIModel[]> = {};
    return AI_MODELS.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, emptyRecord);
  }, []);

  const calculateMatchScore = useCallback(
    (model: AIModel, query: string): number => {
      if (!query.trim()) return 0;

      const lowerQuery = query.toLowerCase();
      let score = 0;

      if (model.name.toLowerCase() === lowerQuery) score += 1.0;
      else if (model.name.toLowerCase().includes(lowerQuery)) score += 0.8;

      if (model.provider.toLowerCase().includes(lowerQuery)) score += 0.6;

      if (model.description.toLowerCase().includes(lowerQuery)) score += 0.4;

      if (model.capabilities)
        Object.entries(model.capabilities).forEach(([key, value]) => {
          if (!value) return;
          const config = capabilityConfig[key];
          if (!config) return;

          if (config.label.toLowerCase().includes(lowerQuery)) score += 0.7;
          config.searchTerms.forEach((term) => {
            if (term.toLowerCase().includes(lowerQuery) || lowerQuery.includes(term.toLowerCase())) {
              score += 0.3;
            }
          });
        });

      const isAvailable = availableModels.some((m) => m.id === model.id);
      if (lowerQuery === "available" && isAvailable) score += 0.9;
      if (lowerQuery === "unavailable" && !isAvailable) score += 0.9;

      return Math.min(score, 1.0);
    },
    [availableModels]
  );

  const filterModels = useCallback(
    (models: AIModel[], query: string) => {
      if (!query.trim()) return models;

      return models
        .map((model) => ({
          model,
          score: calculateMatchScore(model, query)
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ model }) => model);
    },
    [calculateMatchScore]
  );

  const groupedFilteredForModal = useMemo(() => {
    const emptyRecord: Record<string, AIModel[]> = {};
    return Object.entries(groupedByProvider).reduce((acc, [provider, models]) => {
      const filtered = filterModels(models, searchQuery);
      if (filtered.length > 0) {
        acc[provider] = filtered;
      }
      return acc;
    }, emptyRecord);
  }, [groupedByProvider, searchQuery, filterModels]);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      onModelChange(modelId);
      setIsModalOpen(false);
    },
    [onModelChange]
  );

  const handleModalSuggestionClick = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearchQuery = useCallback(() => setSearchQuery(""), []);

  const totalResults = useMemo(() => {
    return Object.values(groupedFilteredForModal).reduce((sum, models) => sum + models.length, 0);
  }, [groupedFilteredForModal]);

  return (
    <div className="flex items-center gap-2">
      <CustomDropdown availableModels={availableModels} selectedModel={selectedModel} onModelChange={onModelChange} />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-2 transition-all duration-200 hover:bg-gray-100 sm:px-3 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Settings2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden text-sm font-medium sm:inline">All Models</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="flex h-[90vh] w-[95vw] max-w-6xl flex-col border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <DialogHeader className="mt-10 flex-shrink-0 border-b border-gray-100 pb-4 sm:pb-6 dark:border-gray-800">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <DialogTitle className="flex items-center gap-3 text-lg font-semibold sm:text-xl">
                <div className="rounded-xl bg-gradient-to-br from-purple-500 via-purple-500 to-pink-500 p-2 text-white shadow-lg sm:p-2.5">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="text-gray-900 dark:text-gray-100">AI Models</span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    {totalResults} result{totalResults !== 1 ? "s" : ""}
                  </Badge>
                )}
              </DialogTitle>

              <div className="relative w-full sm:w-80">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search models, capabilities, availability..."
                  value={searchQuery}
                  ref={modalSearchRef}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 border-gray-200 bg-gray-50 pr-10 pl-10 transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearchQuery}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </DialogHeader>

          <SearchSuggestions
            suggestions={searchSuggestions}
            onSuggestionClick={handleModalSuggestionClick}
            currentQuery={searchQuery}
          />

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-4 sm:py-6">
            {Object.keys(groupedFilteredForModal).length === 0 ? (
              <AnimatedWrapper show={true}>
                <div className="py-12 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">No models found</p>
                  <p className="mb-4 px-4 text-sm text-gray-400 dark:text-gray-500">
                    Try searching by model name, provider, capabilities, or availability status
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {searchSuggestions.slice(0, 3).map((suggestion) => (
                      <button
                        key={suggestion.query}
                        onClick={() => handleModalSuggestionClick(suggestion.query)}
                        className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <suggestion.icon className="h-4 w-4" />
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
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
                    availableModels={availableModels}
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

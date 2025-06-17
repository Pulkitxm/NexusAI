"use client";

import { Settings2, Search, X, Bot } from "lucide-react";
import { memo, useState, useRef, useEffect, useMemo, useCallback } from "react";

import { AnimatedWrapper } from "@/components/ui/animated-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AI_MODELS } from "@/data/models";
import { filterModels } from "@/lib/ai-helper/moderl-seach";
import { useModel } from "@/providers/use-model";

import { SEARCH_SUGGESTIONS } from "./constants";
import { ProviderSection } from "./provider-section";
import { SearchSuggestions } from "./search-suggestions";

import type { AIModel } from "@/types/chat";

interface ModelDialogProps {
  availableModels: AIModel[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export const ModelDialog = memo<ModelDialogProps>(({ availableModels, selectedModel, onModelChange }) => {
  const { isModalOpen, setIsModalOpen } = useModel();
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

  const groupedFilteredForModal = useMemo(() => {
    const emptyRecord: Record<string, AIModel[]> = {};
    return Object.entries(groupedByProvider).reduce((acc, [provider, models]) => {
      const filtered = filterModels(models, searchQuery, availableModels);
      if (filtered.length > 0) {
        acc[provider] = filtered;
      }
      return acc;
    }, emptyRecord);
  }, [groupedByProvider, searchQuery, availableModels]);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      onModelChange(modelId);
      setIsModalOpen(false);
    },
    [onModelChange, setIsModalOpen]
  );

  const handleModalSuggestionClick = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearchQuery = useCallback(() => setSearchQuery(""), []);

  const totalResults = useMemo(() => {
    return Object.values(groupedFilteredForModal).reduce((sum, models) => sum + models.length, 0);
  }, [groupedFilteredForModal]);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-11 rounded-xl border">
          <Settings2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden text-sm font-medium sm:inline">All Models</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] w-[98vw] max-w-4xl flex-col overflow-hidden border-slate-200 bg-slate-50 sm:max-w-2xl lg:max-w-4xl dark:border-slate-700 dark:bg-slate-900">
        <DialogHeader className="mt-10 flex-shrink-0 border-b border-gray-100 pb-6 dark:border-gray-800">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 via-purple-500 to-pink-500 p-2.5 text-white shadow-lg">
                <Bot className="h-5 w-5" />
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
                className="h-11 border-gray-200 bg-gray-50 pr-10 pl-10 transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
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
          suggestions={SEARCH_SUGGESTIONS}
          onSuggestionClick={handleModalSuggestionClick}
          currentQuery={searchQuery}
        />

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-6">
          {Object.keys(groupedFilteredForModal).length === 0 ? (
            <AnimatedWrapper show={true}>
              <div className="py-12 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mb-2 text-lg font-medium text-gray-500 dark:text-gray-400">No models found</p>
                <p className="mb-6 px-4 text-sm text-gray-400 dark:text-gray-500">
                  Try searching by model name, provider, capabilities, or availability status
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SEARCH_SUGGESTIONS.slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion.query}
                      onClick={() => handleModalSuggestionClick(suggestion.query)}
                      className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:scale-105 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <suggestion.icon className="h-4 w-4" />
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            </AnimatedWrapper>
          ) : (
            <div className="space-y-8 px-1">
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
  );
});

ModelDialog.displayName = "ModelDialog";

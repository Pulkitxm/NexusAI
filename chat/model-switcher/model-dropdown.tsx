"use client";

import { ChevronDown, Search, X, Filter, Check } from "lucide-react";
import { memo, useState, useRef, useEffect, useMemo, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { HighlightedText } from "@/components/ui/highlighted-text";
import { Input } from "@/components/ui/input";
import { filterModels } from "@/lib/ai-helper/moderl-seach";
import { useSettingsModal } from "@/providers/use-settings";

import { CapabilityBadges } from "./capability-badges";

import type { AIModel } from "@/types/chat";

interface ModelDropdownProps {
  availableModels: AIModel[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export const ModelDropdown = memo<ModelDropdownProps>(({ availableModels, selectedModel, onModelChange }) => {
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
    return filterModels(availableModels, searchQuery, availableModels);
  }, [availableModels, searchQuery]);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      onModelChange(modelId);
      setIsOpen(false);
      setSearchQuery("");
    },
    [onModelChange]
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-[200px] cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md sm:w-[240px] lg:w-[280px] dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
      >
        {selectedModelData ? (
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-purple-500 to-pink-500 text-white shadow-sm">
              {SelectedIcon && <SelectedIcon className="h-3.5 w-3.5" />}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
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
        <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-[360px] rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 p-4 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                ref={searchRef}
                placeholder="Search models, capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 border-gray-200 bg-gray-50 pr-10 pl-10 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {filteredModels.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <Filter className="mx-auto mb-3 h-8 w-8 opacity-50" />
                <p className="font-medium">No models found</p>
                {availableModels.length === 0 ? (
                  <p className="mt-2 text-xs">
                    <Button
                      variant="link"
                      onClick={() => openModal()}
                      className="text-xs text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Add API key
                    </Button>
                  </p>
                ) : (
                  <p className="mt-2 text-xs">Try different keywords</p>
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
                    className={`w-full px-4 py-3 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
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

ModelDropdown.displayName = "ModelDropdown";

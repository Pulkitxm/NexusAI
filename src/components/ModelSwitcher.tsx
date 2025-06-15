"use client"
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
} from "lucide-react"
import { memo, useMemo, useState, useCallback, useRef, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AI_MODELS } from "@/lib/models"
import { useKeys } from "@/providers/key-provider"
import { useSettingsModal } from "@/providers/settings-modal-provider"

import type { AIModel } from "@/types/models"
import type React from "react"
import type { IconType } from "react-icons"

interface ModelSelectorProps {
  availableModels: AIModel[]
  selectedModel: string
  onModelChange: (modelId: string) => void
}

interface CapabilityConfig {
  icon: IconType
  label: string
  color: string
  searchTerms: string[]
}

const capabilityConfig: Record<string, CapabilityConfig> = {
  reasoning: {
    icon: Brain,
    label: "Reasoning",
    color: "text-violet-600 dark:text-violet-400",
    searchTerms: ["reasoning", "logic", "thinking", "analysis", "smart", "intelligent", "brain", "cognitive"],
  },
  attachment: {
    icon: FileText,
    label: "Files",
    color: "text-orange-600 dark:text-orange-400",
    searchTerms: ["attachment", "file", "upload", "document", "pdf", "image", "vision"],
  },
  search: {
    icon: SearchIcon,
    label: "Search",
    color: "text-emerald-600 dark:text-emerald-400",
    searchTerms: ["search", "web", "internet", "browse", "find", "lookup", "query", "google", "bing"],
  },
}

const searchSuggestions = [
  { query: "reasoning", label: "Reasoning Models", icon: Brain },
  { query: "image generation", label: "Image Creation", icon: ImageIcon },
  { query: "vision", label: "Vision Models", icon: Eye },
  { query: "available", label: "Available Models", icon: TrendingUp },
  { query: "gpt", label: "GPT Models", icon: Sparkles },
  { query: "claude", label: "Claude Models", icon: Bot },
]

const AnimatedWrapper = memo<{
  children: React.ReactNode
  show: boolean
  delay?: number
}>(({ children, show, delay = 0 }) => {
  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
      }`}
      style={{
        transitionDelay: show ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </div>
  )
})

AnimatedWrapper.displayName = "AnimatedWrapper"

const SearchSuggestions = memo<{
  suggestions: typeof searchSuggestions
  onSuggestionClick: (query: string) => void
  currentQuery: string
}>(({ suggestions, onSuggestionClick, currentQuery }) => {
  if (currentQuery.trim()) return null

  return (
    <div className="border-b border-gray-100 p-3 dark:border-gray-800">
      <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Quick searches</div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => {
          const SuggestionIcon = suggestion.icon
          return (
            <button
              key={suggestion.query}
              onClick={() => onSuggestionClick(suggestion.query)}
              className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <SuggestionIcon className="h-3 w-3" />
              {suggestion.label}
            </button>
          )
        })}
      </div>
    </div>
  )
})

SearchSuggestions.displayName = "SearchSuggestions"

const HighlightedText = memo<{
  text: string
  searchQuery: string
  className?: string
}>(({ text, searchQuery, className = "" }) => {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)

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
        ),
      )}
    </span>
  )
})

HighlightedText.displayName = "HighlightedText"

const CapabilityBadges = memo<{
  capabilities: Record<string, boolean> | undefined
  size?: "sm" | "xs"
  showIcons?: boolean
}>(({ capabilities, size = "sm", showIcons = true }) => {
  if (!capabilities) return null

  const activeCapabilities = Object.entries(capabilities)
    .filter(([_, isActive]) => isActive)
    .map(([key]) => key)
    .filter((key) => capabilityConfig[key])

  if (activeCapabilities.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {activeCapabilities.map((capability) => {
        const config = capabilityConfig[capability]
        const CapabilityIcon = config.icon
        return (
          <Badge
            key={capability}
            variant="secondary"
            className={`flex items-center gap-1 ${
              size === "xs" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-xs"
            } bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300`}
          >
            {showIcons && <CapabilityIcon className={`${size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} ${config.color}`} />}
            <span className="font-medium">{config.label}</span>
          </Badge>
        )
      })}
    </div>
  )
})

CapabilityBadges.displayName = "CapabilityBadges"

const ModelCard = memo<{
  model: AIModel
  isSelected: boolean
  onClick: () => void
  searchQuery?: string
  index: number
  isAvailable: boolean
  matchScore?: number
}>(({ model, isSelected, onClick, searchQuery = "", index, isAvailable, matchScore = 0 }) => {
  const ModelIcon = model.icon

  return (
    <AnimatedWrapper show={true} delay={index * 50}>
      <div
        className={`group relative transform ${isAvailable ? "cursor-pointer" : ""} rounded-xl border p-4 transition-all duration-300 sm:p-5 ${
          isSelected
            ? "border-purple-200 bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 shadow-lg ring-2 ring-purple-100 dark:border-purple-700 dark:from-purple-950/30 dark:via-purple-950/30 dark:to-pink-950/30 dark:ring-purple-900/50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 dark:hover:bg-gray-800"
        } ${isAvailable ? "" : "cursor-not-allowed select-none opacity-50"} ${
          matchScore > 0.8 ? "ring-2 ring-green-200 dark:ring-green-800" : ""
        }`}
        onClick={isAvailable ? onClick : undefined}
      >
        {isSelected && (
          <div className="absolute -right-2 -top-2 animate-bounce rounded-full bg-gradient-to-br from-purple-500 to-purple-600 p-1.5 shadow-lg">
            <Star className="h-3 w-3 fill-current text-white" />
          </div>
        )}

        {matchScore > 0.8 && searchQuery && (
          <div className="absolute -left-2 -top-2 rounded-full bg-green-500 p-1.5 shadow-lg">
            <TrendingUp className="h-3 w-3 text-white" />
          </div>
        )}

        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:h-12 sm:w-12 ${
              isSelected
                ? "bg-gradient-to-br from-purple-500 via-purple-500 to-pink-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-600"
            }`}
          >
            <ModelIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <HighlightedText
                text={model.name}
                searchQuery={searchQuery}
                className="truncate text-sm font-semibold text-gray-900 transition-all duration-300 dark:text-gray-100 sm:text-base"
              />
            </div>

            <HighlightedText
              text={model.description}
              searchQuery={searchQuery}
              className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300 sm:text-sm"
            />
            <CapabilityBadges capabilities={model.capabilities} size="sm" />
          </div>
        </div>
      </div>
    </AnimatedWrapper>
  )
})

ModelCard.displayName = "ModelCard"

const ModelSelectItem = memo<{
  model: AIModel
  searchQuery?: string
}>(({ model, searchQuery = "" }) => {
  const ModelIcon = model.icon
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
            <HighlightedText
              text={model.name}
              searchQuery={searchQuery}
              className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
            />
          </div>
          <CapabilityBadges capabilities={model.capabilities} size="xs" showIcons={false} />
        </div>
      </div>
    </SelectItem>
  )
})

ModelSelectItem.displayName = "ModelSelectItem"

const ProviderSection = memo<{
  provider: string
  models: AIModel[]
  selectedModel: string
  onModelSelect: (modelId: string) => void
  searchQuery: string
  index: number
  availableModels: AIModel[]
}>(({ provider, models, selectedModel, onModelSelect, searchQuery, index, availableModels }) => {
  return (
    <AnimatedWrapper show={true} delay={index * 100}>
      <div className="space-y-4">
        <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg bg-white py-2 dark:bg-gray-900">
          <div className="rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-2 dark:from-gray-800 dark:to-gray-700">
            <Zap className="h-4 w-4 text-gray-600 dark:text-gray-300 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">
              <HighlightedText text={provider} searchQuery={searchQuery} />
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">{models.length} model</p>
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
  )
})

ProviderSection.displayName = "ProviderSection"

export const ModelSelector = memo<ModelSelectorProps>(({ availableModels, selectedModel, onModelChange }) => {
  const { hasAnyKeys } = useKeys()
  const { openModal } = useSettingsModal()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownSearch, setDropdownSearch] = useState("")
  const dropdownSearchRef = useRef<HTMLInputElement>(null)
  const modalSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (modalSearchRef.current && isModalOpen) {
      modalSearchRef.current.focus()
    }
  }, [isModalOpen])

  useEffect(() => {
    if (isDropdownOpen) {
      const timer = setTimeout(() => {
        if (dropdownSearchRef.current) {
          dropdownSearchRef.current.focus()
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isDropdownOpen])

  const groupedByProvider = useMemo(() => {
    const emptyRecord: Record<string, AIModel[]> = {}
    return AI_MODELS.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = []
      }
      acc[model.provider].push(model)
      return acc
    }, emptyRecord)
  }, [])

  const calculateMatchScore = useCallback(
    (model: AIModel, query: string): number => {
      if (!query.trim()) return 0

      const lowerQuery = query.toLowerCase()
      let score = 0

      if (model.name.toLowerCase() === lowerQuery) score += 1.0
      else if (model.name.toLowerCase().includes(lowerQuery)) score += 0.8

      if (model.provider.toLowerCase().includes(lowerQuery)) score += 0.6

      if (model.description.toLowerCase().includes(lowerQuery)) score += 0.4

      Object.entries(model.capabilities ?? {}).forEach(([key, value]) => {
        if (!value) return
        const config = capabilityConfig[key]
        if (!config) return

        if (config.label.toLowerCase().includes(lowerQuery)) score += 0.7
        config.searchTerms.forEach((term) => {
          if (term.toLowerCase().includes(lowerQuery) || lowerQuery.includes(term.toLowerCase())) {
            score += 0.3
          }
        })
      })

      const isAvailable = availableModels.some((m) => m.id === model.id)
      if (lowerQuery === "available" && isAvailable) score += 0.9
      if (lowerQuery === "unavailable" && !isAvailable) score += 0.9

      return Math.min(score, 1.0)
    },
    [availableModels],
  )

  const filterModels = useCallback(
    (models: AIModel[], query: string) => {
      if (!query.trim()) return models

      return models
        .map((model) => ({
          model,
          score: calculateMatchScore(model, query),
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ model }) => model)
    },
    [calculateMatchScore],
  )

  const filteredDropdownModels = useMemo(() => {
    const emptyRecord: Record<string, AIModel[]> = {}
    const filtered = filterModels(availableModels, dropdownSearch)
    return filtered.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = []
      }
      acc[model.provider].push(model)
      return acc
    }, emptyRecord)
  }, [availableModels, dropdownSearch, filterModels])

  const selectedModelData = useMemo(
    () => availableModels.find((m) => m.id === selectedModel),
    [availableModels, selectedModel],
  )

  const groupedFilteredForModal = useMemo(() => {
    const emptyRecord: Record<string, AIModel[]> = {}
    return Object.entries(groupedByProvider).reduce((acc, [provider, models]) => {
      const filtered = filterModels(models, searchQuery)
      if (filtered.length > 0) {
        acc[provider] = filtered
      }
      return acc
    }, emptyRecord)
  }, [groupedByProvider, searchQuery, filterModels])

  const handleModelSelect = useCallback(
    (modelId: string) => {
      onModelChange(modelId)
      setIsModalOpen(false)
    },
    [onModelChange],
  )

  const handleModalSuggestionClick = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const clearSearchQuery = useCallback(() => setSearchQuery(""), [])
  const clearDropdownSearch = useCallback(() => setDropdownSearch(""), [])

  const SelectedIcon = selectedModelData?.icon

  const totalResults = useMemo(() => {
    return Object.values(groupedFilteredForModal).reduce((sum, models) => sum + models.length, 0)
  }, [groupedFilteredForModal])

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedModel} onValueChange={onModelChange} onOpenChange={setIsDropdownOpen}>
        <SelectTrigger className="h-10 w-[180px] rounded-lg border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 sm:w-[220px] lg:w-[260px]">
          <SelectValue placeholder="Select AI Model">
            {selectedModelData && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 via-purple-500 to-pink-500 text-white shadow-sm sm:h-6 sm:w-6">
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
          <div
            className="border-b border-gray-100 p-3 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()} // Prevent Select from closing when clicking in search area
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                key="dropdown-search" // Add stable key
                placeholder="Search models, capabilities, availability..."
                value={dropdownSearch}
                ref={dropdownSearchRef}
                onChange={(e) => {
                  e.stopPropagation() // Prevent event bubbling
                  setDropdownSearch(e.target.value)
                }}
                onKeyDown={(e) => {
                  e.stopPropagation() // Prevent Select from handling key events
                }}
                onFocus={(e) => {
                  e.stopPropagation() // Prevent Select from handling focus events
                }}
                className="h-9 border-gray-200 bg-gray-50 pl-10 pr-10 text-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800"
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
            {Object.keys(filteredDropdownModels).length === 0 ? (
              <AnimatedWrapper show={true}>
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  <Filter className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="font-medium">No available models found</p>
                  {!hasAnyKeys ? (
                    <p className="mt-1 text-xs">
                      Please{" "}
                      <span className="cursor-pointer text-purple-500 underline" onClick={() => openModal()}>
                        add an API key
                      </span>{" "}
                      to your account to use this feature.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs">Try different keywords</p>
                  )}
                </div>
              </AnimatedWrapper>
            ) : (
              Object.entries(filteredDropdownModels).map(([provider, models]) => (
                <div key={provider}>
                  <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    <Zap className="h-3 w-3" />
                    <HighlightedText text={provider} searchQuery={dropdownSearch} />
                    <span className="text-xs text-gray-500">({models.length})</span>
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
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search models, capabilities, availability..."
                  value={searchQuery}
                  ref={modalSearchRef}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 border-gray-200 bg-gray-50 pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-purple-400"
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

          <SearchSuggestions
            suggestions={searchSuggestions}
            onSuggestionClick={handleModalSuggestionClick}
            currentQuery={searchQuery}
          />

          <div className="min-h-0 flex-1 overflow-y-auto py-4 sm:py-6">
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
  )
})

ModelSelector.displayName = "ModelSelector"

export default ModelSelector

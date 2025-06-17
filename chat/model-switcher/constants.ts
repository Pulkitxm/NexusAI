import { Brain, FileText, SearchIcon, ImageIcon, Eye, TrendingUp, Sparkles, Bot } from "lucide-react";

import type { CapabilityConfig, SearchSuggestion } from "@/types/model-selector";

export const CAPABILITY_CONFIG: Record<string, CapabilityConfig> = {
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

export const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { query: "reasoning", label: "Reasoning Models", icon: Brain },
  { query: "image generation", label: "Image Creation", icon: ImageIcon },
  { query: "vision", label: "Vision Models", icon: Eye },
  { query: "available", label: "Available Models", icon: TrendingUp },
  { query: "gpt", label: "GPT Models", icon: Sparkles },
  { query: "claude", label: "Claude Models", icon: Bot }
];

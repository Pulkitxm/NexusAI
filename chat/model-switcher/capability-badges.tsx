import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { HighlightedText } from "@/components/ui/highlighted-text";

import { CAPABILITY_CONFIG } from "./constants";

import type { Capabilities } from "@/types/chat";

interface CapabilityBadgesProps {
  capabilities?: Capabilities;
  size?: "sm" | "xs" | "lg";
  showIcons?: boolean;
  searchQuery?: string;
}

export const CapabilityBadges = memo<CapabilityBadgesProps>(
  ({ capabilities, size = "sm", showIcons = true, searchQuery = "" }) => {
    if (!capabilities) return null;

    const activeCapabilities = Object.entries(capabilities)
      .filter(([, isActive]) => isActive)
      .map(([key]) => key)
      .filter((key) => CAPABILITY_CONFIG[key]);

    if (activeCapabilities.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5">
        {activeCapabilities.map((capability) => {
          const config = CAPABILITY_CONFIG[capability];
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
              className={`flex items-center gap-1.5 transition-all duration-200 ${
                size === "xs" ? "px-2 py-0.5 text-xs" : size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
              } ${
                isHighlighted
                  ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:ring-yellow-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {showIcons && (
                <CapabilityIcon
                  className={`${size === "xs" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} ${config.color}`}
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
  }
);

CapabilityBadges.displayName = "CapabilityBadges";

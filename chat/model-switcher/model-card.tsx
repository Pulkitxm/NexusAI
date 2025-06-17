"use client";

import { Star, TrendingUp } from "lucide-react";
import { memo } from "react";

import { AnimatedWrapper } from "@/components/ui/animated-wrapper";
import { HighlightedText } from "@/components/ui/highlighted-text";

import { CapabilityBadges } from "./capability-badges";

import type { ModelCardProps } from "@/types/model-selector";

export const ModelCard = memo<ModelCardProps>(
  ({ model, isSelected, onClick, searchQuery = "", index, isAvailable, matchScore = 0 }) => {
    const ModelIcon = model.icon;

    return (
      <AnimatedWrapper show={true} delay={index * 30}>
        <div
          className={`group relative transform ${
            isAvailable ? "cursor-pointer" : ""
          } rounded-xl border p-5 transition-all duration-300 hover:shadow-lg ${
            isSelected
              ? "border-purple-200 bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 shadow-lg ring-2 ring-purple-200 dark:border-purple-700 dark:from-purple-950/30 dark:via-purple-950/30 dark:to-pink-950/30 dark:ring-purple-800"
              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 dark:hover:bg-gray-800"
          } ${isAvailable ? "" : "cursor-not-allowed opacity-60 select-none"} ${
            matchScore > 0.8 ? "ring-2 ring-purple-200 dark:ring-purple-800" : ""
          }`}
          onClick={isAvailable ? onClick : undefined}
        >
          {isSelected && (
            <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 p-2 shadow-lg">
              <Star className="h-3.5 w-3.5 fill-current text-white" />
            </div>
          )}

          {matchScore > 0.8 && searchQuery && (
            <div className="absolute -top-2 -left-2 rounded-full bg-purple-500 p-2 shadow-lg">
              <TrendingUp className="h-3.5 w-3.5 text-white" />
            </div>
          )}

          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-br from-purple-500 via-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 group-hover:scale-105 group-hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-600"
              }`}
            >
              <ModelIcon className="h-7 w-7" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <HighlightedText
                  text={model.name}
                  searchQuery={searchQuery}
                  className="truncate text-base font-semibold text-gray-900 transition-all duration-200 dark:text-gray-100"
                />
              </div>

              <HighlightedText
                text={model.description}
                searchQuery={searchQuery}
                className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300"
              />

              <CapabilityBadges
                capabilities={model.capabilities}
                size="lg"
                showIcons={true}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      </AnimatedWrapper>
    );
  }
);

ModelCard.displayName = "ModelCard";

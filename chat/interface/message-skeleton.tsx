"use client";

import { Bot, User } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageSkeletonProps {
  isUser?: boolean;
  lines?: number;
}

export function MessageSkeleton({ isUser = false, lines = 3 }: MessageSkeletonProps) {
  return (
    <div className={`group mb-6 flex will-change-transform ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] min-w-0 flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`relative rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 ${
            isUser
              ? "rounded-br-md border-purple-400/20 bg-gradient-to-br from-purple-500 to-purple-600"
              : "rounded-bl-md border-slate-200/60 bg-white/90 text-slate-800 dark:border-slate-700/60 dark:bg-slate-800/90 dark:text-slate-200"
          }`}
        >
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton
                key={index}
                className={`h-4 ${isUser ? "bg-purple-400/50" : "bg-slate-300 dark:bg-slate-600"}`}
                style={{
                  width: `${Math.random() * 40 + 60}%`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

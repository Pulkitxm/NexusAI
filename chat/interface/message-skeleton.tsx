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
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </Avatar>
      )}

      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${isUser ? "bg-blue-600" : "bg-gray-100 dark:bg-gray-800"}`}>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              className={`h-4 ${isUser ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
              style={{
                width: `${Math.random() * 40 + 60}%`
              }}
            />
          ))}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        </Avatar>
      )}
    </div>
  );
}

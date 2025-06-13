"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollToBottomButtonProps {
  show: boolean;
  onClick: () => void;
}

export function ScrollToBottomButton({
  show,
  onClick,
}: ScrollToBottomButtonProps) {
  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 transform -translate-x-1/2 transition-all duration-300 z-20",
        show
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <Button
        onClick={onClick}
        variant="secondary"
        size="sm"
        className="h-10 px-4 rounded-full shadow-lg bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 backdrop-blur-sm hover:shadow-xl transition-all duration-200"
      >
        <ChevronDown className="h-4 w-4 mr-2" />
        Scroll to bottom
      </Button>
    </div>
  );
}

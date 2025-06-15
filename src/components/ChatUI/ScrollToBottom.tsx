"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useSidebar } from "../sidebar";

interface ScrollToBottomButtonProps {
  show: boolean;
  onClick: () => void;
}

export function ScrollToBottomButton({ show, onClick }: ScrollToBottomButtonProps) {
  const { open } = useSidebar();
  return (
    <div
      className={cn(
        "fixed bottom-28 z-20 -translate-x-1/2 transform transition-all duration-300",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        open ? "left-[57%]" : "left-1/2"
      )}
    >
      <Button
        onClick={onClick}
        variant="secondary"
        size="sm"
        className="h-10 rounded-full border border-slate-200 bg-white/90 px-4 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800/90"
      >
        <ChevronDown className="mr-2 h-4 w-4" />
        Scroll to bottom
      </Button>
    </div>
  );
}

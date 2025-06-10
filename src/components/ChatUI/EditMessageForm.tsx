"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, User } from "lucide-react";

interface EditMessageFormProps {
  message: { content: string; id: string };
  onSave: (newContent: string) => void;
  onCancel: () => void;
}

export function EditMessageForm({
  message,
  onSave,
  onCancel,
}: EditMessageFormProps) {
  const [content, setContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSave = () => {
    if (content.trim() && content !== message.content) {
      onSave(content.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 flex-row-reverse animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
        <User className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      <div className="flex-1 max-w-[85%] sm:max-w-[80%] bg-white dark:bg-slate-800 border-2 border-amber-500 dark:border-amber-400 rounded-2xl rounded-tr-md p-3 sm:p-4 shadow-lg ml-auto">
        <div className="flex items-center justify-between mb-2 sm:mb-3 opacity-70">
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Editing Message
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[48px] max-h-[200px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm leading-relaxed"
          placeholder="Edit your message..."
        />

        <div className="flex justify-end gap-2 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-200 dark:border-slate-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!content.trim() || content === message.content}
            className="h-7 sm:h-8 px-2 sm:px-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Save & Continue
          </Button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Press{" "}
          <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
            Cmd+Enter
          </kbd>{" "}
          to save,{" "}
          <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
            Esc
          </kbd>{" "}
          to cancel
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  SendHorizontal,
  Loader2,
  Command,
  AlertCircle,
  Sparkles,
  X,
  Mic,
  MicOff,
  TriangleAlert,
  Search,
  Brain,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

import { useChat } from "@/providers/chat-provider";
import { useModel } from "@/providers/model-provider";
import { useKeys } from "@/providers/key-provider";
import { getAvailableModels, AI_MODELS } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MESSAGE_LIMIT } from "@/lib/data";
import { SpeechToTextService } from "@/lib/speech-to-text";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EnhancedChatInputProps {
  onShowShortcuts: () => void;
}

export function ChatInput({ onShowShortcuts }: EnhancedChatInputProps) {
  const {
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    inputRef,
    messageCount,
    showWarning,
    setShowWarning,
    micError,
    setMicError,
    setInput,
    webSearch,
    setWebSearch,
    reasoning,
    setReasoning,
  } = useChat();

  const { selectedModel } = useModel();
  const { keys } = useKeys();
  const selectedModelDetails = useMemo(() => {
    return AI_MODELS.find((m) => m.id === selectedModel);
  }, [selectedModel]);
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const speechToTextServiceRef = useRef<SpeechToTextService | null>(null);
  const { status } = useSession();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input, inputRef]);

  useEffect(() => {
    speechToTextServiceRef.current = new SpeechToTextService();
    if (!speechToTextServiceRef.current.isSupported()) {
      setMicError("Speech Recognition is not supported by your browser.");
    }

    return () => {
      speechToTextServiceRef.current?.abort();
    };
  }, [setMicError]);

  const toggleRecording = useCallback(async () => {
    const service = speechToTextServiceRef.current;
    if (!service) {
      setMicError("Speech Recognition API not initialized.");
      return;
    }

    setMicError(null);

    if (isRecording) {
      setIsRecording(false);
      service.stop();
    } else {
      setInput("");
      try {
        await service.start(
          (transcript) => {
            setInput(transcript);
          },
          (error) => {
            setIsRecording(false);
            setMicError(error);
          },
          () => {
            setIsRecording(true);
            setMicError(null);
          },
          () => {
            setIsRecording(false);
          }
        );
        inputRef.current?.focus();
      } catch (err) {
        setIsRecording(false);
        if (typeof err === "string") {
          setMicError(err);
        } else {
          setMicError("An unknown error occurred during microphone access.");
        }
      }
    }
  }, [isRecording, setMicError, setInput, inputRef]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsFocused(false);
        inputRef.current?.blur();
      }

      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (e.key.toLowerCase() === "m" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        if (speechToTextServiceRef.current?.isSupported()) {
          toggleRecording();
        } else {
          setMicError("Speech recognition not available for shortcut.");
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [inputRef, toggleRecording, setMicError]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e);
      }
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "/") {
      e.preventDefault();
      onShowShortcuts();
    }
  };

  const isLimitReached = status === "unauthenticated" && messageCount >= MESSAGE_LIMIT;
  const remainingMessages = MESSAGE_LIMIT - messageCount;

  return (
    <div className="sticky bottom-0 z-10">
      {status === "unauthenticated" && (
        <div className="flex justify-center mb-1">
          {(showWarning || isLimitReached) && (
            <div
              className={cn(
                "flex items-center gap-2 text-xs px-4 py-2 rounded-full transition-all duration-300",
                "backdrop-blur-md border shadow-lg",
                isLimitReached
                  ? "text-red-600 dark:text-red-400 bg-red-50/90 dark:bg-red-950/50 border-red-200 dark:border-red-800 shadow-red-100 dark:shadow-red-950/50"
                  : remainingMessages < 5
                    ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50/90 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800 shadow-yellow-100 dark:shadow-yellow-950/50"
                    : "text-emerald-600 dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 shadow-emerald-100 dark:shadow-emerald-950/50"
              )}
            >
              {isLimitReached ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span className="font-medium">No messages left</span>
                  <div className="w-px h-4 bg-red-300 dark:bg-red-700" />
                  <button
                    onClick={() => signIn("google")}
                    className="text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 font-semibold underline underline-offset-2 transition-colors"
                  >
                    Sign in to continue
                  </button>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    <span className="font-semibold">{remainingMessages}</span> messages remaining.{" "}
                    <span onClick={() => signIn("google")} className="underline cursor-pointer">
                      Log in
                    </span>{" "}
                    to use more
                  </span>
                  <button
                    onClick={() => setShowWarning(false)}
                    className="ml-1 p-0.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                    aria-label="Dismiss warning"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {micError && (
        <div className="flex justify-center mb-1">
          <div
            className={cn(
              "flex items-center gap-2 text-xs px-4 py-2 rounded-full transition-all duration-300",
              "backdrop-blur-md border shadow-lg",
              "text-red-600 dark:text-red-400 bg-red-50/90 dark:bg-red-950/50 border-red-200 dark:border-red-800 shadow-red-100 dark:shadow-red-950/50"
            )}
          >
            <TriangleAlert className="h-3.5 w-3.5" />
            <span className="font-medium">{micError}</span>
            <button
              onClick={() => setMicError(null)}
              className="ml-1 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
              aria-label="Dismiss microphone error"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 pt-2">
        <form onSubmit={handleSubmit} className="relative">
          <div
            className={cn(
              "relative flex items-end gap-3 p-4 rounded-xl transition-all duration-200",
              "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-700",
              "backdrop-blur-sm",
              isFocused && "border-zinc-300 dark:border-slate-600 shadow-lg shadow-zinc-200/10 dark:shadow-slate-950/30"
            )}
          >
            <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-zinc-400 dark:text-slate-500">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400/70 dark:bg-red-400/60" />
                <div className="w-2 h-2 rounded-full bg-yellow-400/70 dark:bg-yellow-400/60" />
                <div className="w-2 h-2 rounded-full bg-green-400/70 dark:bg-green-400/60" />
              </div>
            </div>

            <div className="flex-1 mt-4">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={onKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="// Ask me anything..."
                className={cn(
                  "min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent",
                  "px-0 py-0 text-sm font-mono leading-relaxed",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 outline-none",
                  "placeholder:text-zinc-400 dark:placeholder:text-slate-400 placeholder:font-mono",
                  "text-zinc-900 dark:text-slate-100"
                )}
                disabled={isLoading}
              />

              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded text-[10px] font-mono text-zinc-600 dark:text-slate-300">
                      ⏎
                    </kbd>
                    <span className="text-zinc-500 dark:text-slate-400">send</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded text-[10px] font-mono text-zinc-600 dark:text-slate-300">
                      ⇧⏎
                    </kbd>
                    <span className="text-zinc-500 dark:text-slate-400">new line</span>
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {webSearch !== null && (
                    <div className="flex items-center gap-2 text-black">
                      <Label htmlFor="web-search" className="text-xs">
                        <Search className="h-3.5 w-3.5" />
                      </Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="web-search"
                          checked={webSearch}
                          onCheckedChange={(val)=>setWebSearch(val)}
                          disabled={!selectedModelDetails?.capabilities?.search}
                        />
                      </div>
                    </div>
                  )}

                  {reasoning && (
                    <div className="flex items-center gap-2 text-black">
                      <Brain className="h-3.5 w-3.5" />
                      <Select
                        value={reasoning || "none"}
                        onValueChange={(value) =>
                          setReasoning(value === "none" ? null : (value as "high" | "medium" | "low"))
                        }
                        disabled={!selectedModelDetails?.capabilities?.reasoning}
                      >
                        <SelectTrigger className="h-6 w-[100px] text-xs">
                          <SelectValue placeholder="Reasoning" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Existing controls */}
                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={toggleRecording}
                        disabled={!speechToTextServiceRef.current?.isSupported()}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200",
                          "text-zinc-400 dark:text-slate-400 hover:text-zinc-600 dark:hover:text-slate-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:focus-visible:ring-purple-400",
                          isRecording && "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/50",
                          !speechToTextServiceRef.current?.isSupported() && "opacity-50 cursor-not-allowed"
                        )}
                        aria-label={isRecording ? "Stop speech recognition" : "Start speech recognition"}
                        role="switch"
                        aria-checked={isRecording}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="h-3.5 w-3.5" />
                            <span className="font-mono">stop</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-3.5 w-3.5" />
                            <span className="font-mono">speak</span>
                          </>
                        )}
                      </button>

                      {micError && !isRecording ? (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-red-600 text-white rounded opacity-100 pointer-events-auto whitespace-nowrap">
                          {micError}
                        </div>
                      ) : (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          Press {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
                          +Shift+M to {isRecording ? "stop" : "start"} recording
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={onShowShortcuts}
                      className="flex items-center gap-1 text-zinc-400 dark:text-slate-400 hover:text-zinc-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <Command className="h-3 w-3" />
                      <span className="font-mono">shortcuts</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                "h-10 w-10 rounded-lg shrink-0 transition-all duration-200",
                "focus-visible:ring-0 outline-none border-0 self-center",
                input.trim() && !isLoading
                  ? "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-500/20 hover:shadow-purple-500/40"
                  : "bg-zinc-200 dark:bg-slate-700 text-zinc-400 dark:text-slate-500 cursor-not-allowed"
              )}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

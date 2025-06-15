"use client";

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
  Brain
} from "lucide-react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { FileUploadCards } from "@/components/ui/file-upload-cards";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MESSAGE_LIMIT, OPENROUTER_ICON } from "@/lib/data";
import { AI_MODELS } from "@/lib/models";
import { SpeechToTextService } from "@/lib/speech-to-text";
import { cn } from "@/lib/utils";
import { useChat } from "@/providers/chat-provider";
import { useKeys } from "@/providers/key-provider";
import { useModel } from "@/providers/model-provider";

import type React from "react";

interface EnhancedChatInputProps {
  onShowShortcuts: () => void;
}

export function ChatInput({ onShowShortcuts }: EnhancedChatInputProps) {
  const { canUseOpenRouter } = useKeys();
  const {
    input,
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
    useOpenRouter,
    setUseOpenRouter
  } = useChat();

  const { selectedModel } = useModel();
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
    <TooltipProvider delayDuration={300}>
      <div className="sticky bottom-0 z-10">
        {status === "unauthenticated" && (
          <div className="mb-1 flex justify-center">
            {(showWarning || isLimitReached) && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-all duration-300",
                  "border shadow-lg backdrop-blur-md",
                  isLimitReached
                    ? "border-red-200 bg-red-50/90 text-red-600 shadow-red-100 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400 dark:shadow-red-950/50"
                    : remainingMessages < 5
                      ? "border-yellow-200 bg-yellow-50/90 text-yellow-600 shadow-yellow-100 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400 dark:shadow-yellow-950/50"
                      : "border-emerald-200 bg-emerald-50/90 text-emerald-600 shadow-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 dark:shadow-emerald-950/50"
                )}
              >
                {isLimitReached ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span className="font-medium">No messages left</span>
                    <div className="h-4 w-px bg-red-300 dark:bg-red-700" />
                    <button
                      onClick={() => signIn("google")}
                      className="font-semibold text-red-700 underline underline-offset-2 transition-colors hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
                    >
                      Sign in to continue
                    </button>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      <span className="font-semibold">{remainingMessages}</span> messages remaining.{" "}
                      <span onClick={() => signIn("google")} className="cursor-pointer underline">
                        Log in
                      </span>{" "}
                      to use more
                    </span>
                    <button
                      onClick={() => setShowWarning(false)}
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900"
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
          <div className="mb-1 flex justify-center">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-all duration-300",
                "border shadow-lg backdrop-blur-md",
                "border-red-200 bg-red-50/90 text-red-600 shadow-red-100 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400 dark:shadow-red-950/50"
              )}
            >
              <TriangleAlert className="h-3.5 w-3.5" />
              <span className="font-medium">{micError}</span>
              <button
                onClick={() => setMicError(null)}
                className="ml-1 rounded-full p-0.5 transition-colors hover:bg-red-100 dark:hover:bg-red-900"
                aria-label="Dismiss microphone error"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        <FileUploadCards />

        <div className="mx-auto max-w-4xl p-4 pt-2">
          <form onSubmit={handleSubmit} className="relative">
            <div
              className={cn(
                "relative flex items-end gap-3 rounded-xl p-4 transition-all duration-200",
                "border border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900",
                "backdrop-blur-sm",
                isFocused &&
                  "border-zinc-300 shadow-lg shadow-zinc-200/10 dark:border-slate-600 dark:shadow-slate-950/30"
              )}
            >
              <div className="absolute left-4 top-4 flex items-center gap-2 text-xs text-zinc-400 dark:text-slate-500">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-400/70 dark:bg-red-400/60" />
                  <div className="h-2 w-2 rounded-full bg-yellow-400/70 dark:bg-yellow-400/60" />
                  <div className="h-2 w-2 rounded-full bg-green-400/70 dark:bg-green-400/60" />
                </div>
              </div>

              <div className="mt-4 flex-1">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="// Ask me anything..."
                  className={cn(
                    "max-h-[120px] min-h-[44px] resize-none border-0 bg-transparent",
                    "px-0 py-0 font-mono text-sm leading-relaxed",
                    "outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                    "placeholder:font-mono placeholder:text-zinc-400 dark:placeholder:text-slate-400",
                    "text-zinc-900 dark:text-slate-100"
                  )}
                  disabled={isLoading}
                />

                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        ⏎
                      </kbd>
                      <span className="text-zinc-500 dark:text-slate-400">send</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        ⇧⏎
                      </kbd>
                      <span className="text-zinc-500 dark:text-slate-400">new line</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    {canUseOpenRouter && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 text-black dark:text-white">
                            <Label
                              htmlFor="openrouter-toggle"
                              className="flex cursor-pointer items-center gap-1.5 text-xs"
                            >
                              <OPENROUTER_ICON />
                              <span className="font-medium">OpenRouter</span>
                            </Label>
                            <Switch
                              id="openrouter-toggle"
                              checked={useOpenRouter}
                              onCheckedChange={(val) => setUseOpenRouter(val)}
                              className="data-[state=checked]:bg-purple-500 data-[state=checked]:text-purple-500 dark:data-[state=checked]:bg-purple-400 dark:data-[state=checked]:text-purple-400"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="border-slate-700 bg-slate-900 text-slate-100 dark:border-slate-300 dark:bg-slate-100 dark:text-slate-900"
                        >
                          <p className="text-sm">Use advanced OpenRouter models</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {webSearch !== null && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 text-black dark:text-white">
                            <Label
                              htmlFor="web-search-toggle"
                              className="flex cursor-pointer items-center gap-1.5 text-xs"
                            >
                              <Search className="h-3.5 w-3.5" />
                              <span className="font-medium">Web Search</span>
                            </Label>
                            <Switch
                              id="web-search-toggle"
                              checked={webSearch}
                              onCheckedChange={(val) => setWebSearch(val)}
                              disabled={!selectedModelDetails?.capabilities?.search}
                              className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-blue-500 dark:data-[state=checked]:bg-blue-400 dark:data-[state=checked]:text-blue-400"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="border-slate-700 bg-slate-900 text-slate-100 dark:border-slate-300 dark:bg-slate-100 dark:text-slate-900"
                        >
                          <p className="text-sm">Search the web for current information</p>
                          {!selectedModelDetails?.capabilities?.search && (
                            <p className="mt-1 text-xs text-amber-400 dark:text-amber-600">
                              Not available for current model
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {reasoning && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 text-black dark:text-white">
                            <Label htmlFor="reasoning-select" className="flex items-center gap-1.5 text-xs">
                              <Brain className="h-3.5 w-3.5" />
                              <span className="font-medium">Reasoning</span>
                            </Label>
                            <Select
                              value={reasoning || "none"}
                              onValueChange={(value) =>
                                setReasoning(value === "none" ? null : (value as "high" | "medium" | "low"))
                              }
                              disabled={!selectedModelDetails?.capabilities?.reasoning}
                            >
                              <SelectTrigger className="h-7 w-[90px] text-xs">
                                <SelectValue placeholder="Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="border-slate-700 bg-slate-900 text-slate-100 dark:border-slate-300 dark:bg-slate-100 dark:text-slate-900"
                        >
                          <p className="text-sm">Control AI thinking depth</p>
                          <p className="mt-1 text-xs text-slate-300 dark:text-slate-600">
                            Low: Fast • Medium: Balanced • High: Deep
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <div className="flex items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={toggleRecording}
                            disabled={!speechToTextServiceRef.current?.isSupported()}
                            className={cn(
                              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-all duration-200",
                              "text-zinc-400 hover:text-zinc-600 dark:text-slate-400 dark:hover:text-slate-200",
                              "hover:bg-zinc-100 dark:hover:bg-slate-800",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:focus-visible:ring-purple-400",
                              isRecording && "bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400",
                              !speechToTextServiceRef.current?.isSupported() && "cursor-not-allowed opacity-50"
                            )}
                            aria-label={isRecording ? "Stop speech recognition" : "Start speech recognition"}
                            role="switch"
                            aria-checked={isRecording}
                          >
                            {isRecording ? (
                              <>
                                <MicOff className="h-3.5 w-3.5" />
                                <span className="font-mono text-xs">stop</span>
                              </>
                            ) : (
                              <>
                                <Mic className="h-3.5 w-3.5" />
                                <span className="font-mono text-xs">speak</span>
                              </>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="border-slate-700 bg-slate-900 text-slate-100 dark:border-slate-300 dark:bg-slate-100 dark:text-slate-900"
                        >
                          <p className="text-sm">{isRecording ? "Stop recording" : "Start voice input"}</p>
                          <p className="mt-1 text-xs text-slate-300 dark:text-slate-600">
                            {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+Shift+M
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={onShowShortcuts}
                            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-zinc-400 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          >
                            <Command className="h-3.5 w-3.5" />
                            <span className="font-mono text-xs">shortcuts</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="border-slate-700 bg-slate-900 text-slate-100 dark:border-slate-300 dark:bg-slate-100 dark:text-slate-900"
                        >
                          <p className="text-sm">View keyboard shortcuts</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={cn(
                  "h-10 w-10 shrink-0 rounded-lg transition-all duration-200",
                  "self-center border-0 outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                  input.trim() && !isLoading
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25 hover:bg-purple-600 hover:shadow-purple-500/40 dark:bg-purple-600 dark:shadow-purple-500/20 dark:hover:bg-purple-500"
                    : "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-slate-700 dark:text-slate-500"
                )}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
}

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
  Brain,
  Upload,
  Settings
} from "lucide-react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { FileUploadCards } from "@/components/ui/file-upload-cards";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
import { useUploadAttachment } from "@/providers/upload-attachment-provider";
import { Provider, type Reasoning } from "@/types/providers";

import type React from "react";

type ChatInputProps =
  | {
      onShowShortcuts: () => void;
    }
  | {
      showForLoading: true;
      onShowShortcuts?: never;
    };

export function ChatInput(props: ChatInputProps) {
  const { canUseOpenRouter, haveOnlyOpenRouterKey } = useKeys();
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { selectedModel } = useModel();
  const selectedModelDetails = useMemo(() => {
    return AI_MODELS.find((m) => m.id === selectedModel);
  }, [selectedModel]);
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const speechToTextServiceRef = useRef<SpeechToTextService | null>(null);
  const { status } = useSession();
  const { UploadButton, isUploadSupported } = useUploadAttachment();

  const canUseReasoning = selectedModelDetails?.capabilities?.reasoning;
  const canUseWebSearch = selectedModelDetails?.capabilities?.search;

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
      if ("onShowShortcuts" in props) {
        props.onShowShortcuts?.();
      }
    }
  };

  const isLimitReached = status === "unauthenticated" && messageCount >= MESSAGE_LIMIT;
  const remainingMessages = MESSAGE_LIMIT - messageCount;

  const activeFeatures = [
    useOpenRouter && canUseOpenRouter && selectedModelDetails?.provider !== Provider.OpenRouter,
    webSearch,
    reasoning
  ].filter(Boolean).length;

  if ("showForLoading" in props && props.showForLoading) {
    return (
      <TooltipProvider delayDuration={300}>
        <div className="sticky bottom-0 z-10">
          <div className="mx-auto max-w-4xl p-4 pb-0">
            <div className="relative">
              <div
                className={cn(
                  "relative rounded-t-2xl border bg-white shadow-sm transition-all duration-200 dark:bg-slate-900",
                  "border-slate-200 dark:border-slate-700"
                )}
                style={{
                  borderColor: isDark ? "transparent" : undefined
                }}
              >
                <div className="flex items-end gap-3 p-4">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Ask me anything..."
                      className={cn(
                        "max-h-[120px] min-h-[44px] resize-none border-0 bg-transparent p-0",
                        "text-base leading-relaxed placeholder:text-slate-400",
                        "focus-visible:ring-0 focus-visible:ring-offset-0"
                      )}
                      disabled={true}
                    />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    disabled={true}
                    className="h-9 w-9 shrink-0 rounded-xl bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" disabled={true} className="h-8 w-8 p-0 opacity-50">
                      <Mic className="h-4 w-4" />
                    </Button>

                    <Button type="button" variant="ghost" size="sm" disabled={true} className="h-8 w-8 p-0 opacity-50">
                      <Upload className="h-4 w-4" />
                    </Button>

                    <Button type="button" variant="ghost" size="sm" disabled={true} className="h-8 w-8 p-0 opacity-50">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={true}
                      className="h-6 px-2 text-xs opacity-50"
                    >
                      <Command className="mr-1 h-3 w-3" />
                      Shortcuts
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="sticky bottom-0 z-10">
        {status === "unauthenticated" && (showWarning || isLimitReached) && (
          <div className="mb-2 flex justify-center">
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
                    className="font-semibold underline underline-offset-2 transition-colors hover:opacity-80"
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
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-current hover:bg-opacity-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {micError && (
          <div className="mb-2 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50/90 px-4 py-2 text-xs text-red-600 shadow-lg backdrop-blur-md dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
              <TriangleAlert className="h-3.5 w-3.5" />
              <span className="font-medium">{micError}</span>
              <button
                onClick={() => setMicError(null)}
                className="ml-1 rounded-full p-0.5 transition-colors hover:bg-red-100 dark:hover:bg-red-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        <FileUploadCards />

        <div className="mx-auto max-w-4xl p-4 pb-0">
          <form onSubmit={handleSubmit} className="relative">
            <div
              className={cn(
                "relative rounded-t-2xl border bg-white shadow-sm transition-all duration-200 dark:bg-slate-900",
                "border-slate-200 dark:border-slate-700",
                isFocused && "border-slate-300 shadow-md dark:border-slate-600"
              )}
              style={{
                borderColor: isDark ? "transparent" : undefined
              }}
            >
              <div className="flex items-end gap-3 p-4">
                <div className="flex-1">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ask me anything..."
                    className={cn(
                      "max-h-[120px] min-h-[44px] resize-none border-0 bg-transparent p-0",
                      "text-base leading-relaxed placeholder:text-slate-400",
                      "focus-visible:ring-0 focus-visible:ring-offset-0"
                    )}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-xl",
                    input.trim() && !isLoading
                      ? "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500"
                      : "bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                  )}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleRecording}
                        disabled={!speechToTextServiceRef.current?.isSupported()}
                        className={cn(
                          "h-8 w-8 p-0",
                          isRecording && "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400"
                        )}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{isRecording ? "Stop recording" : "Voice input"}</p>
                    </TooltipContent>
                  </Tooltip>

                  <UploadButton disabled={!isUploadSupported} className={isUploadSupported ? "" : "opacity-50"}>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </UploadButton>

                  <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "relative h-8 w-8 p-0",
                          activeFeatures > 0 && "text-purple-600 dark:text-purple-400"
                        )}
                      >
                        <Settings className="h-4 w-4" />
                        {activeFeatures > 0 && (
                          <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-purple-500" />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="w-80 p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span>Advanced Options</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAdvanced(false)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <Separator />

                        {!haveOnlyOpenRouterKey &&
                          selectedModelDetails?.provider !== Provider.OpenRouter &&
                          canUseOpenRouter && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <OPENROUTER_ICON />
                                <span className="text-sm font-medium">OpenRouter</span>
                              </div>
                              <Switch
                                checked={useOpenRouter}
                                onCheckedChange={setUseOpenRouter}
                                className="data-[state=checked]:bg-purple-500"
                              />
                            </div>
                          )}

                        {canUseWebSearch && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Search className="h-4 w-4" />
                              <span className="text-sm font-medium">Web Search</span>
                            </div>
                            <Switch
                              checked={webSearch ?? false}
                              onCheckedChange={setWebSearch}
                              disabled={!canUseWebSearch}
                              className="data-[state=checked]:bg-purple-500"
                            />
                          </div>
                        )}

                        {canUseReasoning && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              <span className="text-sm font-medium">Reasoning</span>
                            </div>
                            <Select
                              value={reasoning || "none"}
                              onValueChange={(value) => setReasoning(value === "none" ? null : (value as Reasoning))}
                            >
                              <SelectTrigger className="h-8 w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Off</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={props.onShowShortcuts}
                    className="h-6 px-2 text-xs"
                  >
                    <Command className="mr-1 h-3 w-3" />
                    Shortcuts
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </TooltipProvider>
  );
}
